from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
try:
    from app.models.explanation import OperationExplanation
except ImportError:
    from backend.app.models.explanation import OperationExplanation


class CleanOperationRequest(BaseModel):
    """Request payload to preview or apply a cleaning operation."""
    action: str = Field(
        ...,
        description="Type of cleaning action: 'impute_missing', 'drop_duplicates', 'drop_column', 'drop_missing_rows'"
    )
    column: Optional[str] = Field(
        default=None,
        description="Target column name for column-specific operations"
    )
    strategy: Optional[str] = Field(
        default=None,
        description="Specific strategy to apply: 'median', 'mean', 'mode', 'constant', 'drop_rows', 'drop_column'"
    )
    constant_value: Optional[Any] = Field(
        default=None,
        description="Value to use when strategy is 'constant'"
    )


class CleanPreviewResponse(BaseModel):
    """Response payload for a non-mutating preview of a cleaning transformation."""
    operation_id: str
    action: str
    column: Optional[str] = None
    strategy: Optional[str] = None
    explanation: OperationExplanation
    metrics_before: Dict[str, Any]
    metrics_after: Dict[str, Any]
    preview_rows_before: List[Dict[str, Any]]
    preview_rows_after: List[Dict[str, Any]]


class CleanApplyResponse(BaseModel):
    """Response payload when a cleaning transformation is executed on the dataset."""
    dataset_id: str
    operation_id: str
    action: str
    column: Optional[str] = None
    strategy: Optional[str] = None
    explanation: OperationExplanation
    metrics_before: Dict[str, Any]
    metrics_after: Dict[str, Any]
    row_count: int
    column_count: int
    missing_cells: int
    duplicate_rows: int
    preview_rows: List[Dict[str, Any]]
    status: str = "success"
    message: str
