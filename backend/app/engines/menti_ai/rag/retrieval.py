"""Base retrieval structures and interfaces for Phase 16 RAG Knowledge Base."""
from typing import List, Optional
from pydantic import BaseModel
from app.engines.menti_ai.rag.models.rag_models import KnowledgeChunk


class RetrievalCandidate(BaseModel):
    """Unified retrieval result item containing chunk and score components."""
    chunk: KnowledgeChunk
    score: float
    semantic_score: Optional[float] = None
    keyword_score: Optional[float] = None
    rank: int = 0
    retrieval_method: str = "hybrid"

    class Config:
        arbitrary_types_allowed = True
