"""Menti.ai Pedagogical Socratic, Zero-Fabrication & Dedicated Knowledge RAG Engines.

This package organizes all computational engines dedicated to Menti.ai:
- Socratic dialog & intent routing (QueryRouter, PromptBuilder)
- Zero-fabrication What-If inference & moments (PredictionHelper, ContextBuilder)
- Grounded Knowledge RAG (rag: RAGEngine, HybridRetriever, VectorStore, BM25, embeddings, corpus)
- Educational concept catalog & 7 Explainability Pillars (education: concept_registry, explanation_service, concepts)
"""

from app.engines.menti_ai.query_router import QueryRouter
from app.engines.menti_ai.prompt_builder import PromptBuilder
from app.engines.menti_ai.prediction_helper import PredictionHelper
from app.engines.menti_ai.context_builder import ContextBuilder

try:
    from app.engines.menti_ai.rag.rag_engine import RAGEngine
    from app.engines.menti_ai.rag.hybrid_retrieval import HybridRetriever
    from app.engines.menti_ai.rag.reranker import Reranker
    from app.engines.menti_ai.rag.citation_builder import CitationBuilder
    from app.engines.menti_ai import rag
except ImportError:
    try:
        from app.engines.menti_ai.rag.rag_engine import RAGEngine
        from app.engines.menti_ai.rag.hybrid_retrieval import HybridRetriever
        from app.engines.menti_ai.rag.reranker import Reranker
        from app.engines.menti_ai.rag.citation_builder import CitationBuilder
    except ImportError:
        pass

try:
    from app.engines.menti_ai.education.concept_registry import concept_registry, ConceptRegistry
    from app.engines.menti_ai.education.explanation_service import ExplanationService, explanation_service
    from app.engines.menti_ai.education.models import (
        EducationalConcept,
        ContextualExplanationRequest,
        ContextualExplanationResponse,
        DatasetEvidence,
    )
    from app.engines.menti_ai import education
except ImportError:
    from app.engines.menti_ai.education.concept_registry import concept_registry, ConceptRegistry
    from app.engines.menti_ai.education.explanation_service import ExplanationService, explanation_service
    from app.engines.menti_ai.education.models import (
        EducationalConcept,
        ContextualExplanationRequest,
        ContextualExplanationResponse,
        DatasetEvidence,
    )

__all__ = [
    "QueryRouter",
    "PromptBuilder",
    "PredictionHelper",
    "ContextBuilder",
    "RAGEngine",
    "HybridRetriever",
    "Reranker",
    "CitationBuilder",
    "concept_registry",
    "ConceptRegistry",
    "ExplanationService",
    "explanation_service",
    "EducationalConcept",
    "ContextualExplanationRequest",
    "ContextualExplanationResponse",
    "DatasetEvidence",
    "education",
    "rag",
]
