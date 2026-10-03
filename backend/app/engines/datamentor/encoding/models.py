import pandas as pd
from typing import List, Dict, Any, Optional
from enum import Enum
from pydantic import BaseModel, Field, field_validator


class EncodingMethodEnum(str, Enum):
    ONE_HOT = "one_hot"
    LABEL = "label"
    ORDINAL = "ordinal"
    FREQUENCY = "frequency"


class ColumnCardinalityInfo(BaseModel):
    """Categorical cardinality metrics and recommendation insights."""
    column: str
    unique_count: int
    top_categories: List[str] = Field(default_factory=list)
    all_categories: List[str] = Field(default_factory=list, description="List of unique categories for ordering UI")
    category_counts: Dict[str, int] = Field(default_factory=dict, description="Frequency counts of top categories")
    has_nulls: bool = False
    null_count: int = 0
    recommended_method: str = "one_hot"
    rationale: str = ""
    detected_ordinal_order: Optional[List[str]] = Field(default=None, description="Auto-detected natural hierarchy if found")


class EncodingPreviewRequest(BaseModel):
    """Request payload to simulate categorical encoding."""
    columns: List[str]
    method: EncodingMethodEnum = EncodingMethodEnum.ONE_HOT
    handle_unknown: str = "ignore"
    drop_first: bool = False
    ordinal_mappings: Optional[Dict[str, List[str]]] = None
    frequency_metric: Optional[str] = Field(default="frequency", description="'frequency' for proportions [0,1], or 'count' for absolute integers")
    rare_category_threshold: Optional[float] = Field(default=None, description="Proportion threshold (e.g. 0.02) to group rare categories into 'Other'")


class SampleEncodedRow(BaseModel):
    """Preview row showing before and after encoded features."""
    index: int
    original_values: Dict[str, Any]
    encoded_values: Dict[str, Any]

    @field_validator("original_values", "encoded_values", mode="before")
    @classmethod
    def sanitize_dict_values(cls, v):
        if not isinstance(v, dict):
            return v
        sanitized = {}
        for k, val in v.items():
            if hasattr(val, "item"):
                val = val.item()
            elif pd.isna(val):
                val = None
            sanitized[str(k)] = val
        return sanitized


class EncodingPreviewResponse(BaseModel):
    """Non-destructive simulation preview for categorical encoding."""
    dataset_id: str
    method: str
    columns_encoded: List[str]
    new_columns_created: List[str]
    before_columns_count: int
    after_columns_count: int
    before_shape: Dict[str, int] = Field(default_factory=lambda: {"rows": 0, "columns": 0})
    after_shape: Dict[str, int] = Field(default_factory=lambda: {"rows": 0, "columns": 0})
    sparsity_percentage: float = Field(default=0.0, description="Percentage of zeros in newly generated encoded columns")
    memory_impact_kb: float = Field(default=0.0, description="Estimated delta in RAM consumption (KB)")
    dummy_variable_trap_risk: bool = Field(default=False, description="True if one-hot without drop_first on nominal data with linear regression risk")
    sample_rows: List[SampleEncodedRow] = Field(default_factory=list)
    category_mappings: Dict[str, Any] = Field(default_factory=dict)
    warnings: List[str] = Field(default_factory=list)
    explanation: Dict[str, Any] = Field(default_factory=dict)


class EncodingApplyRequest(BaseModel):
    """Request payload to permanently apply categorical encoding."""
    columns: List[str]
    method: EncodingMethodEnum
    handle_unknown: str = "ignore"
    drop_first: bool = False
    ordinal_mappings: Optional[Dict[str, List[str]]] = None
    frequency_metric: Optional[str] = "frequency"
    rare_category_threshold: Optional[float] = None
    confirmed: bool = Field(default=False, description="Must be explicitly true to persist")


class EncodingApplyResponse(BaseModel):
    """Result of applied encoding operation with new snapshot version."""
    dataset_id: str
    operation_id: str
    new_version: int
    method: str
    columns_encoded: List[str]
    new_columns_created: List[str]
    shape: Dict[str, int]
    sparsity_percentage: float = 0.0
    message: str
    timestamp: str


class EncodingSummaryResponse(BaseModel):
    """Summary of all categorical features available for encoding."""
    dataset_id: str
    total_categorical_columns: int
    columns: List[ColumnCardinalityInfo] = Field(default_factory=list)
