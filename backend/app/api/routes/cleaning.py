from fastapi import APIRouter, status, Path
from typing import List, Dict, Any, Optional

try:
    from app.cleaning.models import (
        CleaningRecommendation,
        CleaningRequest,
        CleaningPreviewResponse,
        CleaningApplyResponse,
        UndoResponse
    )
    from app.services.cleaning_service import cleaning_service
except ImportError:
    from backend.app.cleaning.models import (
        CleaningRecommendation,
        CleaningRequest,
        CleaningPreviewResponse,
        CleaningApplyResponse,
        UndoResponse
    )
    from backend.app.services.cleaning_service import cleaning_service

router = APIRouter(prefix="/datasets", tags=["Automated Data Cleaning Engine (Phase 5)"])


# 1. Recommendations Endpoint
@router.get(
    "/{dataset_id}/cleaning/recommendations",
    response_model=List[CleaningRecommendation],
    status_code=status.HTTP_200_OK,
    summary="Get automated, deterministic cleaning recommendations",
    description="Analyzes Phase 3 profiling diagnostics to recommend imputation, deduplication, and constant pruning methods with supporting evidence."
)
async def get_cleaning_recommendations(
    dataset_id: str = Path(..., description="Target dataset identifier")
) -> List[CleaningRecommendation]:
    return cleaning_service.get_recommendations(dataset_id)


# 2. Preview Endpoint
@router.post(
    "/{dataset_id}/cleaning/preview",
    response_model=CleaningPreviewResponse,
    status_code=status.HTTP_200_OK,
    summary="Preview explainable cleaning transformation without mutating data",
    description="Simulates operation on a copy, computes before/after distributions, row shifts, educational math breakdown, and 7-pillar explanation."
)
async def preview_cleaning_operation(
    dataset_id: str = Path(..., description="Target dataset identifier"),
    payload: CleaningRequest = ...
) -> CleaningPreviewResponse:
    return cleaning_service.preview_cleaning(dataset_id, payload)


# Legacy /clean/preview alias support
@router.post(
    "/{dataset_id}/clean/preview",
    response_model=CleaningPreviewResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False
)
async def legacy_preview_cleaning_operation(
    dataset_id: str = Path(...),
    payload: Dict[str, Any] = ...
) -> CleaningPreviewResponse:
    op = payload.get("operation") or payload.get("action") or "impute_missing"
    meth = payload.get("method") or payload.get("strategy")
    req = CleaningRequest(
        operation=op,
        column=payload.get("column"),
        method=meth,
        constant_value=payload.get("constant_value"),
        confirmation=payload.get("confirmation", True)
    )
    return cleaning_service.preview_cleaning(dataset_id, req)


# 3. Apply Endpoint
@router.post(
    "/{dataset_id}/cleaning/apply",
    response_model=CleaningApplyResponse,
    status_code=status.HTTP_200_OK,
    summary="Apply confirmed cleaning transformation and create new version",
    description="Transforms working dataset, persists new snapshot version, logs to history.json, and invalidates profiling cache. Never mutates original/."
)
async def apply_cleaning_operation(
    dataset_id: str = Path(..., description="Target dataset identifier"),
    payload: CleaningRequest = ...
) -> CleaningApplyResponse:
    return cleaning_service.apply_cleaning(dataset_id, payload)


# Legacy /clean/apply alias support
@router.post(
    "/{dataset_id}/clean/apply",
    response_model=CleaningApplyResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False
)
async def legacy_apply_cleaning_operation(
    dataset_id: str = Path(...),
    payload: Dict[str, Any] = ...
) -> CleaningApplyResponse:
    op = payload.get("operation") or payload.get("action") or "impute_missing"
    meth = payload.get("method") or payload.get("strategy")
    req = CleaningRequest(
        operation=op,
        column=payload.get("column"),
        method=meth,
        constant_value=payload.get("constant_value"),
        confirmation=payload.get("confirmation", True)
    )
    return cleaning_service.apply_cleaning(dataset_id, req)


# 4. History Endpoint
@router.get(
    "/{dataset_id}/cleaning/history",
    response_model=List[Dict[str, Any]],
    status_code=status.HTTP_200_OK,
    summary="Get transformation audit history log",
    description="Retrieves chronological timeline of all cleaning transformations applied to this dataset session."
)
async def get_cleaning_history(
    dataset_id: str = Path(..., description="Target dataset identifier")
) -> List[Dict[str, Any]]:
    return cleaning_service.get_history(dataset_id)


# 5. Undo Endpoint
@router.post(
    "/{dataset_id}/cleaning/undo",
    response_model=UndoResponse,
    status_code=status.HTTP_200_OK,
    summary="Undo last cleaning operation and revert to previous version",
    description="Rolls back active working copy to previous snapshot, updates history log, and refreshes profile. Never removes original raw upload."
)
async def undo_cleaning_operation(
    dataset_id: str = Path(..., description="Target dataset identifier")
) -> UndoResponse:
    return cleaning_service.undo_last_operation(dataset_id)
