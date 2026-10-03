"""Menti.ai Dedicated Knowledge RAG Engine.
Provides grounded curriculum retrieval, hybrid search, RRF reranking, and zero-fabrication synthesis.
"""
from typing import Any

from app.engines.menti_ai.rag.models.rag_models import (
    KnowledgeDocument,
    KnowledgeChunk,
    DocumentStatus,
    DocumentCategory,
    QueryTypeEnum,
)

__all__ = [
    "RAGEngine",
    "HybridRetriever",
    "Reranker",
    "ContextBuilder",
    "CitationBuilder",
    "QueryRouter",
    "PromptBuilder",
    "KnowledgeDocument",
    "KnowledgeChunk",
    "DocumentStatus",
    "DocumentCategory",
    "QueryTypeEnum",
]


def __getattr__(name: str) -> Any:
    if name == "RAGEngine":
        from app.engines.menti_ai.rag.rag_engine import RAGEngine
        return RAGEngine
    elif name == "HybridRetriever":
        from app.engines.menti_ai.rag.hybrid_retrieval import HybridRetriever
        return HybridRetriever
    elif name == "Reranker":
        from app.engines.menti_ai.rag.reranker import Reranker
        return Reranker
    elif name == "CitationBuilder":
        from app.engines.menti_ai.rag.citation_builder import CitationBuilder
        return CitationBuilder
    elif name == "ContextBuilder":
        from app.engines.menti_ai.context_builder import ContextBuilder
        return ContextBuilder
    elif name == "QueryRouter":
        from app.engines.menti_ai.query_router import QueryRouter
        return QueryRouter
    elif name == "PromptBuilder":
        from app.engines.menti_ai.prompt_builder import PromptBuilder
        return PromptBuilder
    raise AttributeError(f"module '{__name__}' has no attribute '{name}'")
