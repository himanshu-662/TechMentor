"""FastAPI Router for Step 06: Data Encoding."""
from fastapi import APIRouter, Path
from app.encoding.models import (
    EncodingSummaryResponse,
    EncodingPreviewRequest,
    EncodingPreviewResponse,
    EncodingApplyRequest,
    EncodingApplyResponse
)
from app.encoding.encoding_engine import EncodingEngine

router = APIRouter(prefix="/datasets/{dataset_id}/encoding", tags=["encoding"])
legacy_router = APIRouter(prefix="/encoding/{dataset_id}", tags=["encoding"], include_in_schema=False)


@router.get("", response_model=EncodingSummaryResponse)
@router.get("/summary", response_model=EncodingSummaryResponse, include_in_schema=False)
def get_encoding_summary(
    dataset_id: str = Path(..., description="Unique dataset identifier")
):
    """Scan and list all categorical features available for encoding."""
    return EncodingEngine.get_summary(dataset_id)


@router.post("/preview", response_model=EncodingPreviewResponse)
def preview_encoding(
    dataset_id: str = Path(..., description="Unique dataset identifier"),
    request: EncodingPreviewRequest = ...
):
    """Simulate categorical encoding without mutating dataset storage."""
    return EncodingEngine.preview_encoding(dataset_id, request)


@router.post("/apply", response_model=EncodingApplyResponse)
def apply_encoding(
    dataset_id: str = Path(..., description="Unique dataset identifier"),
    request: EncodingApplyRequest = ...
):
    """Apply confirmed categorical encoding and produce a new snapshot version."""
    return EncodingEngine.apply_encoding(dataset_id, request)


# Legacy router endpoints forwarding to same engine
@legacy_router.get("/summary", response_model=EncodingSummaryResponse)
def legacy_get_encoding_summary(
    dataset_id: str = Path(..., description="Unique dataset identifier")
):
    return EncodingEngine.get_summary(dataset_id)


@legacy_router.post("/preview", response_model=EncodingPreviewResponse)
def legacy_preview_encoding(
    dataset_id: str = Path(..., description="Unique dataset identifier"),
    request: EncodingPreviewRequest = ...
):
    return EncodingEngine.preview_encoding(dataset_id, request)


@legacy_router.post("/apply", response_model=EncodingApplyResponse)
def legacy_apply_encoding(
    dataset_id: str = Path(..., description="Unique dataset identifier"),
    request: EncodingApplyRequest = ...
):
    return EncodingEngine.apply_encoding(dataset_id, request)
