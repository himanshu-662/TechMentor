"""Pydantic data models and schemas for Phase 7 Data Transformation Engine."""
from typing import List, Dict, Any, Optional
from enum import Enum
from pydantic import BaseModel, Field


class TransformationMethodEnum(str, Enum):
    NONE = "none"
    STANDARD = "standard"
    MINMAX = "minmax"
    ROBUST = "robust"
    LOG1P = "log1p"
    YEO_JOHNSON = "yeo_johnson"
    BOX_COX = "box_cox"


class HistogramBin(BaseModel):
    """Histogram bin for before/after visual distribution curves."""
    bin_start: float
    bin_end: float
    count: int


class BoxPlotStats(BaseModel):
    """Quartile and whisker metrics for box plot visualizations."""
    min: float
    q1: float
    median: float
    q3: float
    max: float
    lower_whisker: float
    upper_whisker: float
    outlier_points: List[float] = Field(default_factory=list)


class ColumnDistributionMetrics(BaseModel):
    """Comprehensive statistical metrics of a feature distribution before/after transformation."""
    count: int
    missing_count: int
    min: Optional[float] = None
    max: Optional[float] = None
    mean: Optional[float] = None
    median: Optional[float] = None
    std: Optional[float] = None
    q1: Optional[float] = None
    q3: Optional[float] = None
    iqr: Optional[float] = None
    skewness: Optional[float] = None
    zero_count: int = 0
    negative_count: int = 0
    outlier_count: int = 0
    outlier_percentage: float = 0.0
    histogram_bins: List[HistogramBin] = Field(default_factory=list)
    boxplot_stats: Optional[BoxPlotStats] = None


class CalculationStepDetail(BaseModel):
    """Step-by-step mathematical breakdown with real dataset numbers."""
    method: str
    formula: str
    steps: List[str]
    parameters: Dict[str, Any]
    sample_calculation: Optional[str] = None


class AlternativeTransformation(BaseModel):
    """Alternative transformation method suggestion."""
    name: str
    method_id: str
    description: str
    trade_off: str


class TransformationRecommendation(BaseModel):
    """Deterministic, rule-based recommendation grounded in skewness, outliers, and range."""
    recommended_method: str
    reason: str
    evidence: Dict[str, Any]
    confidence: float
    alternative_methods: List[AlternativeTransformation] = Field(default_factory=list)
    educational_note: str


class ColumnTransformationSummary(BaseModel):
    """Summary row for dataset-wide transformation table."""
    column: str
    data_type: str
    recommended_method: str
    selected_method: str = "none"
    count: int
    mean: Optional[float] = None
    median: Optional[float] = None
    std: Optional[float] = None
    min: Optional[float] = None
    max: Optional[float] = None
    skewness: Optional[float] = None
    outlier_percentage: float = 0.0
    has_negatives: bool = False
    has_zeros: bool = False
    recommendation: TransformationRecommendation


class DatasetTransformationSummaryResponse(BaseModel):
    """Dataset-wide overview of all transformable numerical features."""
    dataset_id: str
    current_version: int
    total_rows: int
    total_columns: int
    numerical_columns_count: int
    columns: List[ColumnTransformationSummary]


class ColumnTransformationDetailResponse(BaseModel):
    """Deep-dive transformation analysis and configuration state for a single column."""
    dataset_id: str
    column: str
    data_type: str
    current_distribution: ColumnDistributionMetrics
    recommendation: TransformationRecommendation
    calculation_breakdown: CalculationStepDetail
    supported_methods: List[str]


class TransformationPreviewRequest(BaseModel):
    """Request payload to simulate a non-destructive transformation."""
    column: str
    method: TransformationMethodEnum = TransformationMethodEnum.STANDARD
    feature_range_min: float = 0.0
    feature_range_max: float = 1.0
    parameters: Optional[Dict[str, Any]] = None


class SampleTransformedRow(BaseModel):
    """Side-by-side row sample showing original vs transformed value."""
    index: int
    original_value: float
    transformed_value: float


class TransformationPreviewResponse(BaseModel):
    """Non-destructive preview response containing before/after comparisons."""
    dataset_id: str
    column: str
    method: str
    parameters: Dict[str, Any]
    before: ColumnDistributionMetrics
    after: ColumnDistributionMetrics
    sample_rows: List[SampleTransformedRow] = Field(default_factory=list)
    calculation: CalculationStepDetail
    warnings: List[str] = Field(default_factory=list)
    explanation: Dict[str, Any] = Field(default_factory=dict)


class TransformationApplyRequest(BaseModel):
    """Request payload to permanently apply transformation and produce a new version."""
    column: str
    method: TransformationMethodEnum
    feature_range_min: float = 0.0
    feature_range_max: float = 1.0
    parameters: Optional[Dict[str, Any]] = None
    confirmed: bool = Field(default=False, description="Must be explicitly True to persist transformation")


class TransformationApplyResponse(BaseModel):
    """Response returned after successfully applying and versioning a transformation."""
    dataset_id: str
    operation_id: str
    new_version: int
    column: str
    method: str
    parameters: Dict[str, Any]
    before: ColumnDistributionMetrics
    after: ColumnDistributionMetrics
    message: str
    timestamp: str


class TransformationHistoryItem(BaseModel):
    """Audit log entry for a transformation operation."""
    operation_id: str
    operation: str = "data_transformation"
    column: str
    method: str
    parameters: Dict[str, Any] = Field(default_factory=dict)
    before: Dict[str, Any] = Field(default_factory=dict)
    after: Dict[str, Any] = Field(default_factory=dict)
    reason: str
    source_version: str
    new_version: str
    timestamp: str


class TransformationHistoryResponse(BaseModel):
    """Chronological list of all data transformations applied to the dataset."""
    dataset_id: str
    current_version: int
    history: List[TransformationHistoryItem] = Field(default_factory=list)
