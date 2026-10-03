"""Metrics calculator for Phase 16 RAG Retrieval Evaluation."""
from typing import List, Dict, Any, Tuple


class RetrievalMetrics:
    """Calculates Recall@K, Precision@K, and MRR for evaluation queries."""

    @staticmethod
    def calculate_reciprocal_rank(retrieved_items: List[str], expected_topics: List[str]) -> float:
        """Calculate Reciprocal Rank (1/rank) for the first matching topic."""
        for rank, item in enumerate(retrieved_items, start=1):
            for topic in expected_topics:
                if topic.lower() in item.lower():
                    return 1.0 / rank
        return 0.0

    @staticmethod
    def is_hit(retrieved_items: List[str], expected_topics: List[str]) -> bool:
        """Return True if any retrieved item matches any expected topic."""
        for item in retrieved_items:
            for topic in expected_topics:
                if topic.lower() in item.lower():
                    return True
        return False

    @staticmethod
    def calculate_precision_at_k(retrieved_items: List[str], expected_topics: List[str], k: int) -> float:
        """Calculate fraction of top K items that match expected topics."""
        if not retrieved_items or k <= 0:
            return 0.0
        items_k = retrieved_items[:k]
        matches = 0
        for item in items_k:
            for topic in expected_topics:
                if topic.lower() in item.lower():
                    matches += 1
                    break
        return matches / len(items_k)
