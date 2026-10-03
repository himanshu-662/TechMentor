from typing import List, Dict, Any, Optional
import pandas as pd
from fastapi import HTTPException, status

try:
    from app.services.version_service import version_service
    from app.services.profiling_service import profile_dataset, clear_dataset_cache
    from app.cleaning.models import (
        CleaningRecommendation,
        CleaningRequest,
        CleaningPreviewResponse,
        CleaningApplyResponse,
        UndoResponse
    )
    from app.cleaning.strategies import generate_recommendations
    from app.cleaning.cleaning_engine import execute_cleaning_pipeline, format_row_preview
except ImportError:
    from backend.app.services.version_service import version_service
    from backend.app.services.profiling_service import profile_dataset, clear_dataset_cache
    from backend.app.cleaning.models import (
        CleaningRecommendation,
        CleaningRequest,
        CleaningPreviewResponse,
        CleaningApplyResponse,
        UndoResponse
    )
    from backend.app.cleaning.strategies import generate_recommendations
    from backend.app.cleaning.cleaning_engine import execute_cleaning_pipeline, format_row_preview


class CleaningService:
    """
    High-level facade coordinating dataset cleaning recommendations,
    non-destructive preview, confirmed execution, audit history, and rollback.
    """

    @classmethod
    def get_recommendations(cls, dataset_id: str) -> List[CleaningRecommendation]:
        """Generates deterministic cleaning recommendations from active dataset profile."""
        df, _, _ = version_service.get_current_dataset(dataset_id)
        profile = profile_dataset(df, dataset_id=dataset_id)
        return generate_recommendations(df, profile)

    @classmethod
    def preview_cleaning(cls, dataset_id: str, req: CleaningRequest) -> CleaningPreviewResponse:
        """Computes non-destructive preview with before/after diff and 7-pillar explanation."""
        df, _, _ = version_service.get_current_dataset(dataset_id)
        df_new, explanation, m_before, m_after, affected_cnt, math_det = execute_cleaning_pipeline(df, req)

        return CleaningPreviewResponse(
            operation=req.operation,
            column=req.column,
            method=req.method,
            affected_rows=affected_cnt,
            metrics_before=m_before,
            metrics_after=m_after,
            sample_before=format_row_preview(df, limit=5),
            sample_after=format_row_preview(df_new, limit=5),
            explanation=explanation,
            math_calculation=math_det
        )

    @classmethod
    def apply_cleaning(cls, dataset_id: str, req: CleaningRequest) -> CleaningApplyResponse:
        """
        Executes confirmed cleaning operation:
        - Transforms DataFrame copy
        - Creates a new version snapshot in versions/
        - Appends operation details to history.json
        - Updates current/ working copy
        - Never mutates original/
        """
        if not req.confirmation:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User confirmation is required to apply data transformations."
            )

        df, _, _ = version_service.get_current_dataset(dataset_id)
        df_new, explanation, m_before, m_after, affected_cnt, _ = execute_cleaning_pipeline(df, req)

        op_record = {
            "operation_id": explanation.operation_id,
            "action": req.operation,
            "column": req.column,
            "method": req.method,
            "parameters": {"constant_value": req.constant_value} if req.constant_value is not None else {},
            "reason": explanation.selection_rationale,
            "affected_rows": affected_cnt,
            "metrics_before": m_before,
            "metrics_after": m_after,
            "technique_used": explanation.technique_used
        }

        version_num, _ = version_service.save_new_version(dataset_id, df_new, op_record)

        return CleaningApplyResponse(
            dataset_id=dataset_id,
            version=version_num,
            operation_id=explanation.operation_id,
            operation=req.operation,
            column=req.column,
            method=req.method,
            affected_rows=affected_cnt,
            metrics_before=m_before,
            metrics_after=m_after,
            explanation=explanation,
            row_count=int(len(df_new)),
            column_count=int(len(df_new.columns)),
            missing_cells=int(df_new.isna().sum().sum()),
            duplicate_rows=int(df_new.duplicated().sum()) if len(df_new) > 0 else 0,
            preview_rows=format_row_preview(df_new, limit=10),
            status="success",
            message=f"Version {version_num} created: Successfully applied {explanation.technique_used}."
        )

    @classmethod
    def get_history(cls, dataset_id: str) -> List[Dict[str, Any]]:
        """Returns transformation audit trail from history.json."""
        return version_service.get_history(dataset_id)

    @classmethod
    def undo_last_operation(cls, dataset_id: str) -> UndoResponse:
        """Rolls back the latest transformation and restores previous version."""
        res = version_service.undo_last_operation(dataset_id)
        return UndoResponse(
            dataset_id=dataset_id,
            reverted_operation=res["reverted_operation"],
            remaining_history_count=res["remaining_history_count"],
            current_version=res["current_version"],
            row_count=res["row_count"],
            column_count=res["column_count"],
            missing_cells=res["missing_cells"],
            duplicate_rows=res["duplicate_rows"],
            message=res["message"]
        )


cleaning_service = CleaningService()
