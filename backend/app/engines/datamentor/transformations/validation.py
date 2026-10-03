"""Validation guards for Phase 7 Transformation operations."""
from typing import Optional, Tuple
import pandas as pd
import numpy as np
from fastapi import HTTPException
from app.transformations.models import TransformationMethodEnum


def validate_numerical_column(df: pd.DataFrame, column: str) -> None:
    """Validate that the specified column exists in the dataset and is strictly numerical."""
    if column not in df.columns:
        raise HTTPException(
            status_code=400,
            detail=f"Column '{column}' does not exist in the dataset. Available columns: {list(df.columns)}"
        )
    
    col_series = df[column]
    if not (pd.api.types.is_numeric_dtype(col_series) and not pd.api.types.is_bool_dtype(col_series)):
        raise HTTPException(
            status_code=400,
            detail=f"Column '{column}' is of type '{col_series.dtype}'. Data transformations (scaling, power transforms) can only be applied to numerical features."
        )


def validate_transformation_parameters(
    df: pd.DataFrame,
    column: str,
    method: TransformationMethodEnum,
    feature_range: Tuple[float, float] = (0.0, 1.0)
) -> None:
    """Validate specific mathematical preconditions for the requested transformation method."""
    validate_numerical_column(df, column)

    series = df[column].dropna().astype(float)
    if len(series) == 0:
        raise HTTPException(
            status_code=400,
            detail=f"Column '{column}' contains zero valid non-null numerical values to transform."
        )

    min_val = float(series.min())

    if method == TransformationMethodEnum.MINMAX:
        min_r, max_r = feature_range
        if min_r >= max_r:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid feature range for MinMaxScaler: feature_range_min ({min_r}) must be strictly less than feature_range_max ({max_r})."
            )

    elif method == TransformationMethodEnum.LOG1P:
        if min_val < 0.0:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Logarithmic transformation cannot be applied because column '{column}' contains negative values (minimum = {min_val:.4f}). "
                    f"The natural logarithm is mathematically undefined for negative inputs. "
                    f"Educational Recommendation: Use the Yeo-Johnson Power Transformation instead, which natively supports negative numbers."
                )
            )

    elif method == TransformationMethodEnum.BOX_COX:
        if min_val <= 0.0:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Box-Cox power transformation strictly requires all values to be positive (x > 0). "
                    f"Column '{column}' has a minimum value of {min_val:.4f} (contains zero or negative values). "
                    f"Educational Recommendation: Use the Yeo-Johnson Power Transformation instead, which supports zero and negative values."
                )
            )
