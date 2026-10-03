"""Ratio feature generator with division-by-zero mitigation policies."""
from typing import Dict, Any, Tuple, List
import numpy as np
import pandas as pd
from app.feature_engineering.models import DivisionByZeroPolicyEnum


def generate_ratio_feature(
    df: pd.DataFrame,
    params: Dict[str, Any]
) -> Tuple[pd.Series, str, List[str], List[str]]:
    """
    Generate ratio / proportion feature: Numerator / Denominator.
    
    Returns:
        (result_series, formula_human_readable, step_by_step_calculation, warnings)
    """
    numerator_col = params.get("numerator_column") or params.get("column_a")
    denominator_col = params.get("denominator_column") or params.get("column_b")
    policy = params.get("division_by_zero_policy", DivisionByZeroPolicyEnum.NAN.value).lower()
    custom_val = float(params.get("custom_value", 0.0))
    add_epsilon = bool(params.get("add_epsilon", False))
    
    if not numerator_col or numerator_col not in df.columns:
        raise ValueError(f"Numerator column '{numerator_col}' does not exist in dataset.")
    if not denominator_col or denominator_col not in df.columns:
        raise ValueError(f"Denominator column '{denominator_col}' does not exist in dataset.")
    if numerator_col == denominator_col:
        raise ValueError("Numerator and denominator columns must be distinct.")

    num_series = pd.to_numeric(df[numerator_col], errors="coerce")
    denom_series = pd.to_numeric(df[denominator_col], errors="coerce")
    
    warnings: List[str] = []
    
    if add_epsilon:
        denom_adjusted = denom_series + 1e-7
        formula = f"{numerator_col} / ({denominator_col} + 1e-7)"
    else:
        denom_adjusted = denom_series
        formula = f"{numerator_col} / {denominator_col}"

    zero_mask = (denom_series == 0) | (np.isclose(denom_series, 0.0, atol=1e-12))
    zero_count = int(zero_mask.sum())
    
    with np.errstate(divide='ignore', invalid='ignore'):
        raw_ratio = num_series / denom_adjusted

    # Apply division by zero policy
    if zero_count > 0 and not add_epsilon:
        warnings.append(
            f"Denominator contains 0 in {zero_count} rows ({zero_count / len(df) * 100:.1f}%). "
            f"Applied zero policy: '{policy}'."
        )
        if policy == DivisionByZeroPolicyEnum.ZERO.value:
            raw_ratio = raw_ratio.mask(zero_mask, 0.0)
        elif policy == DivisionByZeroPolicyEnum.CUSTOM_VALUE.value:
            raw_ratio = raw_ratio.mask(zero_mask, custom_val)
        else: # nan
            raw_ratio = raw_ratio.mask(zero_mask, np.nan)

    # Clean any accidental inf / -inf
    fallback = np.nan if policy == "nan" else (0.0 if policy == "zero" else custom_val)
    result = raw_ratio.replace([np.inf, -np.inf], fallback)
    
    step_steps = [
        f"1. Extract numerator vector '{numerator_col}' and denominator vector '{denominator_col}'",
        f"2. Check denominator values for zeros (detected {zero_count} instances)",
        f"3. Compute ratio with policy '{policy}' -> replace undefined quotients safely.",
        f"4. Output normalized density/rate feature."
    ]

    return result, formula, step_steps, warnings
