"""Pydantic data models for Step 09: Feature Selection (SelectKBest)."""
from typing import List, Dict, Any, Optional
from enum import Enum
from pydantic import BaseModel, Field, root_validator


class FeatureScorerEnum(str, Enum):
    F_CLASSIF = "f_classif"
    F_REGRESSION = "f_regression"
    MUTUAL_INFO_CLASSIF = "mutual_info_classif"
    MUTUAL_INFO_REGRESSION = "mutual_info_regression"


class FeatureScoreDetail(BaseModel):
    """Score and ranking for an individual feature."""
    feature: str
    score: float
    p_value: Optional[float] = None
    rank: int
    selected: bool


class FeatureSelectionSummaryResponse(BaseModel):
    """Feasibility profile and metadata summary for feature selection."""
    dataset_id: str
    total_rows: int
    total_columns: int
    numeric_feature_count: int
    numeric_features: List[str]
    potential_target_columns: List[str]
    recommended_target: Optional[str] = None
    recommended_scoring: str = "f_classif"
    recommended_k: int = 3
    can_execute: bool = True
    message: str


class FeatureSelectionPreviewRequest(BaseModel):
    """Request payload to simulate SelectKBest feature selection."""
    target_column: str
    k: int = Field(default=3, ge=1)
    scoring_func: FeatureScorerEnum = FeatureScorerEnum.F_CLASSIF
    feature_columns: Optional[List[str]] = None

    @root_validator(pre=True)
    def handle_score_func_alias(cls, values):
        if isinstance(values, dict):
            if "score_func" in values and "scoring_func" not in values:
                values["scoring_func"] = values["score_func"]
        return values


class FeatureSelectionPreviewResponse(BaseModel):
    """Non-destructive simulation preview for Feature Selection."""
    dataset_id: str
    target_column: str
    k: int
    scoring_func: str
    selected_features: List[str]
    removed_features: List[str]
    feature_scores: List[FeatureScoreDetail] = Field(default_factory=list)
    before_columns_count: int
    after_columns_count: int
    warnings: List[str] = Field(default_factory=list)
    explanation: Dict[str, Any] = Field(default_factory=dict)


class FeatureSelectionApplyRequest(BaseModel):
    """Request payload to permanently apply feature selection filtering."""
    target_column: str
    k: int = Field(default=3, ge=1)
    scoring_func: FeatureScorerEnum = FeatureScorerEnum.F_CLASSIF
    feature_columns: Optional[List[str]] = None
    confirmed: bool = Field(default=False, description="Must be explicitly true to persist")

    @root_validator(pre=True)
    def handle_score_func_alias(cls, values):
        if isinstance(values, dict):
            if "score_func" in values and "scoring_func" not in values:
                values["scoring_func"] = values["score_func"]
        return values


class FeatureSelectionApplyResponse(BaseModel):
    """Result of applied feature selection with new snapshot version."""
    success: bool = True
    dataset_id: str
    operation_id: str
    new_version: int
    target_column: str
    k: int
    selected_features: List[str]
    removed_features: List[str]
    shape: Dict[str, int]
    message: str
    timestamp: str

