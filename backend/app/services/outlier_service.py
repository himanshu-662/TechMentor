from typing import Dict, Any, List, Optional
from app.outliers.outlier_engine import outlier_engine
from app.outliers.models import (
    DatasetOutlierSummaryResponse,
    ColumnOutlierDetailResponse,
    OutlierPreviewRequest,
    OutlierPreviewResponse,
    OutlierApplyRequest,
    OutlierApplyResponse
)
from app.services.version_service import version_service


class OutlierService:
    """Service layer coordinating outlier analysis, preview, and treatments."""

    @staticmethod
    def get_dataset_outlier_summary(dataset_id: str) -> DatasetOutlierSummaryResponse:
        """Fetch summary of all numerical columns and detected outliers."""
        return outlier_engine.get_dataset_summary(dataset_id)

    @staticmethod
    def get_column_outlier_detail(
        dataset_id: str,
        column: str,
        method: Optional[str] = None,
        parameters: Optional[Dict[str, Any]] = None
    ) -> ColumnOutlierDetailResponse:
        """Fetch deep-dive statistics, calculation steps, and record samples for a column."""
        return outlier_engine.get_column_detail(dataset_id, column, method, parameters)

    @staticmethod
    def preview_treatment(
        dataset_id: str,
        request: OutlierPreviewRequest
    ) -> OutlierPreviewResponse:
        """Preview the effects of an outlier treatment without mutating data."""
        return outlier_engine.preview_treatment(
            dataset_id=dataset_id,
            column=request.column,
            detection_method=request.detection_method.value if hasattr(request.detection_method, 'value') else str(request.detection_method),
            parameters=request.parameters,
            treatment=request.treatment.value if hasattr(request.treatment, 'value') else str(request.treatment),
            custom_lower=request.custom_lower,
            custom_upper=request.custom_upper
        )

    @staticmethod
    def apply_treatment(
        dataset_id: str,
        request: OutlierApplyRequest
    ) -> OutlierApplyResponse:
        """Apply treatment, create new dataset version snapshot, and record history."""
        return outlier_engine.apply_treatment(
            dataset_id=dataset_id,
            column=request.column,
            detection_method=request.detection_method.value if hasattr(request.detection_method, 'value') else str(request.detection_method),
            parameters=request.parameters,
            treatment=request.treatment.value if hasattr(request.treatment, 'value') else str(request.treatment),
            custom_lower=request.custom_lower,
            custom_upper=request.custom_upper,
            confirmed=request.confirmed
        )

    @staticmethod
    def get_outlier_history(dataset_id: str) -> List[Dict[str, Any]]:
        """Retrieve audit history filtered for outlier operations."""
        full_history = version_service.get_history(dataset_id)
        outlier_history = [
            item for item in full_history
            if item.get("operation") == "outlier_treatment" or "outlier" in item.get("action", "")
        ]
        return outlier_history


outlier_service = OutlierService()
