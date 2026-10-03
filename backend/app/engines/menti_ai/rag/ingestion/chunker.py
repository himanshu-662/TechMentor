"""Semantic hierarchical chunking module for Phase 16 RAG Knowledge Base.
Uses LangChain's RecursiveCharacterTextSplitter for robust semantic text partitioning.
"""
import uuid
from typing import List, Optional
from datetime import datetime
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.engines.menti_ai.rag.models.rag_models import KnowledgeChunk, KnowledgeDocument
from app.engines.menti_ai.rag.ingestion.document_parser import ParsedSection
from app.engines.menti_ai.rag.ingestion.text_normalizer import TextNormalizer


class DocumentChunker:
    """Splits parsed sections into semantic chunks using LangChain's RecursiveCharacterTextSplitter."""

    def __init__(
        self,
        chunk_size: int = 600,
        chunk_overlap: int = 100,
        min_chunk_size: int = 80
    ):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.min_chunk_size = min_chunk_size
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""],
            keep_separator=True
        )

    def chunk_document(
        self,
        document: KnowledgeDocument,
        sections: List[ParsedSection]
    ) -> List[KnowledgeChunk]:
        """Convert a list of parsed sections into KnowledgeChunk instances via LangChain splitters."""
        chunks: List[KnowledgeChunk] = []
        chunk_global_index = 0

        for section in sections:
            normalized_content = TextNormalizer.normalize(section.content)
            if not normalized_content:
                continue

            # Create LangChain Document
            lc_doc = Document(
                page_content=normalized_content,
                metadata={
                    "document_id": document.document_id,
                    "title": document.title,
                    "section": section.title,
                    "category": document.category,
                    "subcategory": document.subcategory,
                    "source_reference": document.source_reference
                }
            )

            # Split document with LangChain RecursiveCharacterTextSplitter
            split_docs = self.text_splitter.split_documents([lc_doc])

            for split_doc in split_docs:
                text_piece = split_doc.page_content.strip()
                if not text_piece:
                    continue

                chunk_id = f"chk_{document.document_id[:8]}_{chunk_global_index}_{uuid.uuid4().hex[:6]}"
                chunk = KnowledgeChunk(
                    chunk_id=chunk_id,
                    document_id=document.document_id,
                    document_version=document.version,
                    title=document.title,
                    section=section.title,
                    category=document.category,
                    subcategory=document.subcategory,
                    chunk_index=chunk_global_index,
                    text=text_piece,
                    source_reference=document.source_reference,
                    created_at=datetime.utcnow().isoformat()
                )
                chunks.append(chunk)
                chunk_global_index += 1

        return chunks
