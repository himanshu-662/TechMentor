"""Pydantic data models and schemas for Phase 8 Feature Engineering Engine."""
from typing import List, Dict, Any, Optional, Union
from enum import Enum
from pydantic import BaseModel, Field


class FeatureTypeEnum(str, Enum):
    MATHEMATICAL = "mathematical"
    INTERACTION = "interaction"
    RATIO = "ratio"
    DATETIME_PARTS = "datetime_parts"
    CYCLICAL = "cyclical"
    DATE_DIFFERENCE = "date_difference"
    AGGREGATION = "aggregation"
    BINNING = "binning"
    INDICATOR = "indicator"
    FREQUENCY = "frequency"
    TEXT_STATISTICS = "text_statistics"


class MathematicalOperatorEnum(str, Enum):
    ADD = "add"
    SUBTRACT = "subtract"
    MULTIPLY = "multiply"
    DIVIDE = "divide"
    ABS = "abs"
    SQUARE = "square"
    SQRT = "sqrt"
    LOG1P = "log1p"


class DivisionByZeroPolicyEnum(str, Enum):
    NAN = "nan"
    ZERO = "zero"
    CUSTOM_VALUE = "custom_value"


class BinningStrategyEnum(str, Enum):
    EQUAL_WIDTH = "equal_width"
    CUSTOM_BINS = "custom_bins"


class IndicatorOperatorEnum(str, Enum):
    GT = "gt"        # >
    GTE = "gte"      # >=
    LT = "lt"        # <
    LTE = "lte"      # <=
    EQ = "eq"        # ==
    NEQ = "neq"      # !=


class AggregationFunctionEnum(str, Enum):
    MEAN = "mean"
    SUM = "sum"
    MEDIAN = "median"
    MIN = "min"
    MAX = "max"
    COUNT = "count"
    STD = "std"


class TextStatisticTypeEnum(str, Enum):
    CHAR_COUNT = "char_count"
    WORD_COUNT = "word_count"
    SENTENCE_COUNT = "sentence_count"
    UPPERCASE_COUNT = "uppercase_count"
    DIGIT_COUNT = "digit_count"


class DatePartEnum(str, Enum):
    YEAR = "year"
    MONTH = "month"
    DAY = "day"
    WEEKDAY = "weekday"
    DAY_OF_YEAR = "day_of_year"
    WEEK_OF_YEAR = "week_of_year"
    QUARTER = "quarter"
    HOUR = "hour"
    MINUTE = "minute"
    SECOND = "second"
    IS_WEEKEND = "is_weekend"


class CyclicalPeriodEnum(str, Enum):
    HOUR_24 = "hour_24"
    MONTH_12 = "month_12"
    WEEKDAY_7 = "weekday_7"
    DAY_OF_YEAR_365 = "day_of_year_365"


class DateUnitEnum(str, Enum):
    DAYS = "days"
    HOURS = "hours"
    MINUTES = "minutes"
    SECONDS = "seconds"


class FeatureValidationSummary(BaseModel):
    """Integrity and anomaly validation report for engineered feature."""
    valid: bool
    total_rows: int
    null_count: int
    null_percentage: float = 0.0
    inf_count: int = 0
    is_constant: bool = False
    unique_count: int
    dtype: str
    warnings: List[str] = Field(default_factory=list)
    errors: List[str] = Field(default_factory=list)
    summary_stats: Dict[str, Any] = Field(default_factory=dict)


class FeatureEngineeringPreviewRequest(BaseModel):
    """Payload to simulate a feature engineering operation non-destructively."""
    feature_type: FeatureTypeEnum
    new_feature_name: str
    params: Dict[str, Any] = Field(default_factory=dict)


class SampleFeatureRow(BaseModel):
    """Preview row showing source column(s) and the generated feature value."""
    index: int
    source_values: Dict[str, Any]
    generated_value: Any
    is_anomaly: bool = False


class FeatureEngineeringPreviewResponse(BaseModel):
    """Non-destructive simulation preview response with validation and educational guidance."""
    dataset_id: str
    feature_name: str
    feature_type: str
    formula_human_readable: str
    preview_rows: List[SampleFeatureRow] = Field(default_factory=list)
    validation: FeatureValidationSummary
    educational_concept_id: str
    educational_explanation: Dict[str, Any] = Field(default_factory=dict)
    ml_impact_explanation: str
    step_by_step_calculation: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)


class FeatureEngineeringApplyRequest(BaseModel):
    """Payload to permanently create and append an engineered feature to the dataset."""
    feature_type: FeatureTypeEnum
    new_feature_name: str
    params: Dict[str, Any] = Field(default_factory=dict)
    confirmed: bool = Field(default=False, description="Must be explicitly True to persist")
    description: Optional[str] = None


class FeatureEngineeringApplyResponse(BaseModel):
    """Result of persisted feature engineering operation with new version snapshot."""
    dataset_id: str
    operation_id: str
    new_version: int
    feature_name: str
    feature_type: str
    shape: Dict[str, int]
    validation: FeatureValidationSummary
    message: str
    timestamp: str


class FeatureOpportunity(BaseModel):
    """Conservative, deterministic recommendation of a feature that can be engineered."""
    opportunity_id: str
    title: str
    category: str
    feature_type: FeatureTypeEnum
    columns_involved: List[str]
    rationale: str
    suggested_feature_name: str
    suggested_params: Dict[str, Any]
    confidence: str = "High"  # High, Medium, Low
    educational_concept_id: str


class FeatureOpportunitiesResponse(BaseModel):
    """Dataset-wide list of detected feature opportunities."""
    dataset_id: str
    total_opportunities: int
    opportunities: List[FeatureOpportunity] = Field(default_factory=list)
    dataset_summary: Dict[str, Any] = Field(default_factory=dict)


class FeatureHistoryItem(BaseModel):
    """Audit log record for an engineered feature in the dataset's history."""
    operation_id: str
    operation: str = "feature_engineering"
    feature_name: str
    feature_type: str
    params: Dict[str, Any] = Field(default_factory=dict)
    formula: str
    validation: Dict[str, Any] = Field(default_factory=dict)
    source_version: str
    new_version: str
    timestamp: str


class FeatureHistoryResponse(BaseModel):
    """Chronological history of all engineered features for this dataset."""
    dataset_id: str
    current_version: int
    total_features_engineered: int
    history: List[FeatureHistoryItem] = Field(default_factory=list)
