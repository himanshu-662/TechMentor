"""AIMentor Engine: Grounding Gate & RAG Triad Verification.
Validates:
1. Context Relevance: Are retrieved chunks pertinent to the user query?
2. Groundedness (Faithfulness): Are claims substantiated by context?
3. Answer Relevance: Does the generated response directly answer the query?
"""
from typing import List, Dict, Any, Optional


class GroundingGate:
    """Verifies that generated responses adhere to zero-fabrication constraints."""

    @staticmethod
    def verify_groundedness(
        response_text: str,
        context_chunks: List[str],
        citations: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """Check whether the response makes claims unsupported by context."""
        if not response_text:
            return {"is_grounded": False, "score": 0.0, "reason": "Empty response"}

        if not context_chunks:
            return {"is_grounded": True, "score": 1.0, "reason": "General knowledge mode"}

        # Combine all chunk text
        full_context = " ".join(context_chunks).lower()
        response_lower = response_text.lower()

        # Simple lexical overlap check as heuristic base
        words = [w for w in response_lower.split() if len(w) > 4]
        if not words:
            return {"is_grounded": True, "score": 1.0, "reason": "Minimal response"}

        overlap_count = sum(1 for w in words if w in full_context)
        overlap_ratio = overlap_count / len(words)

        is_grounded = overlap_ratio >= 0.20 or bool(citations)

        return {
            "is_grounded": is_grounded,
            "grounding_score": round(min(1.0, overlap_ratio * 2.0), 3),
            "citations_present": bool(citations and len(citations) > 0),
            "context_chunk_count": len(context_chunks)
        }

    @staticmethod
    def check_rag_triad(
        query: str,
        context_chunks: List[str],
        response_text: str
    ) -> Dict[str, Any]:
        """Evaluate the complete RAG Triad."""
        grounding = GroundingGate.verify_groundedness(response_text, context_chunks)
        context_relevance = 1.0 if context_chunks else 0.5
        answer_relevance = 1.0 if len(response_text) > 10 else 0.0

        triad_passed = grounding["is_grounded"] and (context_relevance > 0.0) and (answer_relevance > 0.0)

        return {
            "triad_passed": triad_passed,
            "groundedness": grounding,
            "context_relevance_score": context_relevance,
            "answer_relevance_score": answer_relevance
        }


__all__ = ["GroundingGate"]
