"""Pydantic data models for Step 08: Dimensionality Reduction (PCA, LDA, SVD)."""
from typing import List, Dict, Any, Optional
from enum import Enum
from pydantic import BaseModel, Field


class DimensionalityMethodEnum(str, Enum):
    PCA = "pca"
    LDA = "lda"
    SVD = "svd"


class ScreePlotPoint(BaseModel):
    """Component variance metrics for scree plot."""
    component: int
    component_name: str
    explained_variance_ratio: float
    cumulative_variance_ratio: float
    singular_value: Optional[float] = None


class DimensionalitySummaryResponse(BaseModel):
    """Feasibility profile and metadata summary for dimensionality reduction."""
    dataset_id: str
    total_rows: int
    total_columns: int
    numeric_feature_count: int
    numeric_features: List[str]
    potential_target_columns: List[str]
    recommended_method: str = "pca"
    recommended_components: int = 2
    can_execute: bool = True
    message: str



class DimensionalityPreviewRequest(BaseModel):
    """Request payload to simulate dimensionality reduction."""
    method: DimensionalityMethodEnum = DimensionalityMethodEnum.PCA
    n_components: int = Field(default=2, ge=1, le=100)
    target_column: Optional[str] = None  # Mandatory for LDA
    feature_columns: Optional[List[str]] = None
    scale_first: bool = True


class SampleComponentRow(BaseModel):
    """Sample row displaying generated reduced dimensions."""
    index: int
    components: Dict[str, float]


class DimensionalityPreviewResponse(BaseModel):
    """Non-destructive simulation preview for dimensionality reduction."""
    dataset_id: str
    method: str
    n_original_features: int
    n_components: int
    original_feature_names: List[str]
    new_component_names: List[str]
    explained_variance_ratio: List[float] = Field(default_factory=list)
    cumulative_variance_ratio: List[float] = Field(default_factory=list)
    total_variance_explained: float = 0.0
    scree_plot_data: List[ScreePlotPoint] = Field(default_factory=list)
    component_loadings: Dict[str, Dict[str, float]] = Field(default_factory=dict)
    sample_rows: List[SampleComponentRow] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    explanation: Dict[str, Any] = Field(default_factory=dict)


class DimensionalityApplyRequest(BaseModel):
    """Request payload to permanently apply dimensionality reduction."""
    method: DimensionalityMethodEnum
    n_components: int = 2
    target_column: Optional[str] = None
    feature_columns: Optional[List[str]] = None
    scale_first: bool = True
    confirmed: bool = Field(default=False, description="Must be explicitly true to persist")


class DimensionalityApplyResponse(BaseModel):
    """Result of applied dimensionality reduction with new snapshot version."""
    dataset_id: str
    operation_id: str
    new_version: int
    method: str
    n_components: int
    new_component_names: List[str]
    shape: Dict[str, int]
    total_variance_explained: float
    message: str
    timestamp: str
