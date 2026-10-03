"""FastAPI Router endpoints for Phase 7 Data Transformations."""
from typing import Dict, Any
from fastapi import APIRouter, Path, HTTPException

from app.transformations.models import (
    DatasetTransformationSummaryResponse,
    ColumnTransformationDetailResponse,
    TransformationPreviewRequest,
    TransformationPreviewResponse,
    TransformationApplyRequest,
    TransformationApplyResponse,
    TransformationHistoryResponse
)
from app.services import transformation_service

router = APIRouter(prefix="/datasets/{dataset_id}/transformations", tags=["transformations"])


@router.get("", response_model=DatasetTransformationSummaryResponse)
def get_transformations_summary(
    dataset_id: str = Path(..., description="Unique dataset identifier")
):
    """Retrieve dataset-level transformation summary and recommendations across all numerical features."""
    return transformation_service.get_dataset_transformation_summary(dataset_id)


@router.get("/recommendations")
def get_transformation_recommendations(
    dataset_id: str = Path(..., description="Unique dataset identifier")
):
    """Retrieve all deterministic recommendations for all numerical features."""
    summary = transformation_service.get_dataset_transformation_summary(dataset_id)
    return {
        "dataset_id": dataset_id,
        "recommendations": {
            col.column: col.recommendation for col in summary.columns
        }
    }


@router.get("/history", response_model=TransformationHistoryResponse)
def get_transformation_history(
    dataset_id: str = Path(..., description="Unique dataset identifier")
):
    """Retrieve the chronological audit trail of all transformation operations applied."""
    return transformation_service.get_transformation_history(dataset_id)


@router.post("/preview", response_model=TransformationPreviewResponse)
def preview_transformation(
    dataset_id: str = Path(..., description="Unique dataset identifier"),
    request: TransformationPreviewRequest = ...
):
    """Non-destructively simulate a data transformation on an in-memory copy."""
    return transformation_service.preview_transformation(dataset_id, request)


@router.post("/apply", response_model=TransformationApplyResponse)
def apply_transformation(
    dataset_id: str = Path(..., description="Unique dataset identifier"),
    request: TransformationApplyRequest = ...
):
    """Apply transformation to dataset, creating an immutable new version snapshot."""
    return transformation_service.apply_transformation(dataset_id, request)


@router.post("/undo")
def undo_transformation(
    dataset_id: str = Path(..., description="Unique dataset identifier")
):
    """Revert the most recent operation on the dataset and restore previous version snapshot."""
    return transformation_service.undo_transformation(dataset_id)


@router.get("/{column}", response_model=ColumnTransformationDetailResponse)
def get_column_transformation_detail(
    dataset_id: str = Path(..., description="Unique dataset identifier"),
    column: str = Path(..., description="Numerical column name to inspect")
):
    """Retrieve deep-dive distribution stats, histogram bins, boxplot, and step-by-step math for a specific column."""
    return transformation_service.get_column_transformation_detail(dataset_id, column)
