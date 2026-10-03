"""In-memory and persisted Vector Store with Cosine Similarity for Phase 16 RAG Knowledge Base."""
import os
import json
import threading
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
from app.engines.menti_ai.rag.models.rag_models import KnowledgeChunk, DocumentStatus
from app.engines.menti_ai.rag.vector_store.base_store import BaseVectorStore


class MemoryVectorStore(BaseVectorStore):
    """Vector database with numpy-accelerated cosine similarity and disk persistence."""

    def __init__(self, storage_path: Optional[str] = None):
        self._lock = threading.RLock()
        self._chunks: Dict[str, KnowledgeChunk] = {}
        self._embeddings: Dict[str, np.ndarray] = {}
        self._doc_status_map: Dict[str, str] = {}
        self._storage_path = storage_path or os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
            "data", "rag", "vector_store.json"
        )
        self._load_if_exists()

    def add_chunks(
        self,
        chunks: List[KnowledgeChunk],
        embeddings: List[List[float]],
        status: str = DocumentStatus.ACTIVE.value
    ) -> None:
        with self._lock:
            for chunk, emb in zip(chunks, embeddings):
                arr = np.array(emb, dtype=np.float32)
                norm = np.linalg.norm(arr)
                if norm > 1e-8:
                    arr = arr / norm
                self._chunks[chunk.chunk_id] = chunk
                self._embeddings[chunk.chunk_id] = arr
                self._doc_status_map[chunk.document_id] = status
            self._save_to_disk()

    def update_document_status(self, document_id: str, status: str) -> None:
        with self._lock:
            self._doc_status_map[document_id] = status
            self._save_to_disk()

    def delete_document(self, document_id: str) -> int:
        with self._lock:
            to_delete = [
                cid for cid, chunk in self._chunks.items()
                if chunk.document_id == document_id
            ]
            for cid in to_delete:
                self._chunks.pop(cid, None)
                self._embeddings.pop(cid, None)
            self._doc_status_map.pop(document_id, None)
            self._save_to_disk()
            return len(to_delete)

    def search(
        self,
        query_vector: List[float],
        top_k: int = 5,
        category: Optional[str] = None,
        document_id: Optional[str] = None,
        only_active: bool = True
    ) -> List[Tuple[KnowledgeChunk, float]]:
        with self._lock:
            if not self._chunks or not self._embeddings:
                return []

            q_arr = np.array(query_vector, dtype=np.float32)
            q_norm = np.linalg.norm(q_arr)
            if q_norm > 1e-8:
                q_arr = q_arr / q_norm
            else:
                return []

            candidates: List[Tuple[KnowledgeChunk, float]] = []

            for cid, chunk in self._chunks.items():
                doc_status = self._doc_status_map.get(chunk.document_id, DocumentStatus.ACTIVE.value)
                if only_active and doc_status != DocumentStatus.ACTIVE.value:
                    continue

                if category and chunk.category.lower() != category.lower():
                    continue

                if document_id and chunk.document_id != document_id:
                    continue

                emb = self._embeddings.get(cid)
                if emb is None:
                    continue

                # Compute cosine similarity
                score = float(np.dot(q_arr, emb))
                # Bound between 0.0 and 1.0
                normalized_score = max(0.0, min(1.0, (score + 1.0) / 2.0))
                candidates.append((chunk, normalized_score))

            candidates.sort(key=lambda x: x[1], reverse=True)
            return candidates[:top_k]

    def count(self) -> int:
        with self._lock:
            return len(self._chunks)

    def get_all_chunks(self) -> List[KnowledgeChunk]:
        with self._lock:
            return list(self._chunks.values())

    def get_document_chunks(self, document_id: str) -> List[KnowledgeChunk]:
        with self._lock:
            return [c for c in self._chunks.values() if c.document_id == document_id]

    def health_check(self) -> Dict[str, Any]:
        with self._lock:
            return {
                "status": "healthy",
                "total_chunks": len(self._chunks),
                "total_embeddings": len(self._embeddings),
                "storage_path": self._storage_path
            }

    def _save_to_disk(self) -> None:
        try:
            os.makedirs(os.path.dirname(self._storage_path), exist_ok=True)
            data = {
                "chunks": [c.dict() for c in self._chunks.values()],
                "embeddings": {cid: emb.tolist() for cid, emb in self._embeddings.items()},
                "doc_status_map": self._doc_status_map
            }
            with open(self._storage_path, "w", encoding="utf-8") as f:
                json.dump(data, f)
        except Exception:
            pass

    def _load_if_exists(self) -> None:
        if not os.path.exists(self._storage_path):
            return
        try:
            with open(self._storage_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            for c_dict in data.get("chunks", []):
                chunk = KnowledgeChunk(**c_dict)
                self._chunks[chunk.chunk_id] = chunk

            for cid, emb_list in data.get("embeddings", {}).items():
                self._embeddings[cid] = np.array(emb_list, dtype=np.float32)

            self._doc_status_map = data.get("doc_status_map", {})
        except Exception:
            pass
