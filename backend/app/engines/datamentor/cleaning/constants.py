from typing import Tuple, Dict, Any, List
import pandas as pd


def detect_constant_columns(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Identifies zero-variance columns containing only 1 distinct non-null value."""
    constant_cols = []
    total_rows = len(df)

    for col in df.columns:
        valid = df[col].dropna()
        if len(valid) > 0 and valid.nunique() == 1:
            val = str(valid.iloc[0])
            constant_cols.append({
                "column": str(col),
                "constant_value": val,
                "total_rows": total_rows,
                "valid_count": len(valid)
            })

    return constant_cols


def remove_constant_column(df: pd.DataFrame, column: str) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Removes a constant/zero-variance column and returns (updated_df, metrics).
    """
    cols_before = len(df.columns)
    df_clean = df.drop(columns=[column])
    cols_after = len(df_clean.columns)

    metrics = {
        "columns_before": cols_before,
        "columns_after": cols_after,
        "dropped_column": column
    }

    return df_clean, metrics
