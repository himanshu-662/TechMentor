"""Google Gemini Embedding Provider for Phase 16 RAG Knowledge Base."""
import os
from typing import List, Optional
from app.core.config import settings
from app.engines.menti_ai.rag.embeddings.base_provider import EmbeddingProvider
from app.engines.menti_ai.rag.embeddings.local_embeddings import LocalEmbeddingProvider


class GeminiEmbeddingProvider(EmbeddingProvider):
    """Generates embeddings using Google Generative AI (text-embedding-004) with local fallback."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: str = "models/text-embedding-004",
        dimension: int = 768
    ):
        self._api_key = api_key or settings.GEMINI_API_KEY or settings.GOOGLE_API_KEY or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY", "")
        self._model_name = model_name
        self._dimension = dimension
        self._fallback = LocalEmbeddingProvider(dimension=384)
        self._client = None

    @property
    def dimension(self) -> int:
        return self._dimension if self._api_key else self._fallback.dimension

    @property
    def provider_name(self) -> str:
        return f"gemini_{self._model_name}" if self._api_key else "gemini_fallback_local"

    def _get_client(self):
        if self._client is None and self._api_key:
            try:
                from langchain_google_genai import GoogleGenerativeAIEmbeddings
                self._client = GoogleGenerativeAIEmbeddings(
                    model=self._model_name,
                    google_api_key=self._api_key
                )
            except Exception:
                self._client = False
        return self._client

    def embed_text(self, text: str) -> List[float]:
        client = self._get_client()
        if client:
            try:
                return client.embed_query(text)
            except Exception:
                return self._fallback.embed_text(text)
        return self._fallback.embed_text(text)

    def embed_documents(self, documents: List[str]) -> List[List[float]]:
        client = self._get_client()
        if client:
            try:
                return client.embed_documents(documents)
            except Exception:
                return self._fallback.embed_documents(documents)
        return self._fallback.embed_documents(documents)
