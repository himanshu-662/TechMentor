"""Abstract base class for Vector Stores in Phase 16 RAG Knowledge Base."""
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional, Tuple
from app.engines.menti_ai.rag.models.rag_models import KnowledgeChunk


class BaseVectorStore(ABC):
    """Abstract vector storage and similarity search interface."""

    @abstractmethod
    def add_chunks(self, chunks: List[KnowledgeChunk], embeddings: List[List[float]]) -> None:
        """Add chunks along with their vector embeddings."""
        pass

    @abstractmethod
    def delete_document(self, document_id: str) -> int:
        """Delete all chunks belonging to a document. Returns count of deleted chunks."""
        pass

    @abstractmethod
    def search(
        self,
        query_vector: List[float],
        top_k: int = 5,
        category: Optional[str] = None,
        document_id: Optional[str] = None,
        only_active: bool = True
    ) -> List[Tuple[KnowledgeChunk, float]]:
        """Perform cosine similarity vector search, returning (chunk, similarity_score)."""
        pass

    @abstractmethod
    def count(self) -> int:
        """Return total number of vectors in store."""
        pass

    @abstractmethod
    def health_check(self) -> Dict[str, Any]:
        """Return vector store health diagnostics."""
        pass
