"""FastAPI Router endpoints for Phase 8 Feature Engineering Engine."""
from typing import Dict, Any
from fastapi import APIRouter, Path

from app.feature_engineering.models import (
    FeatureOpportunitiesResponse,
    FeatureEngineeringPreviewRequest,
    FeatureEngineeringPreviewResponse,
    FeatureEngineeringApplyRequest,
    FeatureEngineeringApplyResponse,
    FeatureHistoryResponse
)
from app.services import feature_engineering_service

router = APIRouter(prefix="/datasets/{dataset_id}/feature-engineering", tags=["feature-engineering"])


@router.get("/opportunities", response_model=FeatureOpportunitiesResponse)
def get_feature_opportunities(
    dataset_id: str = Path(..., description="Unique dataset identifier")
):
    """Scan dataset and return conservative, high-value feature engineering opportunities."""
    return feature_engineering_service.get_feature_opportunities(dataset_id)


@router.get("/history", response_model=FeatureHistoryResponse)
def get_feature_history(
    dataset_id: str = Path(..., description="Unique dataset identifier")
):
    """Retrieve the chronological audit history of all engineered features."""
    return feature_engineering_service.get_feature_history(dataset_id)


@router.post("/preview", response_model=FeatureEngineeringPreviewResponse)
def preview_feature_engineering(
    dataset_id: str = Path(..., description="Unique dataset identifier"),
    request: FeatureEngineeringPreviewRequest = ...
):
    """Non-destructively simulate feature engineering with sample preview and educational explanation."""
    return feature_engineering_service.preview_feature_engineering(dataset_id, request)


@router.post("/apply", response_model=FeatureEngineeringApplyResponse)
def apply_feature_engineering(
    dataset_id: str = Path(..., description="Unique dataset identifier"),
    request: FeatureEngineeringApplyRequest = ...
):
    """Permanently engineer and append a new feature to the dataset, saving a new version snapshot."""
    return feature_engineering_service.apply_feature_engineering(dataset_id, request)


@router.post("/undo")
def undo_feature_engineering(
    dataset_id: str = Path(..., description="Unique dataset identifier")
):
    """Revert the most recent operation on the dataset and restore the previous version snapshot."""
    return feature_engineering_service.undo_feature_operation(dataset_id)
