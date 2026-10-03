from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Query, status
from app.services.outlier_service import outlier_service
from app.outliers.models import (
    DatasetOutlierSummaryResponse,
    ColumnOutlierDetailResponse,
    OutlierPreviewRequest,
    OutlierPreviewResponse,
    OutlierApplyRequest,
    OutlierApplyResponse
)

router = APIRouter(prefix="/datasets", tags=["Outlier Detection & Treatment"])


@router.get(
    "/{dataset_id}/outliers",
    response_model=DatasetOutlierSummaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get dataset-level outlier summary",
    description="Inspects all numerical columns, computes outlier counts, and provides method recommendations."
)
async def get_dataset_outlier_summary(dataset_id: str) -> DatasetOutlierSummaryResponse:
    return outlier_service.get_dataset_outlier_summary(dataset_id)


@router.get(
    "/{dataset_id}/outliers/recommendations",
    status_code=status.HTTP_200_OK,
    summary="Get outlier recommendations for all columns",
    description="Returns deterministic, evidence-based method recommendations for every numerical column."
)
async def get_outlier_recommendations(dataset_id: str):
    summary = outlier_service.get_dataset_outlier_summary(dataset_id)
    return {
        "dataset_id": dataset_id,
        "recommendations": {
            col.column: col.recommendation for col in summary.columns
        }
    }


@router.get(
    "/{dataset_id}/outliers/history",
    status_code=status.HTTP_200_OK,
    summary="Get outlier transformation history",
    description="Returns the history audit trail of applied outlier operations on this dataset."
)
async def get_outlier_history(dataset_id: str):
    history = outlier_service.get_outlier_history(dataset_id)
    return {
        "dataset_id": dataset_id,
        "outlier_operations_count": len(history),
        "history": history
    }


@router.get(
    "/{dataset_id}/outliers/{column}",
    response_model=ColumnOutlierDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get deep-dive outlier details for a column",
    description="Returns statistical distribution, step-by-step mathematical calculations, and sample flagged records."
)
async def get_column_outlier_detail(
    dataset_id: str,
    column: str,
    method: Optional[str] = Query(None, description="Detection method: iqr, zscore, modified_zscore"),
    multiplier: Optional[float] = Query(None, description="IQR multiplier (default: 1.5)"),
    threshold: Optional[float] = Query(None, description="Z-Score or Modified Z-Score threshold (default: 3.0 or 3.5)")
) -> ColumnOutlierDetailResponse:
    params: Dict[str, Any] = {}
    if multiplier is not None:
        params["multiplier"] = multiplier
    if threshold is not None:
        params["threshold"] = threshold

    return outlier_service.get_column_outlier_detail(
        dataset_id=dataset_id,
        column=column,
        method=method,
        parameters=params if params else None
    )


@router.post(
    "/{dataset_id}/outliers/preview",
    response_model=OutlierPreviewResponse,
    status_code=status.HTTP_200_OK,
    summary="Preview outlier treatment non-destructively",
    description="Simulates treatment (keep, remove, cap, custom_bounds) and returns before vs after metrics without modifying the dataset."
)
async def preview_outlier_treatment(
    dataset_id: str,
    request: OutlierPreviewRequest
) -> OutlierPreviewResponse:
    return outlier_service.preview_treatment(dataset_id, request)


@router.post(
    "/{dataset_id}/outliers/apply",
    response_model=OutlierApplyResponse,
    status_code=status.HTTP_200_OK,
    summary="Apply and persist outlier treatment",
    description="Creates a new dataset version snapshot, updates current working copy, records transformation audit log, and preserves original dataset."
)
async def apply_outlier_treatment(
    dataset_id: str,
    request: OutlierApplyRequest
) -> OutlierApplyResponse:
    return outlier_service.apply_treatment(dataset_id, request)
