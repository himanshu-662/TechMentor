from typing import Dict, Any, Optional
import pandas as pd
import numpy as np
from fastapi import HTTPException, status
from app.outliers.models import DetectionMethodEnum, TreatmentTypeEnum


def validate_numerical_column(df: pd.DataFrame, column: str) -> None:
    """Validate that the target column exists and contains numeric data."""
    if column not in df.columns:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Column '{column}' was not found in the dataset. Available columns: {list(df.columns)}"
        )

    # Check data type
    col_series = df[column]
    if not pd.api.types.is_numeric_dtype(col_series):
        # Attempt conversion
        converted = pd.to_numeric(col_series, errors='coerce')
        valid_numeric_count = converted.dropna().count()
        if valid_numeric_count == 0 or (valid_numeric_count / len(col_series) < 0.5):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Column '{column}' is categorical/non-numeric. Outlier detection is only applicable to continuous numerical features."
            )


def validate_outlier_parameters(
    method: str,
    parameters: Optional[Dict[str, Any]]
) -> Dict[str, Any]:
    """Validate and sanitize parameters for the selected detection method."""
    params = parameters or {}

    if method == DetectionMethodEnum.IQR or method == "iqr":
        multiplier = params.get("multiplier", 1.5)
        try:
            multiplier = float(multiplier)
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="IQR multiplier must be a positive number (e.g., 1.5 for mild outliers, 3.0 for extreme outliers)."
            )
        if multiplier <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"IQR multiplier must be strictly greater than 0, got {multiplier}."
            )
        return {"multiplier": multiplier}

    elif method == DetectionMethodEnum.ZSCORE or method == "zscore":
        threshold = params.get("threshold", 3.0)
        try:
            threshold = float(threshold)
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Z-score threshold must be a positive number (typically 2.5, 3.0, or 3.5)."
            )
        if threshold <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Z-score threshold must be strictly greater than 0, got {threshold}."
            )
        return {"threshold": threshold}

    elif method == DetectionMethodEnum.MODIFIED_ZSCORE or method == "modified_zscore":
        threshold = params.get("threshold", 3.5)
        try:
            threshold = float(threshold)
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Modified Z-score threshold must be a positive number (recommended standard: 3.5)."
            )
        if threshold <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Modified Z-score threshold must be strictly greater than 0, got {threshold}."
            )
        return {"threshold": threshold}

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported detection method '{method}'. Supported methods: iqr, zscore, modified_zscore."
        )


def validate_treatment_request(
    treatment: str,
    custom_lower: Optional[float] = None,
    custom_upper: Optional[float] = None
) -> None:
    """Validate treatment selection and custom bounds consistency."""
    valid_treatments = {"keep", "remove", "cap", "custom_bounds", "flag"}
    if treatment not in valid_treatments:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid treatment type '{treatment}'. Supported treatments: {', '.join(sorted(valid_treatments))}."
        )

    if treatment == "custom_bounds":
        if custom_lower is None and custom_upper is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Custom bounds treatment requires at least a 'custom_lower' or 'custom_upper' value."
            )
        if custom_lower is not None and custom_upper is not None:
            if custom_lower >= custom_upper:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Custom lower bound ({custom_lower}) must be strictly less than custom upper bound ({custom_upper})."
                )
