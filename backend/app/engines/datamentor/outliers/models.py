"""Data models and Pydantic schemas for Phase 6 Outlier Detection and Treatment."""
from typing import List, Dict, Any, Optional
from enum import Enum
from pydantic import BaseModel, Field


class DetectionMethodEnum(str, Enum):
    IQR = "iqr"
    ZSCORE = "zscore"
    MODIFIED_ZSCORE = "modified_zscore"


class TreatmentTypeEnum(str, Enum):
    KEEP = "keep"
    REMOVE = "remove"
    CAP = "cap"
    CUSTOM_BOUNDS = "custom_bounds"
    FLAG = "flag"


class CalculationDetail(BaseModel):
    """Step-by-step mathematical breakdown of outlier detection using real values."""
    method: str
    formula: str
    steps: List[str]
    parameters: Dict[str, Any]


class OutlierRecord(BaseModel):
    """Individual data row flagged as an outlier."""
    index: int
    value: float
    direction: str  # "high", "low"
    score: Optional[float] = None
    row_data: Dict[str, Any] = Field(default_factory=dict)


class HistogramBin(BaseModel):
    """Histogram bin data for visualization."""
    bin_start: float
    bin_end: float
    count: int
    has_outlier: bool = False


class DistributionStats(BaseModel):
    """Distribution metrics for a numerical column."""
    count: int
    missing_count: int
    min: Optional[float] = None
    max: Optional[float] = None
    mean: Optional[float] = None
    median: Optional[float] = None
    std: Optional[float] = None
    mad: Optional[float] = None
    q1: Optional[float] = None
    q3: Optional[float] = None
    iqr: Optional[float] = None
    skewness: Optional[float] = None
    histogram_bins: List[HistogramBin] = Field(default_factory=list)


class AlternativeMethod(BaseModel):
    """Alternative detection method suggestion."""
    name: str
    method_id: str
    description: str
    trade_off: str


class OutlierRecommendation(BaseModel):
    """Deterministic, evidence-based outlier detection recommendation."""
    recommended_method: str
    reason: str
    evidence: Dict[str, Any]
    alternative_methods: List[AlternativeMethod] = Field(default_factory=list)


class ColumnOutlierSummary(BaseModel):
    """Outlier summary for an individual numerical column."""
    column: str
    recommended_method: str
    selected_method: str
    outlier_count: int
    outlier_percentage: float
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None
    skewness: Optional[float] = None
    recommendation: OutlierRecommendation


class DatasetOutlierSummaryResponse(BaseModel):
    """Dataset-wide outlier detection overview."""
    dataset_id: str
    current_version: int
    total_rows: int
    total_columns: int
    numerical_columns_count: int
    columns_with_outliers_count: int
    total_outliers_detected: int
    columns: List[ColumnOutlierSummary]


class ColumnOutlierDetailResponse(BaseModel):
    """Deep-dive outlier analysis for a specific numerical column."""
    dataset_id: str
    column: str
    data_type: str
    method: str
    parameters: Dict[str, Any]
    outlier_count: int
    outlier_percentage: float
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None
    distribution: DistributionStats
    calculation: CalculationDetail
    recommendation: OutlierRecommendation
    outlier_records_sample: List[OutlierRecord] = Field(default_factory=list)
    total_flagged_records: int


class OutlierPreviewRequest(BaseModel):
    """Request payload to preview an outlier treatment operation."""
    column: str
    detection_method: DetectionMethodEnum = DetectionMethodEnum.IQR
    parameters: Optional[Dict[str, Any]] = None
    treatment: TreatmentTypeEnum = TreatmentTypeEnum.CAP
    custom_lower: Optional[float] = None
    custom_upper: Optional[float] = None


class MetricsComparison(BaseModel):
    """Summary metrics of the column before or after treatment."""
    row_count: int
    column_count: int
    outlier_count: int
    min: Optional[float] = None
    max: Optional[float] = None
    mean: Optional[float] = None
    median: Optional[float] = None
    std: Optional[float] = None
    skewness: Optional[float] = None
    histogram_bins: List[HistogramBin] = Field(default_factory=list)


class SampleChangedRecord(BaseModel):
    """Sample preview showing a record before and after treatment."""
    index: int
    original_value: float
    treated_value: Optional[float] = None
    action_taken: str


class OutlierPreviewResponse(BaseModel):
    """Non-destructive preview response for outlier treatment."""
    dataset_id: str
    column: str
    treatment: str
    detection_method: str
    parameters: Dict[str, Any]
    before: MetricsComparison
    after: MetricsComparison
    affected_rows: int
    rows_removed: int
    values_capped: int
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None
    sample_changed_records: List[SampleChangedRecord] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    educational_impact: Optional[Dict[str, Any]] = Field(default_factory=dict)


class OutlierApplyRequest(BaseModel):
    """Request payload to apply an outlier treatment with explicit confirmation."""
    column: str
    detection_method: DetectionMethodEnum = DetectionMethodEnum.IQR
    parameters: Optional[Dict[str, Any]] = None
    treatment: TreatmentTypeEnum = TreatmentTypeEnum.CAP
    custom_lower: Optional[float] = None
    custom_upper: Optional[float] = None
    confirmed: bool = Field(default=False, description="Must be explicitly True to apply transformation")


class OutlierApplyResponse(BaseModel):
    """Response returned after successfully persisting an outlier treatment."""
    dataset_id: str
    operation_id: str
    new_version: int
    treatment: str
    column: str
    before: MetricsComparison
    after: MetricsComparison
    affected_rows: int
    message: str
    timestamp: str
