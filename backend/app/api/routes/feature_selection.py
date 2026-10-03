"""FastAPI Router for Step 09: Feature Selection (SelectKBest)."""
from fastapi import APIRouter, Path
from app.feature_selection.models import (
    FeatureSelectionPreviewRequest,
    FeatureSelectionPreviewResponse,
    FeatureSelectionApplyRequest,
    FeatureSelectionApplyResponse,
    FeatureSelectionSummaryResponse
)
from app.feature_selection.feature_selection_engine import FeatureSelectionEngine

router = APIRouter(prefix="/datasets/{dataset_id}/feature-selection", tags=["feature-selection"])


@router.get("/summary", response_model=FeatureSelectionSummaryResponse)
@router.get("", response_model=FeatureSelectionSummaryResponse)
def get_feature_selection_summary(
    dataset_id: str = Path(..., description="Unique dataset identifier")
):
    """Retrieve numeric features, candidate targets, and recommended selection configuration."""
    return FeatureSelectionEngine.get_summary(dataset_id)


@router.post("/preview", response_model=FeatureSelectionPreviewResponse)
def preview_feature_selection(
    dataset_id: str = Path(..., description="Unique dataset identifier"),
    request: FeatureSelectionPreviewRequest = ...
):
    """Simulate SelectKBest feature scoring and ranking without mutating dataset."""
    return FeatureSelectionEngine.preview_selection(dataset_id, request)


@router.post("/apply", response_model=FeatureSelectionApplyResponse)
def apply_feature_selection(
    dataset_id: str = Path(..., description="Unique dataset identifier"),
    request: FeatureSelectionApplyRequest = ...
):
    """Apply feature selection filtering and produce a new snapshot version."""
    return FeatureSelectionEngine.apply_selection(dataset_id, request)
