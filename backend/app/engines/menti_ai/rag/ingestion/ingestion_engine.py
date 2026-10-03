"""Document Ingestion Engine for Phase 16 RAG Knowledge Base.
Coordinates Validation, Parsing, Normalization, Chunking, Embedding, and Indexing.
"""
import os
import json
import uuid
import threading
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple

from app.engines.menti_ai.rag.models.rag_models import (
    KnowledgeDocument,
    KnowledgeChunk,
    DocumentStatus,
    DocumentCategory
)
from app.engines.menti_ai.rag.ingestion.document_validator import DocumentValidator, DocumentValidationError
from app.engines.menti_ai.rag.ingestion.document_parser import ParserFactory
from app.engines.menti_ai.rag.ingestion.text_normalizer import TextNormalizer
from app.engines.menti_ai.rag.ingestion.chunker import DocumentChunker
from app.engines.menti_ai.rag.embeddings.base_provider import EmbeddingProvider
from app.engines.menti_ai.rag.vector_store.vector_store import MemoryVectorStore
from app.engines.menti_ai.rag.keyword_search.bm25_search import BM25SearchEngine


class DocumentIngestionEngine:
    """Orchestrates end-to-end knowledge ingestion pipeline."""

    def __init__(
        self,
        vector_store: MemoryVectorStore,
        bm25_engine: BM25SearchEngine,
        embedding_provider: EmbeddingProvider,
        chunker: Optional[DocumentChunker] = None,
        registry_path: Optional[str] = None
    ):
        self.vector_store = vector_store
        self.bm25_engine = bm25_engine
        self.embedding_provider = embedding_provider
        self.chunker = chunker or DocumentChunker(chunk_size=600, chunk_overlap=100)
        self._lock = threading.RLock()
        self._registry: Dict[str, KnowledgeDocument] = {}
        self._checksum_map: Dict[str, str] = {}  # checksum -> document_id
        self._registry_path = registry_path or os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
            "data", "rag", "documents_registry.json"
        )
        self._load_registry()

    def ingest_document(
        self,
        content_bytes: bytes,
        filename: str,
        title: Optional[str] = None,
        category: Optional[str] = None,
        subcategory: Optional[str] = None,
        description: str = "",
        source_reference: Optional[str] = None,
        allow_duplicate: bool = False
    ) -> Tuple[KnowledgeDocument, List[KnowledgeChunk], str]:
        """Ingest and index a new knowledge document."""
        with self._lock:
            # 1. Validation
            valid_meta, err_meta = DocumentValidator.validate_file_metadata(filename, len(content_bytes))
            if not valid_meta:
                raise DocumentValidationError(err_meta)

            valid_cont, err_cont, _ = DocumentValidator.validate_content(content_bytes, filename)
            if not valid_cont:
                raise DocumentValidationError(err_cont)

            checksum = DocumentValidator.calculate_checksum(content_bytes)

            # Check duplicate
            if not allow_duplicate and checksum in self._checksum_map:
                existing_doc_id = self._checksum_map[checksum]
                existing_doc = self._registry.get(existing_doc_id)
                if existing_doc and existing_doc.status != DocumentStatus.FAILED:
                    chunks = self.vector_store.get_document_chunks(existing_doc_id)
                    return existing_doc, chunks, f"Document already exists (ID: {existing_doc_id})."

            # Determine doc title and category
            doc_id = f"doc_{uuid.uuid4().hex[:12]}"
            doc_title = title or os.path.splitext(DocumentValidator.sanitize_path(filename))[0].replace("_", " ").title()
            doc_category = category or DocumentCategory.GENERAL.value
            ext = os.path.splitext(filename)[1].lower().replace(".", "")

            doc = KnowledgeDocument(
                document_id=doc_id,
                title=doc_title,
                description=description,
                category=doc_category,
                subcategory=subcategory,
                source_type=ext or "text",
                source_reference=source_reference or filename,
                version=1,
                status=DocumentStatus.DRAFT,
                checksum=checksum,
                created_at=datetime.utcnow().isoformat(),
                updated_at=datetime.utcnow().isoformat(),
                chunk_count=0
            )

            try:
                # 2. Parsing
                parser = ParserFactory.get_parser(filename)
                full_text, sections = parser.parse(content_bytes, filename)

                # 3. Normalization & Chunking
                chunks = self.chunker.chunk_document(doc, sections)
                if not chunks:
                    # Fallback single chunk if section parsing yielded no pieces
                    normalized = TextNormalizer.normalize(full_text)
                    if not normalized:
                        normalized = "Empty document"
                    single_chunk = KnowledgeChunk(
                        chunk_id=f"chk_{doc_id[:8]}_0",
                        document_id=doc_id,
                        document_version=1,
                        title=doc_title,
                        section="General",
                        category=doc_category,
                        subcategory=subcategory,
                        chunk_index=0,
                        text=normalized,
                        source_reference=doc.source_reference
                    )
                    chunks = [single_chunk]

                doc.chunk_count = len(chunks)

                # 4. Embeddings
                chunk_texts = [c.text for c in chunks]
                embeddings = self.embedding_provider.embed_documents(chunk_texts)

                # 5. Indexing
                self.vector_store.add_chunks(chunks, embeddings, status=DocumentStatus.ACTIVE.value)
                self.bm25_engine.add_chunks(chunks, status=DocumentStatus.ACTIVE.value)

                # 6. Activation
                doc.status = DocumentStatus.ACTIVE
                doc.updated_at = datetime.utcnow().isoformat()

                # Save to registry
                self._registry[doc.document_id] = doc
                self._checksum_map[checksum] = doc.document_id
                self._save_registry()

                return doc, chunks, f"Successfully ingested '{doc.title}' with {len(chunks)} chunks."

            except Exception as e:
                doc.status = DocumentStatus.FAILED
                self._registry[doc.document_id] = doc
                self._save_registry()
                raise e

    def reindex_document(self, document_id: str) -> Tuple[KnowledgeDocument, List[KnowledgeChunk], str]:
        """Re-index an existing document (e.g. after embedding provider change or version bump)."""
        with self._lock:
            doc = self._registry.get(document_id)
            if not doc:
                raise KeyError(f"Document with ID '{document_id}' not found.")

            # Get old chunks
            existing_chunks = self.vector_store.get_document_chunks(document_id)
            if not existing_chunks:
                return doc, [], "No existing chunks to re-index."

            # Increment version
            doc.version += 1
            doc.status = DocumentStatus.ACTIVE
            doc.updated_at = datetime.utcnow().isoformat()

            # Update chunk versions
            for c in existing_chunks:
                c.document_version = doc.version

            chunk_texts = [c.text for c in existing_chunks]
            embeddings = self.embedding_provider.embed_documents(chunk_texts)

            # Replace in vector store & BM25
            self.vector_store.delete_document(document_id)
            self.bm25_engine.delete_document(document_id)

            self.vector_store.add_chunks(existing_chunks, embeddings, status=DocumentStatus.ACTIVE.value)
            self.bm25_engine.add_chunks(existing_chunks, status=DocumentStatus.ACTIVE.value)

            self._registry[document_id] = doc
            self._save_registry()

            return doc, existing_chunks, f"Successfully re-indexed '{doc.title}' (v{doc.version})."

    def set_document_status(self, document_id: str, new_status: DocumentStatus) -> KnowledgeDocument:
        """Update status of a document (ACTIVE or ARCHIVED)."""
        with self._lock:
            doc = self._registry.get(document_id)
            if not doc:
                raise KeyError(f"Document with ID '{document_id}' not found.")

            doc.status = new_status
            doc.updated_at = datetime.utcnow().isoformat()

            self.vector_store.update_document_status(document_id, new_status.value)
            self.bm25_engine.update_document_status(document_id, new_status.value)

            self._save_registry()
            return doc

    def delete_document(self, document_id: str) -> bool:
        """Permanently delete a document and all indexed chunks."""
        with self._lock:
            doc = self._registry.pop(document_id, None)
            if not doc:
                return False

            if doc.checksum in self._checksum_map:
                self._checksum_map.pop(doc.checksum, None)

            self.vector_store.delete_document(document_id)
            self.bm25_engine.delete_document(document_id)
            self._save_registry()
            return True

    def get_document(self, document_id: str) -> Optional[KnowledgeDocument]:
        with self._lock:
            return self._registry.get(document_id)

    def list_documents(
        self,
        category: Optional[str] = None,
        status: Optional[DocumentStatus] = None
    ) -> List[KnowledgeDocument]:
        with self._lock:
            docs = list(self._registry.values())
            if category:
                docs = [d for d in docs if d.category.lower() == category.lower()]
            if status:
                docs = [d for d in docs if d.status == status]
            return sorted(docs, key=lambda d: d.created_at, reverse=True)

    def get_stats(self) -> Dict[str, Any]:
        with self._lock:
            active_count = sum(1 for d in self._registry.values() if d.status == DocumentStatus.ACTIVE)
            categories = list(set(d.category for d in self._registry.values()))
            return {
                "total_documents": len(self._registry),
                "active_documents": active_count,
                "total_chunks": self.vector_store.count(),
                "categories": sorted(categories)
            }

    def _save_registry(self) -> None:
        try:
            os.makedirs(os.path.dirname(self._registry_path), exist_ok=True)
            data = {
                "documents": [d.dict() for d in self._registry.values()],
                "checksum_map": self._checksum_map
            }
            with open(self._registry_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
        except Exception:
            pass

    def _load_registry(self) -> None:
        if not os.path.exists(self._registry_path):
            return
        try:
            with open(self._registry_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            for d_dict in data.get("documents", []):
                doc = KnowledgeDocument(**d_dict)
                self._registry[doc.document_id] = doc

            self._checksum_map = data.get("checksum_map", {})
        except Exception:
            pass
