from typing import Tuple, List, Dict, Any, Optional
import pandas as pd


def treat_flag(
    df: pd.DataFrame,
    column: str,
    outlier_mask: pd.Series
) -> Tuple[pd.DataFrame, int, int, int, List[Dict[str, Any]]]:
    """
    Flag numerical outliers by creating a binary boolean indicator column {column}_is_outlier.
    Does NOT modify or remove any original feature values.
    
    Returns: (new_df, affected_rows, rows_removed, values_capped, sample_changed_records)
    """
    new_df = df.copy()
    flag_col_name = f"{column}_is_outlier"
    new_df[flag_col_name] = outlier_mask.astype(int)

    affected_indices = df[outlier_mask].index.tolist()
    affected_count = len(affected_indices)

    sample_changed = []
    for idx in affected_indices[:5]:
        val = df.loc[idx, column]
        sample_changed.append({
            "index": int(idx),
            "original_value": float(val) if pd.notna(val) else None,
            "treated_value": float(val) if pd.notna(val) else None,
            "action_taken": f"Flagged in new feature '{flag_col_name}' = 1 (original value preserved)"
        })

    return new_df, affected_count, 0, 0, sample_changed
