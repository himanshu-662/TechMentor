from typing import Optional, Any
import pandas as pd
from fastapi import HTTPException, status

VALID_OPERATIONS = {"impute_missing", "drop_duplicates", "drop_constant_column", "drop_column"}
VALID_NUMERICAL_METHODS = {"mean", "median", "constant", "drop_rows"}
VALID_CATEGORICAL_METHODS = {"mode", "constant", "drop_rows"}


def validate_cleaning_request(df: pd.DataFrame, operation: str, column: Optional[str] = None, method: Optional[str] = None) -> None:
    """
    Validates cleaning operation parameters, column presence, and semantic type compatibility.
    Raises educational HTTPException with clear explanations on mismatch.
    """
    op = operation.lower() if operation else ""
    if op not in VALID_OPERATIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported cleaning operation '{operation}'. Supported operations: {', '.join(sorted(VALID_OPERATIONS))}."
        )

    # Column-specific operations
    if op in ("impute_missing", "drop_constant_column", "drop_column"):
        if not column:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Operation '{operation}' requires a target 'column' parameter."
            )
        if column not in df.columns:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Column '{column}' does not exist in the dataset. Available columns: {', '.join(df.columns)}."
            )

    # Missing value imputation checks
    if op == "impute_missing":
        if not method:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Imputation requires a 'method' parameter (e.g., 'median', 'mean', 'mode', 'constant', 'drop_rows')."
            )

        m = method.lower()
        col_series = df[column]
        is_numeric = pd.api.types.is_numeric_dtype(col_series)
        
        # Check if column actually has missing values
        null_count = int(col_series.isna().sum())
        if null_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Column '{column}' contains 0 missing values. Imputation is not necessary."
            )

        # Numerical type compatibility
        if is_numeric:
            if m not in VALID_NUMERICAL_METHODS:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Method '{method}' is invalid for numerical column '{column}'. Supported methods for numbers: {', '.join(sorted(VALID_NUMERICAL_METHODS))}."
                )
        else:
            # Non-numeric / Categorical type compatibility
            if m in ("mean", "median"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot apply '{method}' imputation to column '{column}' because it is categorical/text. "
                           f"Mathematical averaging requires numeric quantities. Consider 'mode' (most frequent category) or 'constant'."
                )
            if m not in VALID_CATEGORICAL_METHODS:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Method '{method}' is invalid for categorical column '{column}'. Supported methods for categories: {', '.join(sorted(VALID_CATEGORICAL_METHODS))}."
                )

    # Constant column removal checks
    if op == "drop_constant_column":
        unique_count = int(df[column].dropna().nunique())
        if unique_count > 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Column '{column}' has {unique_count} distinct values and is not constant. Dropping non-constant features without feature selection is not permitted."
            )

    # Duplicate row checks
    if op == "drop_duplicates":
        dup_count = int(df.duplicated().sum()) if len(df) > 0 else 0
        if dup_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Dataset contains 0 duplicate rows. Deduplication is not required."
            )
