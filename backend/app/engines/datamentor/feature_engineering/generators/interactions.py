"""Interaction feature generator (A * B cross-products)."""
from typing import Dict, Any, Tuple, List
import pandas as pd


def generate_interaction_feature(
    df: pd.DataFrame,
    params: Dict[str, Any]
) -> Tuple[pd.Series, str, List[str], List[str]]:
    """
    Generate pairwise interaction cross-product feature: Column A * Column B.
    
    Returns:
        (result_series, formula_human_readable, step_by_step_calculation, warnings)
    """
    column_a = params.get("column_a")
    column_b = params.get("column_b")
    
    if not column_a or column_a not in df.columns:
        raise ValueError(f"Primary column '{column_a}' does not exist in dataset.")
    if not column_b or column_b not in df.columns:
        raise ValueError(f"Secondary column '{column_b}' does not exist in dataset.")
    if column_a == column_b:
        raise ValueError(f"Interaction requires two distinct columns (use mathematical 'square' for self-multiplication).")

    series_a = pd.to_numeric(df[column_a], errors="coerce")
    series_b = pd.to_numeric(df[column_b], errors="coerce")
    
    result = series_a * series_b
    formula = f"{column_a} × {column_b}"
    
    step_steps = [
        f"1. Retrieve numerical vectors from '{column_a}' and '{column_b}'",
        f"2. Perform row-wise multiplication: [{column_a}] × [{column_b}]",
        f"3. Store cross-product feature capturing synergistic domain dependency."
    ]
    
    warnings: List[str] = []
    # Check for NaN propagation
    nan_count = int(result.isna().sum())
    if nan_count > 0:
        warnings.append(f"Interaction produced {nan_count} missing values due to nulls in source columns.")

    return result, formula, step_steps, warnings
