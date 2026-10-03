"""Base abstract embedding provider for Phase 16 RAG Knowledge Base.
Integrates with LangChain Embeddings interface.
"""
from abc import ABC, abstractmethod
from typing import List
from langchain_core.embeddings import Embeddings


class EmbeddingProvider(Embeddings, ABC):
    """Abstract interface for text and document embedding generation complying with LangChain Embeddings."""

    @abstractmethod
    def embed_text(self, text: str) -> List[float]:
        """Generate a dense vector embedding for a single text query or passage."""
        pass

    @abstractmethod
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a batch of documents (LangChain Embeddings compliance)."""
        pass

    def embed_query(self, text: str) -> List[float]:
        """LangChain Embeddings compliance method for single query embedding."""
        return self.embed_text(text)

    @property
    @abstractmethod
    def dimension(self) -> int:
        """Vector dimension size."""
        pass

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Name of the active embedding provider."""
        pass
