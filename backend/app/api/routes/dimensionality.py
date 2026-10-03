"""FastAPI Router for Step 08: Dimensionality Reduction."""
from fastapi import APIRouter, Path
from app.dimensionality.models import (
    DimensionalityPreviewRequest,
    DimensionalityPreviewResponse,
    DimensionalityApplyRequest,
    DimensionalityApplyResponse,
    DimensionalitySummaryResponse
)
from app.dimensionality.dimensionality_engine import DimensionalityEngine

router = APIRouter(prefix="/datasets/{dataset_id}/dimensionality", tags=["dimensionality"])


@router.get("/summary", response_model=DimensionalitySummaryResponse)
@router.get("", response_model=DimensionalitySummaryResponse)
def get_dimensionality_summary(
    dataset_id: str = Path(..., description="Unique dataset identifier")
):
    """Retrieve numerical features, potential targets, and dimensionality reduction feasibility."""
    return DimensionalityEngine.get_summary(dataset_id)


@router.post("/preview", response_model=DimensionalityPreviewResponse)
def preview_dimensionality(
    dataset_id: str = Path(..., description="Unique dataset identifier"),
    request: DimensionalityPreviewRequest = ...
):
    """Simulate dimensionality reduction (PCA, LDA, SVD) without mutating dataset."""
    return DimensionalityEngine.preview_reduction(dataset_id, request)


@router.post("/apply", response_model=DimensionalityApplyResponse)
def apply_dimensionality(
    dataset_id: str = Path(..., description="Unique dataset identifier"),
    request: DimensionalityApplyRequest = ...
):
    """Apply dimensionality reduction and produce a new snapshot version."""
    return DimensionalityEngine.apply_reduction(dataset_id, request)
