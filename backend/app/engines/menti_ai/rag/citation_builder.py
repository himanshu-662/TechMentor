"""Citation Builder for Phase 16 RAG Knowledge Base.
Generates verifiable, non-fabricated citations directly from retrieved sources.
"""
from typing import List, Tuple
from app.engines.menti_ai.rag.models.rag_models import CitationItem
from app.engines.menti_ai.rag.retrieval import RetrievalCandidate


class CitationBuilder:
    """Builds structured CitationItems and markdown reference blocks."""

    @staticmethod
    def build_citations(candidates: List[RetrievalCandidate]) -> List[CitationItem]:
        """Extract structured CitationItem objects from retrieved candidates."""
        citations: List[CitationItem] = []
        seen_keys = set()

        for idx, cand in enumerate(candidates):
            chunk = cand.chunk
            dedup_key = (chunk.document_id, chunk.section)
            if dedup_key in seen_keys:
                continue
            seen_keys.add(dedup_key)

            excerpt = chunk.text[:140].strip()
            if len(chunk.text) > 140:
                excerpt += "..."

            citation = CitationItem(
                citation_id=len(citations) + 1,
                document_title=chunk.title,
                section=chunk.section,
                category=chunk.category,
                source_reference=chunk.source_reference,
                relevance_score=cand.score,
                excerpt=excerpt
            )
            citations.append(citation)

        return citations

    @staticmethod
    def format_citations_markdown(citations: List[CitationItem]) -> str:
        """Format citations into a standardized markdown references block."""
        if not citations:
            return ""

        lines = ["\n\n### Sources"]
        for cit in citations:
            src_ref = f" (`{cit.source_reference}`)" if cit.source_reference else ""
            lines.append(
                f"{cit.citation_id}. **{cit.document_title}** — *{cit.section}* ({cit.category}){src_ref}"
            )

        return "\n".join(lines)
