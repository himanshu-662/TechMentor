"""TechMentor Unified Engines Package.

This package organizes pure computational and mathematical engines across the three TechMentor tools:
- datamentor: 13-stage deterministic ML preprocessing & model evaluation engines
- aimentor: Grounded RAG pipelines, AST chunkers, BM25 + dense hybrid search & RRF re-ranking
- menti_ai: Pedagogical Socratic tutoring, dedicated knowledge RAG, zero-fabrication moment injection & explainability engines
"""

from app.engines import datamentor
from app.engines import aimentor
from app.engines import menti_ai

__all__ = ["datamentor", "aimentor", "menti_ai"]
