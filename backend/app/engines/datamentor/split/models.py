"""Pydantic data models for Step 10: Train-Test Split."""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class TrainTestSplitRequest(BaseModel):
    """Request payload to configure and perform train/test split."""
    target_column: str
    test_size: float = Field(default=0.2, ge=0.05, le=0.5, description="Fraction of dataset for testing (e.g. 0.2 for 80/20)")
    random_state: int = Field(default=42, description="Deterministic pseudo-random seed")
    stratify: bool = Field(default=False, description="Preserve target class distribution in classification")


class SampleSplitRow(BaseModel):
    """Row preview showing feature values and split label."""
    index: int
    split_type: str  # "train" or "test"
    features: Dict[str, Any]
    target_value: Any


class SplitSummaryResponse(BaseModel):
    """Dataset split readiness summary with recommendations and target detection."""
    dataset_id: str
    total_rows: int
    total_columns: int
    numeric_feature_count: int
    feature_columns: List[str]
    potential_target_columns: List[str]
    recommended_target: Optional[str] = None
    recommended_test_size: float = 0.2
    recommended_stratify: bool = True
    can_execute: bool = True
    split_already_performed: bool = False
    message: str


class TrainTestSplitResponse(BaseModel):
    """Result of train/test partition with distribution breakdowns."""
    success: bool = True
    dataset_id: str
    target_column: str
    total_rows: int
    train_rows: int
    test_rows: int
    train_percentage: float
    test_percentage: float
    feature_columns: List[str]
    target_type: str  # "classification" or "regression"
    target_distribution: Dict[str, Any] = Field(default_factory=dict)
    sample_rows: List[SampleSplitRow] = Field(default_factory=list)
    explanation: Dict[str, Any] = Field(default_factory=dict)
    leakage_safeguards: List[str] = Field(default_factory=list)
    message: str
    timestamp: str

