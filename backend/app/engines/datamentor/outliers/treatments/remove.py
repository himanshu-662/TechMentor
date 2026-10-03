from typing import Tuple, List, Dict, Any, Optional
import pandas as pd


def treat_remove(
    df: pd.DataFrame,
    column: str,
    outlier_mask: pd.Series
) -> Tuple[pd.DataFrame, int, int, int, List[Dict[str, Any]]]:
    """
    Remove rows flagged as outliers for the given column.
    Returns: (new_df, affected_rows, rows_removed, values_capped, sample_changed_records)
    """
    affected_indices = df[outlier_mask].index.tolist()
    affected_count = len(affected_indices)

    sample_changed = []
    for idx in affected_indices[:5]:
        val = df.loc[idx, column]
        sample_changed.append({
            "index": int(idx),
            "original_value": float(val) if pd.notna(val) else None,
            "treated_value": None,
            "action_taken": "Row removed from dataset"
        })

    # Filter out outlier rows
    new_df = df[~outlier_mask].copy()

    return new_df, affected_count, affected_count, 0, sample_changed
