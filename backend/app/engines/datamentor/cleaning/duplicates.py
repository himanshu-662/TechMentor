from typing import Tuple, Dict, Any
import pandas as pd


def detect_duplicates(df: pd.DataFrame) -> Dict[str, Any]:
    """Detects exact duplicate rows in the dataset."""
    total_rows = len(df)
    duplicate_count = int(df.duplicated().sum()) if total_rows > 0 else 0
    duplicate_pct = round((duplicate_count / total_rows) * 100, 2) if total_rows > 0 else 0.0

    return {
        "total_rows": total_rows,
        "duplicate_rows": duplicate_count,
        "duplicate_percentage": duplicate_pct,
        "unique_rows": total_rows - duplicate_count,
        "has_duplicates": duplicate_count > 0
    }


def remove_duplicates(df: pd.DataFrame) -> Tuple[pd.DataFrame, int, Dict[str, Any]]:
    """
    Removes exact duplicate rows and returns (deduped_df, removed_count, metrics).
    """
    total_before = len(df)
    dup_count = int(df.duplicated().sum()) if total_before > 0 else 0
    df_clean = df.drop_duplicates()
    total_after = len(df_clean)

    metrics = {
        "rows_before": total_before,
        "rows_after": total_after,
        "removed_count": dup_count,
        "percentage_removed": round((dup_count / total_before) * 100, 2) if total_before > 0 else 0.0
    }

    return df_clean, dup_count, metrics
