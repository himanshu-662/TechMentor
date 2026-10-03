from typing import Tuple, List, Dict, Any, Optional
import pandas as pd
import numpy as np


def treat_cap(
    df: pd.DataFrame,
    column: str,
    lower_bound: Optional[float],
    upper_bound: Optional[float]
) -> Tuple[pd.DataFrame, int, int, int, List[Dict[str, Any]]]:
    """
    Winsorize / Cap numerical outliers to specified lower and upper boundaries.
    Returns: (new_df, affected_rows, rows_removed, values_capped, sample_changed_records)
    """
    new_df = df.copy()
    col_series = pd.to_numeric(new_df[column], errors='coerce')

    if lower_bound is None and upper_bound is None:
        return new_df, 0, 0, 0, []

    low_mask = pd.Series(False, index=new_df.index)
    high_mask = pd.Series(False, index=new_df.index)

    if lower_bound is not None:
        low_mask = col_series < lower_bound
    if upper_bound is not None:
        high_mask = col_series > upper_bound

    affected_mask = low_mask | high_mask
    affected_indices = new_df[affected_mask].index.tolist()
    affected_count = len(affected_indices)

    sample_changed = []
    for idx in affected_indices[:5]:
        orig_val = float(col_series.loc[idx])
        if low_mask.loc[idx]:
            new_val = float(lower_bound)
            action = f"Capped below floor to {round(new_val, 4)}"
        else:
            new_val = float(upper_bound)
            action = f"Capped above ceiling to {round(new_val, 4)}"

        sample_changed.append({
            "index": int(idx),
            "original_value": orig_val,
            "treated_value": new_val,
            "action_taken": action
        })

    # Apply clipping safely preserving original series type / non-nulls
    if lower_bound is not None and upper_bound is not None:
        new_df[column] = col_series.clip(lower=lower_bound, upper=upper_bound)
    elif lower_bound is not None:
        new_df[column] = col_series.clip(lower=lower_bound)
    elif upper_bound is not None:
        new_df[column] = col_series.clip(upper=upper_bound)

    return new_df, affected_count, 0, affected_count, sample_changed
