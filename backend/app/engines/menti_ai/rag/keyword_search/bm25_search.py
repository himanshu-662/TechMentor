"""BM25 (Okapi) Lexical Keyword Search for Phase 16 RAG Knowledge Base."""
import re
import math
import threading
from typing import List, Dict, Any, Optional, Tuple
from app.engines.menti_ai.rag.models.rag_models import KnowledgeChunk, DocumentStatus


class BM25SearchEngine:
    """Okapi BM25 ranking algorithm implementation for technical keyword retrieval."""

    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self._lock = threading.RLock()
        self._chunks: Dict[str, KnowledgeChunk] = {}
        self._doc_status_map: Dict[str, str] = {}
        self._doc_lengths: Dict[str, int] = {}
        self._doc_token_freqs: Dict[str, Dict[str, int]] = {}
        self._doc_freqs: Dict[str, int] = {}  # term -> number of documents containing term
        self._avg_doc_len: float = 0.0

    def add_chunks(
        self,
        chunks: List[KnowledgeChunk],
        status: str = DocumentStatus.ACTIVE.value
    ) -> None:
        with self._lock:
            for chunk in chunks:
                self._chunks[chunk.chunk_id] = chunk
                self._doc_status_map[chunk.document_id] = status

                # Tokenize chunk title, section, category and text
                full_content = f"{chunk.title} {chunk.section} {chunk.category} {chunk.text}"
                tokens = self._tokenize(full_content)
                self._doc_lengths[chunk.chunk_id] = len(tokens)

                # Frequency map
                freq_map: Dict[str, int] = {}
                for t in tokens:
                    freq_map[t] = freq_map.get(t, 0) + 1
                self._doc_token_freqs[chunk.chunk_id] = freq_map

            self._recalculate_stats()

    def update_document_status(self, document_id: str, status: str) -> None:
        with self._lock:
            self._doc_status_map[document_id] = status

    def delete_document(self, document_id: str) -> int:
        with self._lock:
            to_delete = [
                cid for cid, chunk in self._chunks.items()
                if chunk.document_id == document_id
            ]
            for cid in to_delete:
                self._chunks.pop(cid, None)
                self._doc_lengths.pop(cid, None)
                self._doc_token_freqs.pop(cid, None)
            self._doc_status_map.pop(document_id, None)
            self._recalculate_stats()
            return len(to_delete)

    def search(
        self,
        query: str,
        top_k: int = 5,
        category: Optional[str] = None,
        document_id: Optional[str] = None,
        only_active: bool = True
    ) -> List[Tuple[KnowledgeChunk, float]]:
        with self._lock:
            if not self._chunks or not query or not query.strip():
                return []

            q_tokens = self._tokenize(query)
            if not q_tokens:
                return []

            num_docs = len(self._chunks)
            if num_docs == 0:
                return []

            scores: Dict[str, float] = {}

            for q_term in q_tokens:
                df = self._doc_freqs.get(q_term, 0)
                if df == 0:
                    continue

                # Standard Okapi IDF with smoothing
                idf = math.log(1.0 + (num_docs - df + 0.5) / (df + 0.5))

                for cid, chunk in self._chunks.items():
                    doc_status = self._doc_status_map.get(chunk.document_id, DocumentStatus.ACTIVE.value)
                    if only_active and doc_status != DocumentStatus.ACTIVE.value:
                        continue

                    if category and chunk.category.lower() != category.lower():
                        continue

                    if document_id and chunk.document_id != document_id:
                        continue

                    tf = self._doc_token_freqs.get(cid, {}).get(q_term, 0)
                    if tf == 0:
                        continue

                    doc_len = self._doc_lengths.get(cid, 1)
                    denom = tf + self.k1 * (1.0 - self.b + self.b * (doc_len / (self._avg_doc_len or 1.0)))
                    term_score = idf * (tf * (self.k1 + 1.0)) / (denom or 1.0)

                    scores[cid] = scores.get(cid, 0.0) + term_score

            if not scores:
                return []

            # Normalize scores to 0..1 range
            max_score = max(scores.values()) if scores else 1.0
            if max_score <= 0:
                max_score = 1.0

            results: List[Tuple[KnowledgeChunk, float]] = []
            for cid, raw_score in scores.items():
                chunk = self._chunks[cid]
                normalized = min(1.0, raw_score / max_score)
                results.append((chunk, normalized))

            results.sort(key=lambda x: x[1], reverse=True)
            return results[:top_k]

    def _recalculate_stats(self) -> None:
        """Recompute document frequencies and average document length."""
        self._doc_freqs.clear()
        total_len = 0

        for cid, freq_map in self._doc_token_freqs.items():
            total_len += self._doc_lengths.get(cid, 0)
            for term in freq_map.keys():
                self._doc_freqs[term] = self._doc_freqs.get(term, 0) + 1

        total_docs = len(self._doc_lengths)
        self._avg_doc_len = (total_len / total_docs) if total_docs > 0 else 0.0

    def _tokenize(self, text: str) -> List[str]:
        """Tokenize text into lowercase alphanumeric words."""
        clean = text.lower()
        return re.findall(r'\b[a-z0-9_\-]{2,}\b', clean)
