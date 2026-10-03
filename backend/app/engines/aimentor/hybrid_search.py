"""AIMentor Engine: Hybrid Search (Dense Vector + BM25 Sparse Search).
Combines dense semantic similarity with exact keyword lexical search.
"""
try:
    from app.engines.menti_ai.rag.hybrid_retrieval import HybridRetriever
except ImportError:
    from backend.app.rag.hybrid_retrieval import HybridRetriever

__all__ = ["HybridRetriever"]
