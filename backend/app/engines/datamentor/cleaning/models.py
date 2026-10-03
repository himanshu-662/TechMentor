from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
try:
    from app.models.explanation import OperationExplanation
except ImportError:
    from backend.app.models.explanation import OperationExplanation


class CleaningRecommendation(BaseModel):
    """Deterministic recommendation generated based on dataset profiling diagnostics."""
    column: Optional[str] = Field(default=None, description="Target column name")
    issue_type: str = Field(description="Detected issue category: missing_values, duplicate_rows, constant_column")
    recommended_method: str = Field(description="Recommended resolution method (median, mean, mode, remove, drop)")
    reason: str = Field(description="Data-driven pedagogical rationale for this recommendation")
    evidence: Dict[str, Any] = Field(default_factory=dict, description="Concrete profile evidence (missing %, skewness, etc.)")
    alternatives: List[str] = Field(default_factory=list, description="Available alternative methods")
    educational_explanation: str = Field(description="Beginner-friendly explanation of why this method is preferred")
    math_breakdown: Optional[str] = Field(default=None, description="Simple mathematical calculation display")


class CleaningRequest(BaseModel):
    """Payload to preview or apply a cleaning transformation."""
    operation: str = Field(
        ...,
        description="Operation type: 'impute_missing', 'drop_duplicates', 'drop_constant_column', 'drop_column'"
    )
    column: Optional[str] = Field(
        default=None,
        description="Target column name for column-specific actions"
    )
    method: Optional[str] = Field(
        default=None,
        description="Specific strategy to execute: 'median', 'mean', 'mode', 'constant', 'drop_rows'"
    )
    constant_value: Optional[Any] = Field(
        default=None,
        description="Explicit constant sentinel value when method is 'constant'"
    )
    confirmation: bool = Field(
        default=True,
        description="Explicit confirmation acknowledging the transformation"
    )


class MathCalculationDetails(BaseModel):
    """Educational step-by-step mathematical demonstration of the technique."""
    technique: str
    formula: Optional[str] = None
    sample_values: Optional[List[Any]] = None
    step_by_step: List[str] = Field(default_factory=list)
    result_value: Any


class CleaningPreviewResponse(BaseModel):
    """Non-destructive preview containing before/after comparison and 7-pillar explanation."""
    operation: str
    column: Optional[str] = None
    method: Optional[str] = None
    affected_rows: int
    metrics_before: Dict[str, Any]
    metrics_after: Dict[str, Any]
    sample_before: List[Dict[str, Any]]
    sample_after: List[Dict[str, Any]]
    explanation: OperationExplanation
    math_calculation: Optional[MathCalculationDetails] = None


class CleaningApplyResponse(BaseModel):
    """Payload returned upon applying a confirmed transformation and version snapshot."""
    dataset_id: str
    version: int
    operation_id: str
    operation: str
    column: Optional[str] = None
    method: Optional[str] = None
    affected_rows: int
    metrics_before: Dict[str, Any]
    metrics_after: Dict[str, Any]
    explanation: OperationExplanation
    row_count: int
    column_count: int
    missing_cells: int
    duplicate_rows: int
    preview_rows: List[Dict[str, Any]]
    status: str = "success"
    message: str


class UndoResponse(BaseModel):
    """Payload returned when reverting the last transformation."""
    dataset_id: str
    reverted_operation: Dict[str, Any]
    remaining_history_count: int
    current_version: int
    row_count: int
    column_count: int
    missing_cells: int
    duplicate_rows: int
    message: str
