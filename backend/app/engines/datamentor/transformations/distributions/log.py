"""Logarithmic transformation (log1p) with domain validation and math derivations."""
from typing import Tuple, Dict, Any
import numpy as np
import pandas as pd
from app.transformations.models import CalculationStepDetail


def fit_transform_log1p(
    series: pd.Series
) -> Tuple[pd.Series, Dict[str, Any], CalculationStepDetail]:
    """Fit and transform a numerical series using natural log1p: x' = log(1 + x).
    
    Strictly requires non-negative values (x >= 0).
    Raises ValueError if negative values exist, pointing learners to Yeo-Johnson.
    """
    valid_mask = series.notna()
    valid_vals = series[valid_mask].astype(float)

    if len(valid_vals) == 0:
        return series.copy(), {"offset": 1.0}, CalculationStepDetail(
            method="log1p",
            formula="x' = ln(1 + x)",
            steps=["No valid numerical values to transform."],
            parameters={"offset": 1.0},
            sample_calculation="x' = ln(1 + x)"
        )

    min_val = float(valid_vals.min())
    if min_val < 0.0:
        raise ValueError(
            f"Logarithmic transformation cannot be applied because this feature contains negative values (minimum = {min_val:.4f}). "
            f"The natural logarithm ln(x) is mathematically undefined for non-positive values. "
            f"Educational Recommendation: Consider using the Yeo-Johnson Power Transformation, which natively supports zero and negative values."
        )

    transformed_series = series.copy().astype(float)
    scaled_vals = np.log1p(valid_vals.values)
    transformed_series.loc[valid_mask] = scaled_vals

    sample_x = float(valid_vals.iloc[0])
    sample_log = float(np.log1p(sample_x))

    steps = [
        f"1. Verified domain constraint: feature minimum is {min_val:.4f} (all non-missing values are non-negative, x ≥ 0).",
        f"2. Added 1.0 offset to handle exact zeros safely: (1 + x).",
        f"3. Applied natural logarithm: x' = ln(1 + x).",
        f"4. Successfully compressed right-tail dispersion and reduced positive skewness."
    ]
    sample_calc = f"Sample point x = {sample_x:.2f} ➔ x' = ln(1 + {sample_x:.2f}) = ln({1 + sample_x:.2f}) = {sample_log:.4f}"

    params = {
        "function": "log1p",
        "offset": 1.0,
        "min_input_value": round(min_val, 6),
        "max_input_value": round(float(valid_vals.max()), 6),
        "n_samples": int(len(valid_vals))
    }

    calculation = CalculationStepDetail(
        method="log1p",
        formula="x' = ln(1 + x)",
        steps=steps,
        parameters=params,
        sample_calculation=sample_calc
    )

    return transformed_series, params, calculation
