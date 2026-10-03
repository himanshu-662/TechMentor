"""RAG and Knowledge Base Singleton Service for DataMentor AI.
Manages Vector Store, BM25 Index, Ingestion Pipeline, Educational Corpus Pre-Seeding, and Query Answering.
"""
import os
import glob
import logging
from typing import Optional, List, Dict, Any, Tuple

from app.engines.menti_ai.rag.models.rag_models import (
    KnowledgeDocument,
    KnowledgeChunk,
    DocumentStatus,
    DocumentCategory,
    RAGSearchRequest,
    RAGSearchResponse,
    RAGAskRequest,
    RAGAskResponse,
    RetrievalBenchmarkResponse
)
from app.engines.menti_ai.rag.embeddings.provider_factory import EmbeddingFactory
from app.engines.menti_ai.rag.vector_store.vector_store import MemoryVectorStore
from app.engines.menti_ai.rag.keyword_search.bm25_search import BM25SearchEngine
from app.engines.menti_ai.rag.ingestion.ingestion_engine import DocumentIngestionEngine
from app.engines.menti_ai.rag.ingestion.chunker import DocumentChunker
from app.engines.menti_ai.rag.hybrid_retrieval import HybridRetriever
from app.engines.menti_ai.rag.reranker import Reranker
from app.engines.menti_ai.rag.context_builder import ContextBuilder
from app.engines.menti_ai.rag.rag_engine import RAGEngine
from app.engines.menti_ai.rag.evaluation.evaluation_runner import RetrievalEvaluationRunner

logger = logging.getLogger(__name__)


