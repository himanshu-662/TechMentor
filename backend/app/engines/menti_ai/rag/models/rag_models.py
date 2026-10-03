"""Pydantic data models for Phase 16: RAG Knowledge Base and Retrieval."""
from typing import List, Dict, Any, Optional, Union
from enum import Enum
from datetime import datetime
from pydantic import BaseModel, Field


class DocumentStatus(str, Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    ARCHIVED = "ARCHIVED"
    FAILED = "FAILED"


class DocumentCategory(str, Enum):
    PYTHON = "Python"
    NUMPY = "NumPy"
    PANDAS = "Pandas"
    STATISTICS = "Statistics"
    DATA_ANALYSIS = "Data Analysis"
    DATA_CLEANING = "Data Cleaning"
    OUTLIERS = "Outliers"
    DATA_TRANSFORMATION = "Data Transformation"
    FEATURE_ENGINEERING = "Feature Engineering"
    FEATURE_SELECTION = "Feature Selection"
    VISUALIZATION = "Visualization"
    MACHINE_LEARNING = "Machine Learning"
    MODEL_TRAINING = "Model Training"
    MODEL_EVALUATION = "Model Evaluation"
    INTERPRETABILITY = "Interpretability"
    GENERAL = "General Knowledge"


class KnowledgeChunk(BaseModel):
    """A granular semantic chunk of text from an ingested knowledge document."""
    chunk_id: str
    document_id: str
    document_version: int = 1
    title: str
    section: str = "General"
    category: str = DocumentCategory.GENERAL.value
    subcategory: Optional[str] = None
    chunk_index: int = 0
    text: str
    source_reference: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class KnowledgeDocument(BaseModel):
    """Metadata and status of an ingested educational document."""
    document_id: str
    title: str
    description: str = ""
    category: str = DocumentCategory.GENERAL.value
    subcategory: Optional[str] = None
    source_type: str = "markdown"  # "markdown", "txt", "pdf", "html", "json"
    source_reference: Optional[str] = None
    version: int = 1
    status: DocumentStatus = DocumentStatus.ACTIVE
    checksum: str = ""
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    chunk_count: int = 0
    file_path: Optional[str] = None


class RAGSearchRequest(BaseModel):
    """Payload to search the knowledge base using semantic, keyword, or hybrid retrieval."""
    query: str = Field(..., description="Search query or technical question")
    category: Optional[str] = Field(None, description="Optional category filter")
    top_k: int = Field(5, ge=1, le=20, description="Number of relevant chunks to retrieve")
    retrieval_method: str = Field("hybrid", description="'hybrid' | 'semantic' | 'keyword'")
    document_id: Optional[str] = None


class RAGSearchResultItem(BaseModel):
    """Individual chunk result returned from retrieval."""
    chunk_id: str
    document_id: str
    title: str
    section: str
    category: str
    score: float
    semantic_score: Optional[float] = None
    keyword_score: Optional[float] = None
    text: str
    source_reference: Optional[str] = None
    retrieval_method: str = "hybrid"


class RAGSearchResponse(BaseModel):
    """Structured response from the RAG search engine."""
    query: str
    results: List[RAGSearchResultItem] = Field(default_factory=list)
    candidate_count: int = 0
    retrieval_method: str = "hybrid"
    latency_ms: float
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class CitationItem(BaseModel):
    """Source citation identifying ground truth document sections used in generation."""
    citation_id: int
    document_title: str
    section: str
    category: str
    source_reference: Optional[str] = None
    relevance_score: float
    excerpt: str


class QueryTypeEnum(str, Enum):
    GENERAL_KNOWLEDGE = "GENERAL_KNOWLEDGE"
    DATASET = "DATASET"
    PROCESSING = "PROCESSING"
    VALIDATION = "VALIDATION"
    TRAINING = "TRAINING"
    EVALUATION = "EVALUATION"
    PREDICTION = "PREDICTION"
    MIXED = "MIXED"


class RAGAskRequest(BaseModel):
    """Question sent to the AI Learning Assistant with optional dataset context."""
    question: str = Field(..., description="The user's question or prompt")
    dataset_id: Optional[str] = Field(None, description="Optional active dataset ID for pipeline context grounding")
    category: Optional[str] = None
    top_k: int = Field(4, ge=1, le=10)


class StructuredRAGOutput(BaseModel):
    """Structured breakdown of a pedagogical RAG explanation."""
    summary: str = Field(..., description="Concise core explanation")
    key_concepts: List[str] = Field(default_factory=list, description="Key conceptual or theoretical takeaways")
    practical_guidance: Optional[str] = Field(None, description="Actionable advice, rules of thumb, or pitfalls")
    code_example: Optional[str] = Field(None, description="Runnable Python or SQL code example")
    dataset_insights: Optional[str] = Field(None, description="Specific insights connecting the answer to active user dataset")
    follow_up_questions: List[str] = Field(default_factory=list, description="Recommended follow-up questions")


class RAGAskResponse(BaseModel):
    """Grounded AI answer with verified source citations, query routing, and structured breakdown."""
    question: str
    answer: str
    query_type: QueryTypeEnum = QueryTypeEnum.GENERAL_KNOWLEDGE
    sources: List[CitationItem] = Field(default_factory=list)
    structured_output: Optional[StructuredRAGOutput] = None
    follow_up_questions: List[str] = Field(default_factory=list)
    dataset_id: Optional[str] = None
    prediction_result: Optional[Dict[str, Any]] = Field(None, description="Live prediction inference result if query is a prediction request")
    context_used: Dict[str, Any] = Field(default_factory=dict)
    latency_ms: float
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class DocumentUploadResponse(BaseModel):
    """Ingestion confirmation response."""
    document_id: str
    title: str
    category: str
    version: int
    chunk_count: int
    status: DocumentStatus
    message: str


class DocumentDetailResponse(BaseModel):
    """Full document metadata and status."""
    document: KnowledgeDocument
    chunks: List[KnowledgeChunk] = Field(default_factory=list)


class DocumentListResponse(BaseModel):
    """List of all knowledge documents with stats."""
    total_documents: int
    active_documents: int
    total_chunks: int
    categories: List[str]
    documents: List[KnowledgeDocument]


class BenchmarkQueryDetail(BaseModel):
    """Individual query benchmark diagnostic."""
    query: str
    expected_topics: List[str]
    retrieved_titles: List[str]
    retrieved_sections: List[str]
    hit_at_1: bool
    hit_at_k: bool
    reciprocal_rank: float
    latency_ms: float


class RetrievalBenchmarkResponse(BaseModel):
    """Retrieval evaluation benchmark metrics."""
    recall_at_k: float
    precision_at_k: float
    mrr: float  # Mean Reciprocal Rank
    avg_latency_ms: float
    total_queries: int
    k: int = 5
    details: List[BenchmarkQueryDetail] = Field(default_factory=list)
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
