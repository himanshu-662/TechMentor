"""Menti.ai Socratic Engine: Context Builder.
Constructs in-memory dataset moments and token-budgeted prompt context blocks
to guarantee zero fabrication and strict grounding.
"""
import os
from typing import List, Dict, Any, Optional, Tuple
from app.engines.menti_ai.rag.retrieval import RetrievalCandidate


class ContextBuilder:
    """Constructs prompt context with strict token/character budget limits and dataset moments."""

    def __init__(
        self,
        max_chunks: int = 5,
        max_context_length: int = 4000
    ):
        self.max_chunks = int(os.getenv("RAG_MAX_CHUNKS", max_chunks))
        self.max_context_length = int(os.getenv("RAG_MAX_CONTEXT_LENGTH", max_context_length))

    def build_rag_context(self, candidates: List[RetrievalCandidate]) -> Tuple[str, List[RetrievalCandidate]]:
        """Format candidate chunks into a structured context string."""
        selected_candidates = candidates[:self.max_chunks]
        context_blocks = []
        current_len = 0
        used_candidates: List[RetrievalCandidate] = []

        for idx, cand in enumerate(selected_candidates):
            chunk = cand.chunk
            block = (
                f"--- SOURCE #{idx+1} ---\n"
                f"DOCUMENT: {chunk.title}\n"
                f"SECTION: {chunk.section}\n"
                f"CATEGORY: {chunk.category}\n"
                f"RELEVANCE SCORE: {cand.score:.2f}\n"
                f"CONTENT:\n{chunk.text}\n"
            )

            block_len = len(block)
            if current_len + block_len > self.max_context_length and context_blocks:
                break

            context_blocks.append(block)
            used_candidates.append(cand)
            current_len += block_len

        joined_context = "\n".join(context_blocks) if context_blocks else "No relevant knowledge sources found."
        return joined_context, used_candidates

    def build_dataset_context(self, dataset_summary: Optional[Dict[str, Any]] = None) -> str:
        """Format active user dataset context to separate it from general knowledge."""
        if not dataset_summary:
            return ""

        lines = ["=== ACTIVE USER DATASET CONTEXT (ZERO-FABRICATION CONTRACT) ==="]
        if "filename" in dataset_summary:
            lines.append(f"Filename: {dataset_summary['filename']}")
        if "rows" in dataset_summary and "columns" in dataset_summary:
            lines.append(f"Dimensions: {dataset_summary['rows']} rows x {dataset_summary['columns']} columns")
        if "target_column" in dataset_summary:
            lines.append(f"Target Column: {dataset_summary['target_column']}")
        if "problem_type" in dataset_summary:
            lines.append(f"Problem Type: {dataset_summary['problem_type']}")
        if "active_step" in dataset_summary:
            lines.append(f"Current Pipeline Step: {dataset_summary['active_step']}")
        if "key_metrics" in dataset_summary and isinstance(dataset_summary["key_metrics"], dict):
            metrics_str = ", ".join(f"{k}: {v}" for k, v in dataset_summary["key_metrics"].items())
            lines.append(f"Model Evaluation Metrics: {metrics_str}")
        if "moments" in dataset_summary and isinstance(dataset_summary["moments"], dict):
            m_str = ", ".join(f"{k}: {v}" for k, v in dataset_summary["moments"].items())
            lines.append(f"Empirical Statistical Moments: {m_str}")
        if "notes" in dataset_summary:
            lines.append(f"Pipeline Notes: {dataset_summary['notes']}")

        return "\n".join(lines)


__all__ = ["ContextBuilder"]
