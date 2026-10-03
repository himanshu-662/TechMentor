"""Evaluation Runner for Phase 16 RAG Knowledge Base Retrieval Benchmarking."""
import time
from typing import Optional, List, Dict, Any
from app.engines.menti_ai.rag.models.rag_models import RetrievalBenchmarkResponse, BenchmarkQueryDetail
from app.engines.menti_ai.rag.hybrid_retrieval import HybridRetriever
from app.engines.menti_ai.rag.reranker import Reranker
from app.engines.menti_ai.rag.evaluation.test_queries import BENCHMARK_QUERIES
from app.engines.menti_ai.rag.evaluation.retrieval_metrics import RetrievalMetrics


class RetrievalEvaluationRunner:
    """Executes deterministic benchmark query suite and generates diagnostic quality metrics."""

    def __init__(self, retriever: HybridRetriever, reranker: Optional[Reranker] = None):
        self.retriever = retriever
        self.reranker = reranker or Reranker()

    def run_benchmark(
        self,
        k: int = 5,
        retrieval_method: str = "hybrid"
    ) -> RetrievalBenchmarkResponse:
        """Run all test queries and aggregate metrics."""
        details: List[BenchmarkQueryDetail] = []
        reciprocal_ranks: List[float] = []
        hits_at_k: List[bool] = []
        precisions_at_k: List[float] = []
        latencies: List[float] = []

        for q_item in BENCHMARK_QUERIES:
            query = q_item["query"]
            expected_topics = q_item["expected_topics"]

            start_t = time.perf_counter()
            candidates, _ = self.retriever.retrieve(
                query=query,
                top_k=k * 2,
                retrieval_method=retrieval_method
            )
            reranked = self.reranker.rerank(query, candidates, top_k=k)
            latency_ms = (time.perf_counter() - start_t) * 1000.0

            retrieved_titles = [c.chunk.title for c in reranked]
            retrieved_sections = [c.chunk.section for c in reranked]
            all_text_identifiers = [f"{c.chunk.title} {c.chunk.section} {c.chunk.text}" for c in reranked]

            rr = RetrievalMetrics.calculate_reciprocal_rank(all_text_identifiers, expected_topics)
            hit_k = RetrievalMetrics.is_hit(all_text_identifiers, expected_topics)
            hit_1 = (rr == 1.0)
            p_k = RetrievalMetrics.calculate_precision_at_k(all_text_identifiers, expected_topics, k)

            reciprocal_ranks.append(rr)
            hits_at_k.append(hit_k)
            precisions_at_k.append(p_k)
            latencies.append(latency_ms)

            details.append(
                BenchmarkQueryDetail(
                    query=query,
                    expected_topics=expected_topics,
                    retrieved_titles=retrieved_titles[:3],
                    retrieved_sections=retrieved_sections[:3],
                    hit_at_1=hit_1,
                    hit_at_k=hit_k,
                    reciprocal_rank=round(rr, 3),
                    latency_ms=round(latency_ms, 2)
                )
            )

        total_queries = len(BENCHMARK_QUERIES)
        recall_at_k = (sum(1 for h in hits_at_k if h) / total_queries) if total_queries else 0.0
        avg_precision = (sum(precisions_at_k) / total_queries) if total_queries else 0.0
        mrr = (sum(reciprocal_ranks) / total_queries) if total_queries else 0.0
        avg_latency = (sum(latencies) / total_queries) if total_queries else 0.0

        return RetrievalBenchmarkResponse(
            recall_at_k=round(recall_at_k, 3),
            precision_at_k=round(avg_precision, 3),
            mrr=round(mrr, 3),
            avg_latency_ms=round(avg_latency, 2),
            total_queries=total_queries,
            k=k,
            details=details
        )
