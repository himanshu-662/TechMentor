"""Reranking engine for Phase 16 RAG Knowledge Base.
Re-scores candidate chunks using term coverage, title/section alignment, and phrase proximity.
Includes safe fallback to hybrid rank.
"""
import re
from typing import List
from app.engines.menti_ai.rag.retrieval import RetrievalCandidate


class Reranker:
    """Reranks retrieved candidate chunks to surface the highest precision context."""

    def __init__(self):
        pass

    def rerank(self, query: str, candidates: List[RetrievalCandidate], top_k: int = 5) -> List[RetrievalCandidate]:
        """Rerank candidates with safe fallback."""
        if not candidates:
            return []

        try:
            q_terms = [t.lower() for t in re.findall(r'\b[a-z0-9_\-]{2,}\b', query) if len(t) >= 2]
            if not q_terms:
                return candidates[:top_k]

            scored_candidates = []
            for cand in candidates:
                chunk = cand.chunk
                title_clean = chunk.title.lower()
                section_clean = chunk.section.lower()
                text_clean = chunk.text.lower()

                # Term match density
                title_matches = sum(1 for t in q_terms if t in title_clean)
                section_matches = sum(1 for t in q_terms if t in section_clean)
                text_matches = sum(1 for t in q_terms if t in text_clean)

                coverage_ratio = text_matches / len(q_terms) if q_terms else 0.0

                # Check exact phrase presence
                phrase_bonus = 0.15 if query.lower() in text_clean else 0.0

                # Weighted boost
                boost = (
                    (0.20 * (title_matches / len(q_terms))) +
                    (0.15 * (section_matches / len(q_terms))) +
                    (0.25 * coverage_ratio) +
                    phrase_bonus
                )

                rerank_score = min(1.0, cand.score * 0.7 + boost * 0.3)
                cand.score = round(rerank_score, 4)
                scored_candidates.append(cand)

            scored_candidates.sort(key=lambda c: c.score, reverse=True)
            for idx, c in enumerate(scored_candidates[:top_k]):
                c.rank = idx + 1

            return scored_candidates[:top_k]

        except Exception:
            # Safe fallback: return initial hybrid candidates
            return candidates[:top_k]
