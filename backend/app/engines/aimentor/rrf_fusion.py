"""AIMentor Engine: Reciprocal Rank Fusion (RRF) Re-ranking.
Fuses dense vector and sparse lexical ranks using:
RRF_score(d) = sum(1 / (k + rank_i(d)))
"""
from app.engines.menti_ai.rag.reranker import Reranker

ReciprocalRankFusionReranker = Reranker

__all__ = ["Reranker", "ReciprocalRankFusionReranker"]