class RAGService:
    """Central service for Phase 16 Knowledge Base and RAG Assistant."""

    _instance: Optional["RAGService"] = None

    def __init__(self):
        # 1. Initialize Components
        self.embedding_provider = EmbeddingFactory.get_provider()
        self.vector_store = MemoryVectorStore()
        self.bm25_engine = BM25SearchEngine()
        self.chunker = DocumentChunker(chunk_size=600, chunk_overlap=100)
        self.ingestion_engine = DocumentIngestionEngine(
            vector_store=self.vector_store,
            bm25_engine=self.bm25_engine,
            embedding_provider=self.embedding_provider,
            chunker=self.chunker
        )
        self.retriever = HybridRetriever(
            vector_store=self.vector_store,
            bm25_engine=self.bm25_engine,
            embedding_provider=self.embedding_provider
        )
        self.reranker = Reranker()
        self.context_builder = ContextBuilder()
        self.rag_engine = RAGEngine(
            retriever=self.retriever,
            reranker=self.reranker,
            context_builder=self.context_builder
        )
        self.evaluation_runner = RetrievalEvaluationRunner(
            retriever=self.retriever,
            reranker=self.reranker
        )

        # 2. Pre-seed educational knowledge corpus if store is empty or needs baseline
        self._seed_default_corpus()

    @classmethod
    def get_instance(cls) -> "RAGService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _seed_default_corpus(self) -> None:
        corpus_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "engines",
            "menti_ai",
            "rag",
            "corpus"
        )
        if not os.path.exists(corpus_dir):
            return

        category_map = {
            "01_python_numpy_pandas.md": (DocumentCategory.PYTHON.value, "Python, NumPy & Pandas Data Manipulation"),
            "02_statistics_and_eda.md": (DocumentCategory.STATISTICS.value, "Descriptive Statistics & EDA Guide"),
            "03_data_cleaning_and_missing_values.md": (DocumentCategory.DATA_CLEANING.value, "Missing Value Strategies & Imputation"),
            "04_outlier_detection_and_treatment.md": (DocumentCategory.OUTLIERS.value, "Outlier Detection & Tukey Fences"),
            "05_data_encoding_techniques.md": (DocumentCategory.DATA_TRANSFORMATION.value, "Categorical Encoding Techniques"),
            "06_feature_scaling_and_transformations.md": (DocumentCategory.DATA_TRANSFORMATION.value, "Feature Scaling & Power Transforms"),
            "07_dimensionality_reduction_pca.md": (DocumentCategory.FEATURE_ENGINEERING.value, "PCA & Dimensionality Reduction"),
            "08_feature_selection_methods.md": (DocumentCategory.FEATURE_SELECTION.value, "Feature Selection & Screening"),
            "09_train_test_split_and_cross_validation.md": (DocumentCategory.MACHINE_LEARNING.value, "Train-Test Splitting & Leakage"),
            "10_machine_learning_algorithms_and_fitting.md": (DocumentCategory.MODEL_TRAINING.value, "ML Algorithms & Supervised Fitting"),
            "11_overfitting_underfitting_and_regularization.md": (DocumentCategory.MACHINE_LEARNING.value, "Bias-Variance & Regularization"),
            "12_model_evaluation_metrics_and_classification.md": (DocumentCategory.MODEL_EVALUATION.value, "Classification Metrics & ROC-AUC"),
            "13_model_evaluation_regression_metrics.md": (DocumentCategory.MODEL_EVALUATION.value, "Regression Metrics & Residuals"),
            "14_model_interpretability_and_feature_importance.md": (DocumentCategory.INTERPRETABILITY.value, "Interpretability & SHAP Values"),
            "15_langchain_and_rag_architectures.md": (DocumentCategory.GENERAL.value, "LangChain & RAG Architectures Guide")
        }

        md_files = glob.glob(os.path.join(corpus_dir, "*.md"))
        for file_path in sorted(md_files):
            filename = os.path.basename(file_path)
            cat, title = category_map.get(filename, (DocumentCategory.GENERAL.value, filename.replace(".md", "").replace("_", " ").title()))
            try:
                with open(file_path, "rb") as f:
                    content_bytes = f.read()
                self.ingestion_engine.ingest_document(
                    content_bytes=content_bytes,
                    filename=filename,
                    title=title,
                    category=cat,
                    source_reference=f"DataMentor Core Curriculum ({filename})"
                )
            except Exception as e:
                logger.warning(f"Error seeding {filename}: {e}")

    def ingest_document(
        self,
        content_bytes: bytes,
        filename: str,
        title: Optional[str] = None,
        category: Optional[str] = None,
        subcategory: Optional[str] = None,
        description: str = "",
        source_reference: Optional[str] = None,
        allow_duplicate: bool = False
    ) -> Tuple[KnowledgeDocument, List[KnowledgeChunk], str]:
        return self.ingestion_engine.ingest_document(
            content_bytes=content_bytes,
            filename=filename,
            title=title,
            category=category,
            subcategory=subcategory,
            description=description,
            source_reference=source_reference,
            allow_duplicate=allow_duplicate
        )

    def reindex_document(self, document_id: str) -> Tuple[KnowledgeDocument, List[KnowledgeChunk], str]:
        return self.ingestion_engine.reindex_document(document_id)

    def set_document_status(self, document_id: str, new_status: DocumentStatus) -> KnowledgeDocument:
        return self.ingestion_engine.set_document_status(document_id, new_status)

    def delete_document(self, document_id: str) -> bool:
        return self.ingestion_engine.delete_document(document_id)

    def get_document(self, document_id: str) -> Optional[KnowledgeDocument]:
        return self.ingestion_engine.get_document(document_id)

    def get_document_chunks(self, document_id: str) -> List[KnowledgeChunk]:
        return self.vector_store.get_document_chunks(document_id)

    def list_documents(
        self,
        category: Optional[str] = None,
        status: Optional[DocumentStatus] = None
    ) -> List[KnowledgeDocument]:
        return self.ingestion_engine.list_documents(category=category, status=status)

    def get_stats(self) -> Dict[str, Any]:
        return self.ingestion_engine.get_stats()

    def search(self, request: RAGSearchRequest) -> RAGSearchResponse:
        return self.rag_engine.search(request)

    def ask(self, request: RAGAskRequest) -> RAGAskResponse:
        dataset_summary = None
        if request.dataset_id:
            dataset_summary = self._fetch_dataset_context(request.dataset_id)
        return self.rag_engine.ask(request, dataset_summary=dataset_summary)

    def run_benchmark(self, k: int = 5, retrieval_method: str = "hybrid") -> RetrievalBenchmarkResponse:
        return self.evaluation_runner.run_benchmark(k=k, retrieval_method=retrieval_method)

    def _fetch_dataset_context(self, dataset_id: str) -> Optional[Dict[str, Any]]:
        """Extract active dataset metadata and evaluation state if available."""
        try:
            from app.services.dataset_service import dataset_service
            df = dataset_service.get_dataset(dataset_id)
            if df is not None:
                summary = {
                    "dataset_id": dataset_id,
                    "rows": len(df),
                    "columns": len(df.columns),
                    "feature_names": list(df.columns)[:10],
                    "filename": f"dataset_{dataset_id[:8]}.csv"
                }
                # Check if modeling engine has trained models for this dataset
                try:
                    from app.modeling.modeling_engine import modeling_engine
                    if hasattr(modeling_engine, "get_model_summary"):
                        m_summary = modeling_engine.get_model_summary(dataset_id)
                        if m_summary:
                            summary["key_metrics"] = m_summary.get("metrics", {})
                            summary["problem_type"] = m_summary.get("problem_type")
                except Exception:
                    pass
                return summary
        except Exception:
            pass
        return None


# Global singleton instance
rag_service = RAGService.get_instance()
