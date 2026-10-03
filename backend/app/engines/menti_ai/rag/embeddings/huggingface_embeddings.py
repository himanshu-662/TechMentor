"""HuggingFace embedding provider with graceful fallback for Phase 16 RAG Knowledge Base."""
import os
from typing import List, Optional
from app.engines.menti_ai.rag.embeddings.base_provider import EmbeddingProvider
from app.engines.menti_ai.rag.embeddings.local_embeddings import LocalEmbeddingProvider


class HuggingFaceEmbeddingProvider(EmbeddingProvider):
    """Generates embeddings using HuggingFace sentence-transformers with local fallback."""

    def __init__(
        self,
        model_name: str = "sentence-transformers/all-MiniLM-L6-v2",
        dimension: int = 384
    ):
        self._model_name = model_name
        self._dimension = dimension
        self._fallback = LocalEmbeddingProvider(dimension=384)
        self._model = None

    @property
    def dimension(self) -> int:
        return self._dimension

    @property
    def provider_name(self) -> str:
        return f"huggingface_{self._model_name}"

    def _get_model(self):
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                self._model = SentenceTransformer(self._model_name)
            except Exception:
                self._model = False
        return self._model

    def embed_text(self, text: str) -> List[float]:
        model = self._get_model()
        if model:
            try:
                vec = model.encode(text)
                return vec.tolist()
            except Exception:
                return self._fallback.embed_text(text)
        return self._fallback.embed_text(text)

    def embed_documents(self, documents: List[str]) -> List[List[float]]:
        model = self._get_model()
        if model:
            try:
                vecs = model.encode(documents)
                return [v.tolist() for v in vecs]
            except Exception:
                return self._fallback.embed_documents(documents)
        return self._fallback.embed_documents(documents)
