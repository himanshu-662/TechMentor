from typing import Tuple, Dict, Any, List
import pandas as pd
import numpy as np
try:
    from app.cleaning.models import MathCalculationDetails
except ImportError:
    from backend.app.cleaning.models import MathCalculationDetails


def calculate_median_math(series: pd.Series) -> MathCalculationDetails:
    """Computes transparent educational math demonstration for median imputation."""
    clean = series.dropna().sort_values()
    n = len(clean)
    sample_preview = clean.head(5).tolist()
    if n > 10:
        sample_preview.append("...")
        sample_preview.extend(clean.tail(5).tolist())
    else:
        sample_preview = clean.tolist()

    median_val = float(clean.median())
    if n % 2 == 1:
        step = f"Odd count ({n} valid values): The median is the single middle value at position {(n+1)//2}."
    else:
        step = f"Even count ({n} valid values): The median is the average of the two middle values at positions {n//2} and {(n//2)+1}."

    return MathCalculationDetails(
        technique="Median Imputation",
        formula="Sorted midpoint value: Position (N + 1) / 2",
        sample_values=sample_preview,
        step_by_step=[
            f"1. Extracted all {n} non-null values and sorted them in ascending order.",
            f"2. {step}",
            f"3. Determined robust central value: {round(median_val, 2)}."
        ],
        result_value=round(median_val, 2)
    )


def calculate_mean_math(series: pd.Series) -> MathCalculationDetails:
    """Computes transparent educational math demonstration for mean imputation."""
    clean = series.dropna()
    n = len(clean)
    sum_val = float(clean.sum())
    mean_val = float(clean.mean()) if n > 0 else 0.0

    return MathCalculationDetails(
        technique="Arithmetic Mean Imputation",
        formula="Mean = Sum of values / Total valid count (Σx / N)",
        sample_values=clean.head(5).tolist(),
        step_by_step=[
            f"1. Computed sum of all {n} valid numeric values: {round(sum_val, 2)}.",
            f"2. Divided total sum by number of observations ({n}).",
            f"3. Resulting arithmetic mean: {round(mean_val, 2)}."
        ],
        result_value=round(mean_val, 2)
    )


def apply_numerical_imputation(
    series: pd.Series,
    method: str,
    constant_val: Any = None
) -> Tuple[pd.Series, Any, MathCalculationDetails]:
    """
    Executes numerical imputation and returns (imputed_series, fill_value, math_details).
    """
    clean = series.dropna().replace([np.inf, -np.inf], np.nan).dropna()
    m = method.lower()

    if m == "median":
        fill_value = float(clean.median()) if len(clean) > 0 else 0.0
        math_details = calculate_median_math(series)
    elif m == "mean":
        fill_value = round(float(clean.mean()), 2) if len(clean) > 0 else 0.0
        math_details = calculate_mean_math(series)
    elif m == "constant":
        try:
            fill_value = float(constant_val) if constant_val is not None else 0.0
        except (ValueError, TypeError):
            fill_value = 0.0
        math_details = MathCalculationDetails(
            technique=f"Constant Value ({fill_value})",
            formula=f"x_missing = {fill_value}",
            sample_values=[fill_value],
            step_by_step=[
                f"1. Selected user-defined constant value {fill_value}.",
                "2. Directly replaced all empty NaN cells with this explicit number."
            ],
            result_value=fill_value
        )
    else:
        fill_value = 0.0
        math_details = calculate_median_math(series)

    imputed_series = series.fillna(fill_value)
    return imputed_series, fill_value, math_details
