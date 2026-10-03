"""Service interface wrapper for Transformation operations."""
from typing import Dict, Any
from app.transformations.transformation_engine import TransformationEngine
from app.transformations.models import (
    DatasetTransformationSummaryResponse,
    ColumnTransformationDetailResponse,
    TransformationPreviewRequest,
    TransformationPreviewResponse,
    TransformationApplyRequest,
    TransformationApplyResponse,
    TransformationHistoryResponse
)
from app.services.version_service import version_service


def get_dataset_transformation_summary(dataset_id: str) -> DatasetTransformationSummaryResponse:
    """Retrieve transformation summary for all numerical features in the active dataset."""
    return TransformationEngine.get_dataset_summary(dataset_id)


def get_column_transformation_detail(dataset_id: str, column: str) -> ColumnTransformationDetailResponse:
    """Retrieve detailed distribution statistics and calculation breakdown for a specific column."""
    return TransformationEngine.get_column_detail(dataset_id, column)


def preview_transformation(
    dataset_id: str, request: TransformationPreviewRequest
) -> TransformationPreviewResponse:
    """Preview transformation without mutating dataset storage."""
    return TransformationEngine.preview_transformation(dataset_id, request)


def apply_transformation(
    dataset_id: str, request: TransformationApplyRequest
) -> TransformationApplyResponse:
    """Apply confirmed transformation, saving a new immutable version snapshot."""
    return TransformationEngine.apply_transformation(dataset_id, request)


def get_transformation_history(dataset_id: str) -> TransformationHistoryResponse:
    """Retrieve audit history of all transformations."""
    return TransformationEngine.get_history(dataset_id)


def undo_transformation(dataset_id: str) -> Dict[str, Any]:
    """Revert the most recent operation and restore the preceding snapshot version."""
    result = version_service.undo_last_operation(dataset_id)
    return {
        "dataset_id": dataset_id,
        "restored_version": result.get("current_version", 0),
        "message": result.get("message", "Successfully reverted last operation.")
    }
