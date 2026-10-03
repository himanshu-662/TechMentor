"""Hybrid Retrieval Engine for Phase 16 RAG Knowledge Base.
Combines Dense Vector Semantic Search and Sparse BM25 Keyword Search using Reciprocal Rank Fusion (RRF).
Includes LangChain BaseRetriever compatibility.
"""
import os
import time
from typing import List, Optional, Dict, Any, Tuple
from langchain_core.retrievers import BaseRetriever
from langchain_core.documents import Document
from langchain_core.callbacks import CallbackManagerForRetrieverRun
from pydantic import Field

from app.engines.menti_ai.rag.models.rag_models import KnowledgeChunk, DocumentStatus
from app.engines.menti_ai.rag.embeddings.base_provider import EmbeddingProvider
from app.engines.menti_ai.rag.vector_store.vector_store import MemoryVectorStore
from app.engines.menti_ai.rag.keyword_search.bm25_search import BM25SearchEngine
from app.engines.menti_ai.rag.retrieval import RetrievalCandidate


class LangChainHybridRetriever(BaseRetriever):
    """LangChain-native BaseRetriever wrapper for the HybridRetriever."""
    hybrid_retriever: Any = Field(...)
    category: Optional[str] = None
    top_k: int = 5
    retrieval_method: str = "hybrid"

    def _get_relevant_documents(
        self, query: str, *, run_manager: Optional[CallbackManagerForRetrieverRun] = None
    ) -> List[Document]:
        candidates, _ = self.hybrid_retriever.retrieve(
            query=query,
            top_k=self.top_k,
            category=self.category,
            retrieval_method=self.retrieval_method
        )
        return [
            Document(
                page_content=c.chunk.text,
                metadata={
                    "chunk_id": c.chunk.chunk_id,
                    "document_id": c.chunk.document_id,
                    "title": c.chunk.title,
                    "section": c.chunk.section,
                    "category": c.chunk.category,
                    "score": c.score,
                    "source_reference": c.chunk.source_reference
                }
            )
            for c in candidates
        ]


