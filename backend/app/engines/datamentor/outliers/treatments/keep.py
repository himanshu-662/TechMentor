from typing import Tuple, List, Dict, Any
import pandas as pd


def treat_keep(
    df: pd.DataFrame,
    column: str
) -> Tuple[pd.DataFrame, int, int, int, List[Dict[str, Any]]]:
    """
    Keep outliers untouched. Returns unchanged copy.
    Returns: (new_df, affected_rows, rows_removed, values_capped, sample_changed_records)
    """
    return df.copy(), 0, 0, 0, []
