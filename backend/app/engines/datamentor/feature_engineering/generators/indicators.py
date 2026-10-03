"""Indicator / Threshold flag feature generator."""
from typing import Dict, Any, Tuple, List, Union
import numpy as np
import pandas as pd
from app.feature_engineering.models import IndicatorOperatorEnum


def generate_indicator_feature(
    df: pd.DataFrame,
    params: Dict[str, Any]
) -> Tuple[pd.Series, str, List[str], List[str]]:
    """
    Generate boolean or binary 0/1 flag feature based on logical comparison.
    
    Returns:
        (result_series, formula_human_readable, step_by_step_calculation, warnings)
    """
    col = params.get("source_column") or params.get("column_a")
    operator = params.get("operator", IndicatorOperatorEnum.GT.value).lower()
    threshold = params.get("threshold")
    output_format = params.get("output_format", "binary_int").lower()  # "binary_int" or "boolean"
    
    if not col or col not in df.columns:
        raise ValueError(f"Source column '{col}' does not exist in dataset.")
    if threshold is None:
        raise ValueError("Indicator feature requires 'threshold' value to compare against.")

    raw_series = df[col]
    warnings: List[str] = []
    
    # Try numeric conversion if threshold is numeric
    try:
        thresh_num = float(threshold)
        series_num = pd.to_numeric(raw_series, errors="coerce")
        is_numeric_comparison = True
    except (ValueError, TypeError):
        is_numeric_comparison = False
        thresh_str = str(threshold)

    op_symbol_map = {
        IndicatorOperatorEnum.GT.value: ">",
        IndicatorOperatorEnum.GTE.value: ">=",
        IndicatorOperatorEnum.LT.value: "<",
        IndicatorOperatorEnum.LTE.value: "<=",
        IndicatorOperatorEnum.EQ.value: "==",
        IndicatorOperatorEnum.NEQ.value: "!="
    }
    symbol = op_symbol_map.get(operator, "==")

    if is_numeric_comparison:
        if operator in [IndicatorOperatorEnum.GT.value, "gt", ">"]:
            cond = series_num > thresh_num
        elif operator in [IndicatorOperatorEnum.GTE.value, "gte", ">="]:
            cond = series_num >= thresh_num
        elif operator in [IndicatorOperatorEnum.LT.value, "lt", "<"]:
            cond = series_num < thresh_num
        elif operator in [IndicatorOperatorEnum.LTE.value, "lte", "<="]:
            cond = series_num <= thresh_num
        elif operator in [IndicatorOperatorEnum.EQ.value, "eq", "=="]:
            cond = np.isclose(series_num, thresh_num, equal_nan=False)
        elif operator in [IndicatorOperatorEnum.NEQ.value, "neq", "!="]:
            cond = ~np.isclose(series_num, thresh_num, equal_nan=False)
        else:
            raise ValueError(f"Unsupported indicator operator: '{operator}'")
    else:
        # String comparison
        if operator in [IndicatorOperatorEnum.EQ.value, "eq", "=="]:
            cond = raw_series.astype(str) == thresh_str
        elif operator in [IndicatorOperatorEnum.NEQ.value, "neq", "!="]:
            cond = raw_series.astype(str) != thresh_str
        else:
            raise ValueError(f"Operator '{operator}' cannot be applied to string data.")

    if output_format == "boolean":
        result = pd.Series(cond, index=df.index)
    else:
        # Default binary integer (1 or 0)
        result = pd.Series(cond.astype(int), index=df.index)

    true_count = int(cond.sum())
    total_count = len(df)
    pct = (true_count / total_count * 100) if total_count > 0 else 0
    
    if true_count == 0 or true_count == total_count:
        warnings.append(
            f"Indicator flag has zero variance (all values are {true_count == total_count}). "
            f"Constant features provide no predictive signal to ML models."
        )

    formula = f"({col} {symbol} {threshold})"
    step_steps = [
        f"1. Evaluate condition: {col} {symbol} {threshold}",
        f"2. Count matching rows: {true_count} / {total_count} ({pct:.1f}% True)",
        f"3. Format output as '{output_format}' indicator vector."
    ]

    return result, formula, step_steps, warnings