class HybridRetriever:
    """Orchestrates multi-modal retrieval over knowledge base with LangChain integration."""

    def __init__(
        self,
        vector_store: MemoryVectorStore,
        bm25_engine: BM25SearchEngine,
        embedding_provider: EmbeddingProvider,
        semantic_weight: float = 0.65,
        keyword_weight: float = 0.35,
        rrf_k: int = 60
    ):
        self.vector_store = vector_store
        self.bm25_engine = bm25_engine
        self.embedding_provider = embedding_provider
        self.semantic_weight = float(os.getenv("RAG_SEMANTIC_WEIGHT", semantic_weight))
        self.keyword_weight = float(os.getenv("RAG_KEYWORD_WEIGHT", keyword_weight))
        self.rrf_k = rrf_k

    def as_langchain_retriever(
        self,
        top_k: int = 5,
        category: Optional[str] = None,
        retrieval_method: str = "hybrid"
    ) -> BaseRetriever:
        """Expose a standard LangChain BaseRetriever instance."""
        return LangChainHybridRetriever(
            hybrid_retriever=self,
            category=category,
            top_k=top_k,
            retrieval_method=retrieval_method
        )

    def retrieve(
        self,
        query: str,
        top_k: int = 5,
        category: Optional[str] = None,
        document_id: Optional[str] = None,
        retrieval_method: str = "hybrid",
        only_active: bool = True
    ) -> Tuple[List[RetrievalCandidate], float]:
        """Execute retrieval and return (candidates, latency_ms)."""
        start_time = time.perf_counter()
        method = retrieval_method.lower()

        candidates: List[RetrievalCandidate] = []

        if method == "semantic":
            candidates = self._search_semantic(query, top_k * 2, category, document_id, only_active)
        elif method == "keyword":
            candidates = self._search_keyword(query, top_k * 2, category, document_id, only_active)
        else:
            # Default: Hybrid fusion
            candidates = self._search_hybrid(query, top_k * 2, category, document_id, only_active)

        # Assign ranks and return top_k
        final_candidates = candidates[:top_k]
        for idx, cand in enumerate(final_candidates):
            cand.rank = idx + 1

        latency_ms = (time.perf_counter() - start_time) * 1000.0
        return final_candidates, latency_ms

    def _search_semantic(
        self,
        query: str,
        top_k: int,
        category: Optional[str],
        document_id: Optional[str],
        only_active: bool
    ) -> List[RetrievalCandidate]:
        query_vec = self.embedding_provider.embed_text(query)
        raw_results = self.vector_store.search(
            query_vector=query_vec,
            top_k=top_k,
            category=category,
            document_id=document_id,
            only_active=only_active
        )
        return [
            RetrievalCandidate(
                chunk=chunk,
                score=round(score, 4),
                semantic_score=round(score, 4),
                keyword_score=0.0,
                retrieval_method="semantic"
            )
            for chunk, score in raw_results
        ]

    def _search_keyword(
        self,
        query: str,
        top_k: int,
        category: Optional[str],
        document_id: Optional[str],
        only_active: bool
    ) -> List[RetrievalCandidate]:
        raw_results = self.bm25_engine.search(
            query=query,
            top_k=top_k,
            category=category,
            document_id=document_id,
            only_active=only_active
        )
        return [
            RetrievalCandidate(
                chunk=chunk,
                score=round(score, 4),
                semantic_score=0.0,
                keyword_score=round(score, 4),
                retrieval_method="keyword"
            )
            for chunk, score in raw_results
        ]

    def _search_hybrid(
        self,
        query: str,
        top_k: int,
        category: Optional[str],
        document_id: Optional[str],
        only_active: bool
    ) -> List[RetrievalCandidate]:
        # 1. Fetch semantic candidates
        query_vec = self.embedding_provider.embed_text(query)
        sem_results = self.vector_store.search(
            query_vector=query_vec,
            top_k=top_k,
            category=category,
            document_id=document_id,
            only_active=only_active
        )

        # 2. Fetch keyword candidates
        kw_results = self.bm25_engine.search(
            query=query,
            top_k=top_k,
            category=category,
            document_id=document_id,
            only_active=only_active
        )

        # 3. Merge candidates with Reciprocal Rank Fusion (RRF) & Weighted Score combination
        chunk_map: Dict[str, KnowledgeChunk] = {}
        sem_scores: Dict[str, float] = {}
        kw_scores: Dict[str, float] = {}
        rrf_scores: Dict[str, float] = {}

        # Process Semantic Ranks
        for rank, (chunk, score) in enumerate(sem_results):
            cid = chunk.chunk_id
            chunk_map[cid] = chunk
            sem_scores[cid] = score
            rrf_scores[cid] = rrf_scores.get(cid, 0.0) + (self.semantic_weight / (self.rrf_k + rank + 1))

        # Process Keyword Ranks
        for rank, (chunk, score) in enumerate(kw_results):
            cid = chunk.chunk_id
            chunk_map[cid] = chunk
            kw_scores[cid] = score
            rrf_scores[cid] = rrf_scores.get(cid, 0.0) + (self.keyword_weight / (self.rrf_k + rank + 1))

        if not chunk_map:
            return []

        candidates: List[RetrievalCandidate] = []
        max_rrf = max(rrf_scores.values()) if rrf_scores else 1.0
        if max_rrf <= 0:
            max_rrf = 1.0

        for cid, chunk in chunk_map.items():
            sem_s = sem_scores.get(cid, 0.0)
            kw_s = kw_scores.get(cid, 0.0)

            # Weighted hybrid score combining direct cosine/BM25 scores and RRF
            direct_weighted = (self.semantic_weight * sem_s) + (self.keyword_weight * kw_s)
            rrf_norm = rrf_scores.get(cid, 0.0) / max_rrf
            combined_score = 0.5 * direct_weighted + 0.5 * rrf_norm

            candidates.append(
                RetrievalCandidate(
                    chunk=chunk,
                    score=round(combined_score, 4),
                    semantic_score=round(sem_s, 4),
                    keyword_score=round(kw_s, 4),
                    retrieval_method="hybrid"
                )
            )

        candidates.sort(key=lambda c: c.score, reverse=True)
        return candidates
