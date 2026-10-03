"""Frequency / Count encoding feature generator for categorical columns."""
from typing import Dict, Any, Tuple, List
import pandas as pd


def generate_frequency_feature(
    df: pd.DataFrame,
    params: Dict[str, Any]
) -> Tuple[pd.Series, str, List[str], List[str]]:
    """
    Generate frequency or count encoding feature for categorical column.
    
    Returns:
        (result_series, formula_human_readable, step_by_step_calculation, warnings)
    """
    col = params.get("source_column") or params.get("column_a")
    freq_type = params.get("frequency_type", "count").lower()  # "count" or "proportion"
    
    if not col or col not in df.columns:
        raise ValueError(f"Categorical column '{col}' does not exist in dataset.")

    series = df[col].astype(str)
    warnings: List[str] = []
    
    val_counts = series.value_counts(dropna=False)
    unique_count = len(val_counts)
    
    # Check for frequency collision (multiple categories with identical counts)
    dup_counts = val_counts.value_counts()
    collisions = int((dup_counts > 1).sum())
    if collisions > 0:
        warnings.append(
            f"Detected frequency collisions: multiple distinct categories share the exact same frequency count. "
            f"The model will perceive these different categories as identical."
        )

    if freq_type == "proportion":
        freq_map = val_counts / len(df)
        result = series.map(freq_map).fillna(0.0)
        formula = f"frequency_ratio({col})"
        desc = "category percentage proportion (count / total rows)"
    else:  # count
        result = series.map(val_counts).fillna(0)
        formula = f"frequency_count({col})"
        desc = "raw category occurrence count"

    step_steps = [
        f"1. Compute occurrence frequencies for {unique_count} distinct categories in '{col}'",
        f"2. Replace each category level with its {desc}",
        f"3. Return compact single-column numerical popularity signal."
    ]

    return result, formula, step_steps, warnings
