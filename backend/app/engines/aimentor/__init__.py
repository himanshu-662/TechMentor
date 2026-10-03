"""AIMentor Grounded RAG Pipeline Studio & Retrieval Engines.

Dedicated to the AIMentor RAG Pipeline Studio workbench (AST chunking, hybrid search, RRF fusion, RAG triad).
Built independently from scratch as an inspectable development workbench, separate from Menti.ai's dedicated knowledge RAG.
"""

from app.engines.aimentor.chunker import DocumentChunker, Chunker
from app.engines.aimentor.hybrid_search import HybridRetriever
from app.engines.aimentor.rrf_fusion import ReciprocalRankFusionReranker, Reranker
from app.engines.aimentor.grounding_gate import GroundingGate

try:
    from app.engines.menti_ai.rag.vector_store import VectorStore
    from app.engines.menti_ai.rag.keyword_search import BM25KeywordSearch
    from app.engines.menti_ai.rag.rag_engine import RAGEngine
except ImportError:
    pass

__all__ = [
    "DocumentChunker",
    "Chunker",
    "HybridRetriever",
    "ReciprocalRankFusionReranker",
    "Reranker",
    "GroundingGate",
]
