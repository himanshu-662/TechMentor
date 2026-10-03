"""OpenAI embedding provider with graceful fallback for Phase 16 RAG Knowledge Base."""
import os
from typing import List, Optional
from app.engines.menti_ai.rag.embeddings.base_provider import EmbeddingProvider
from app.engines.menti_ai.rag.embeddings.local_embeddings import LocalEmbeddingProvider


class OpenAIEmbeddingProvider(EmbeddingProvider):
    """Generates embeddings using OpenAI API (text-embedding-3-small) with local fallback."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = "text-embedding-3-small",
        dimension: int = 1536
    ):
        self._api_key = api_key or os.getenv("OPENAI_API_KEY", "")
        self._model = model
        self._dimension = dimension
        self._fallback = LocalEmbeddingProvider(dimension=384)

    @property
    def dimension(self) -> int:
        return self._dimension if self._api_key else self._fallback.dimension

    @property
    def provider_name(self) -> str:
        return f"openai_{self._model}" if self._api_key else "openai_fallback_local"

    def embed_text(self, text: str) -> List[float]:
        if not self._api_key:
            return self._fallback.embed_text(text)

        try:
            from openai import OpenAI
            client = OpenAI(api_key=self._api_key)
            response = client.embeddings.create(
                input=text,
                model=self._model
            )
            return response.data[0].embedding
        except Exception:
            # Safe fallback if network error or invalid key
            return self._fallback.embed_text(text)

    def embed_documents(self, documents: List[str]) -> List[List[float]]:
        if not self._api_key:
            return self._fallback.embed_documents(documents)

        try:
            from openai import OpenAI
            client = OpenAI(api_key=self._api_key)
            response = client.embeddings.create(
                input=documents,
                model=self._model
            )
            return [item.embedding for item in response.data]
        except Exception:
            return self._fallback.embed_documents(documents)
