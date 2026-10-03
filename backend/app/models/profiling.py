from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class NumericalStats(BaseModel):
    """Detailed statistical profile for numerical features."""
    count: int
    missing_count: int
    missing_percentage: float
    mean: Optional[float] = None
    median: Optional[float] = None
    std: Optional[float] = None
    min: Optional[float] = None
    max: Optional[float] = None
    q1: Optional[float] = None
    q3: Optional[float] = None
    iqr: Optional[float] = None
    skewness: Optional[float] = None
    skewness_interpretation: Optional[str] = None
    unique_count: int
    zeros_count: int = 0
    negative_count: int = 0
    infinite_count: int = 0


class CategoryFrequency(BaseModel):
    """Frequency information for categorical values."""
    value: str
    count: int
    percentage: float


class CategoricalStats(BaseModel):
    """Detailed profile for categorical / text / boolean features."""
    count: int
    missing_count: int
    missing_percentage: float
    unique_count: int
    unique_percentage: float
    most_frequent_value: Optional[str] = None
    most_frequent_count: Optional[int] = None
    top_categories: List[CategoryFrequency] = Field(default_factory=list)


class DatetimeStats(BaseModel):
    """Detailed profile for temporal / datetime features."""
    is_datetime: bool = False
    min_date: Optional[str] = None
    max_date: Optional[str] = None
    unique_dates_count: Optional[int] = None
    parsed_percentage: Optional[float] = None


class IdentifierStats(BaseModel):
    """Detection results for potential unique identifier / key columns."""
    is_identifier: bool = False
    confidence: str = "none"  # "high", "moderate", "low", "none"
    reasons: List[str] = Field(default_factory=list)


class ColumnProfile(BaseModel):
    """Consolidated profile for an individual column."""
    name: str
    pandas_dtype: str
    semantic_type: str  # "numerical", "categorical", "datetime", "identifier", "boolean", "text", "unknown"
    total_count: int
    missing_count: int
    missing_percentage: float
    unique_count: int
    unique_percentage: float
    status: str = "ok"  # "ok", "warning", "critical", "info"
    status_reasons: List[str] = Field(default_factory=list)
    numerical_stats: Optional[NumericalStats] = None
    categorical_stats: Optional[CategoricalStats] = None
    datetime_stats: Optional[DatetimeStats] = None
    identifier_stats: Optional[IdentifierStats] = None


class LearningExplanation(BaseModel):
    """Beginner-friendly structured pedagogical explanation."""
    what_is_it: str
    why_does_it_matter: str
    what_happens_next: str


class QualityIssue(BaseModel):
    """Structured diagnosis of a dataset quality concern."""
    issue_id: str
    issue_type: str  # "missing_values", "duplicate_rows", "skewed_distribution", "potential_identifier", "constant_column", "near_constant_column", "unparsed_datetime"
    column: Optional[str] = None
    severity: str = "info"  # "info", "low", "moderate", "high", "warning"
    evidence: Dict[str, Any] = Field(default_factory=dict)
    explanation: str
    recommended_next_step: str
    learning_explanation: Optional[LearningExplanation] = None


class DatasetLevelSummary(BaseModel):
    """Dataset-wide structural and health metrics."""
    total_rows: int
    total_columns: int
    total_cells: int
    total_missing_cells: int
    missing_cells_percentage: float
    total_duplicate_rows: int
    duplicate_rows_percentage: float
    numerical_columns_count: int
    categorical_columns_count: int
    datetime_columns_count: int
    identifier_columns_count: int
    boolean_columns_count: int
    constant_columns_count: int
    near_constant_columns_count: int


class DatasetProfileResponse(BaseModel):
    """Complete dataset profiling result payload."""
    dataset_id: str
    filename: str
    file_type: str
    file_size_formatted: str
    summary: DatasetLevelSummary
    columns: List[ColumnProfile]
    issues: List[QualityIssue]
    profiling_completed_at: datetime = Field(default_factory=datetime.utcnow)
    message: str = "Automated dataset profiling completed successfully."
