"""Embedding Provider Factory for Phase 16 RAG Knowledge Base."""
import os
from typing import Optional
from app.engines.menti_ai.rag.embeddings.base_provider import EmbeddingProvider
from app.engines.menti_ai.rag.embeddings.local_embeddings import LocalEmbeddingProvider
from app.engines.menti_ai.rag.embeddings.openai_embeddings import OpenAIEmbeddingProvider
from app.engines.menti_ai.rag.embeddings.huggingface_embeddings import HuggingFaceEmbeddingProvider
from app.engines.menti_ai.rag.embeddings.gemini_embeddings import GeminiEmbeddingProvider


class EmbeddingFactory:
    """Factory to instantiate the appropriate embedding provider from config/environment."""

    @staticmethod
    def get_provider(
        provider_type: Optional[str] = None,
        model_name: Optional[str] = None,
        api_key: Optional[str] = None
    ) -> EmbeddingProvider:
        provider = provider_type or os.getenv("EMBEDDING_PROVIDER", "local").lower()

        if provider in ("gemini", "google"):
            key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY", "")
            model = model_name or os.getenv("EMBEDDING_MODEL", "models/text-embedding-004")
            return GeminiEmbeddingProvider(api_key=key, model_name=model)
        elif provider == "openai":
            key = api_key or os.getenv("OPENAI_API_KEY", "")
            model = model_name or os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
            return OpenAIEmbeddingProvider(api_key=key, model=model)
        elif provider in ("huggingface", "hf", "sentence_transformers"):
            model = model_name or os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
            return HuggingFaceEmbeddingProvider(model_name=model)
        else:
            # Default to zero-dependency local embedding provider
            return LocalEmbeddingProvider(dimension=384)
