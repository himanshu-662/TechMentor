"""Feature Engineering Service orchestrating dataset retrieval, opportunity scanning, simulation, versioning, and history."""
import uuid
from datetime import datetime
from typing import Dict, Any, List
from fastapi import HTTPException
import pandas as pd

from app.services.version_service import version_service
from app.feature_engineering.models import (
    FeatureEngineeringPreviewRequest,
    FeatureEngineeringPreviewResponse,
    FeatureEngineeringApplyRequest,
    FeatureEngineeringApplyResponse,
    FeatureOpportunitiesResponse,
    FeatureHistoryResponse,
    FeatureHistoryItem
)
from app.feature_engineering.recommendations import scan_feature_opportunities
from app.feature_engineering.engine import generate_feature_preview, compute_feature_series
from app.feature_engineering.validation import validate_feature_name, evaluate_feature_series


def get_feature_opportunities(dataset_id: str) -> FeatureOpportunitiesResponse:
    """Scan dataset and return conservative feature engineering opportunities."""
    df, _, _ = version_service.get_current_dataset(dataset_id)
    opportunities = scan_feature_opportunities(df)
    
    summary = {
        "total_rows": len(df),
        "total_columns": len(df.columns),
        "columns": list(df.columns)
    }
    
    return FeatureOpportunitiesResponse(
        dataset_id=dataset_id,
        total_opportunities=len(opportunities),
        opportunities=opportunities,
        dataset_summary=summary
    )


def preview_feature_engineering(
    dataset_id: str,
    request: FeatureEngineeringPreviewRequest
) -> FeatureEngineeringPreviewResponse:
    """Non-destructively simulate a feature engineering operation."""
    df, _, _ = version_service.get_current_dataset(dataset_id)
    
    return generate_feature_preview(
        dataset_id=dataset_id,
        df=df,
        feature_type=request.feature_type.value,
        new_feature_name=request.new_feature_name,
        params=request.params
    )


def apply_feature_engineering(
    dataset_id: str,
    request: FeatureEngineeringApplyRequest
) -> FeatureEngineeringApplyResponse:
    """
    Persistently create and append engineered feature to dataset.
    Saves a new immutable version snapshot in VersionService.
    """
    if not request.confirmed:
        raise HTTPException(
            status_code=400,
            detail="Feature engineering requires explicit confirmation. Please set 'confirmed: true'."
        )

    df, _, _ = version_service.get_current_dataset(dataset_id)
    feature_name = request.new_feature_name.strip()
    
    # Validation
    is_valid_name, name_errors = validate_feature_name(feature_name, list(df.columns))
    if not is_valid_name:
        raise HTTPException(status_code=400, detail=" | ".join(name_errors))

    try:
        series, formula, steps, warnings, source_cols = compute_feature_series(
            df=df,
            feature_type=request.feature_type.value,
            params=request.params
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to generate feature: {str(e)}")

    validation, _ = evaluate_feature_series(
        series=series,
        df=df,
        source_columns=source_cols,
        additional_warnings=warnings
    )

    if not validation.valid:
        raise HTTPException(
            status_code=400,
            detail=f"Feature validation failed: {' | '.join(validation.errors)}"
        )

    # Create new DataFrame with appended feature
    modified_df = df.copy()
    modified_df[feature_name] = series

    operation_id = f"feat_{uuid.uuid4().hex[:8]}"
    timestamp_str = datetime.utcnow().isoformat()

    # Save new immutable snapshot version
    new_version_int, _ = version_service.save_new_version(
        dataset_id=dataset_id,
        df=modified_df,
        operation_record={
            "operation_id": operation_id,
            "action": "feature_engineering",
            "operation": "feature_engineering",
            "feature_name": feature_name,
            "feature_type": request.feature_type.value,
            "params": request.params,
            "formula": formula,
            "validation": {
                "null_count": validation.null_count,
                "null_percentage": validation.null_percentage,
                "unique_count": validation.unique_count,
                "dtype": validation.dtype,
                "summary_stats": validation.summary_stats
            },
            "description": request.description or f"Engineered feature '{feature_name}' using {request.feature_type.value}."
        }
    )

    return FeatureEngineeringApplyResponse(
        dataset_id=dataset_id,
        operation_id=operation_id,
        new_version=new_version_int,
        feature_name=feature_name,
        feature_type=request.feature_type.value,
        shape={"rows": len(modified_df), "columns": len(modified_df.columns)},
        validation=validation,
        message=f"Successfully engineered feature '{feature_name}' (Version {new_version_int}).",
        timestamp=timestamp_str
    )


def get_feature_history(dataset_id: str) -> FeatureHistoryResponse:
    """Retrieve audit history of all feature engineering operations for dataset."""
    history = version_service.get_history(dataset_id)
    current_version = len(history)

    feature_items: List[FeatureHistoryItem] = []
    for item in history:
        if item.get("action") == "feature_engineering" or item.get("operation") == "feature_engineering":
            feature_items.append(
                FeatureHistoryItem(
                    operation_id=item.get("operation_id", "unknown"),
                    operation="feature_engineering",
                    feature_name=item.get("feature_name", "unknown"),
                    feature_type=item.get("feature_type", "unknown"),
                    params=item.get("params", {}),
                    formula=item.get("formula", ""),
                    validation=item.get("validation", {}),
                    source_version=str(item.get("source_version", "v0")),
                    new_version=str(item.get("new_version", "v1")),
                    timestamp=item.get("timestamp", "")
                )
            )

    return FeatureHistoryResponse(
        dataset_id=dataset_id,
        current_version=current_version,
        total_features_engineered=len(feature_items),
        history=feature_items
    )


def undo_feature_operation(dataset_id: str) -> Dict[str, Any]:
    """Revert the most recent operation and restore the preceding snapshot version."""
    result = version_service.undo_last_operation(dataset_id)
    return {
        "dataset_id": dataset_id,
        "restored_version": result.get("current_version", 0),
        "message": result.get("message", "Successfully reverted last operation.")
    }
