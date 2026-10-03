"""Power transformations: Yeo-Johnson and Box-Cox with Maximum Likelihood parameter estimation."""
from typing import Tuple, Dict, Any
import numpy as np
import pandas as pd
from sklearn.preprocessing import PowerTransformer
from app.transformations.models import CalculationStepDetail


def fit_transform_yeo_johnson(
    series: pd.Series
) -> Tuple[pd.Series, Dict[str, Any], CalculationStepDetail]:
    """Fit and transform a numerical series using Yeo-Johnson power transformation.
    
    Supports positive, zero, and negative values natively.
    Estimates optimal lambda via Maximum Likelihood Estimation.
    """
    valid_mask = series.notna()
    valid_vals = series[valid_mask].astype(float)

    if len(valid_vals) == 0:
        return series.copy(), {"lambda": 1.0, "method": "yeo-johnson"}, CalculationStepDetail(
            method="yeo_johnson",
            formula="ψ(λ, x)",
            steps=["No valid numerical values present."],
            parameters={"lambda": 1.0},
            sample_calculation="ψ(1, x) = x"
        )

    # Check for constant column
    if valid_vals.nunique() <= 1:
        transformed_series = series.copy().astype(float)
        transformed_series.loc[valid_mask] = 0.0
        params = {"lambda": 1.0, "method": "yeo-johnson", "is_constant": True}
        calculation = CalculationStepDetail(
            method="yeo_johnson",
            formula="ψ(λ, x)",
            steps=["Feature has zero variance / single unique value. Mapped to 0.0."],
            parameters=params,
            sample_calculation="x' = 0.0"
        )
        return transformed_series, params, calculation

    pt = PowerTransformer(method="yeo-johnson", standardize=True)
    reshaped = valid_vals.values.reshape(-1, 1)
    scaled_vals = pt.fit_transform(reshaped).flatten()

    transformed_series = series.copy().astype(float)
    transformed_series.loc[valid_mask] = scaled_vals

    fitted_lambda = float(pt.lambdas_[0])
    sample_x = float(valid_vals.iloc[0])
    sample_res = float(scaled_vals[0])

    steps = [
        f"1. Analyzed input range: min = {float(valid_vals.min()):.4f}, max = {float(valid_vals.max()):.4f} (Supports positive, zero, and negative values).",
        f"2. Estimated optimal power exponent via Maximum Likelihood Estimation (MLE): λ = {fitted_lambda:.4f}.",
        f"3. Applied piecewise Yeo-Johnson transformation matching sign of x with calibrated λ.",
        f"4. Standardized output to mean ≈ 0.0, std ≈ 1.0 for optimal Gaussian alignment."
    ]
    sample_calc = f"Sample point x = {sample_x:.2f} with λ = {fitted_lambda:.4f} ➔ Standardized y' = {sample_res:.4f}"

    params = {
        "method": "yeo-johnson",
        "lambda": round(fitted_lambda, 6),
        "standardize": True,
        "n_samples": int(len(valid_vals))
    }

    calculation = CalculationStepDetail(
        method="yeo_johnson",
        formula="ψ(λ, x) = ((x + 1)^λ - 1)/λ (for x ≥ 0) | -((-x + 1)^(2 - λ) - 1)/(2 - λ) (for x < 0)",
        steps=steps,
        parameters=params,
        sample_calculation=sample_calc
    )

    return transformed_series, params, calculation


def fit_transform_box_cox(
    series: pd.Series
) -> Tuple[pd.Series, Dict[str, Any], CalculationStepDetail]:
    """Fit and transform a numerical series using Box-Cox power transformation.
    
    Strictly requires all values to be strictly positive (x > 0).
    Raises ValueError if zero or negative values exist, guiding user to Yeo-Johnson.
    """
    valid_mask = series.notna()
    valid_vals = series[valid_mask].astype(float)

    if len(valid_vals) == 0:
        return series.copy(), {"lambda": 1.0, "method": "box-cox"}, CalculationStepDetail(
            method="box_cox",
            formula="y^(λ) = (y^λ - 1) / λ",
            steps=["No valid numerical values present."],
            parameters={"lambda": 1.0},
            sample_calculation="y' = y"
        )

    min_val = float(valid_vals.min())
    if min_val <= 0.0:
        raise ValueError(
            f"Box-Cox power transformation strictly requires all values to be strictly positive (x > 0). "
            f"Found minimum value = {min_val:.4f}. "
            f"Educational Recommendation: Use the Yeo-Johnson Power Transformation instead, which natively supports zero and negative numbers."
        )

    if valid_vals.nunique() <= 1:
        transformed_series = series.copy().astype(float)
        transformed_series.loc[valid_mask] = 0.0
        params = {"lambda": 1.0, "method": "box-cox", "is_constant": True}
        calculation = CalculationStepDetail(
            method="box_cox",
            formula="y^(λ) = (y^λ - 1) / λ",
            steps=["Feature has zero variance / single unique value. Mapped to 0.0."],
            parameters=params,
            sample_calculation="x' = 0.0"
        )
        return transformed_series, params, calculation

    pt = PowerTransformer(method="box-cox", standardize=True)
    reshaped = valid_vals.values.reshape(-1, 1)
    scaled_vals = pt.fit_transform(reshaped).flatten()

    transformed_series = series.copy().astype(float)
    transformed_series.loc[valid_mask] = scaled_vals

    fitted_lambda = float(pt.lambdas_[0])
    sample_x = float(valid_vals.iloc[0])
    sample_res = float(scaled_vals[0])

    steps = [
        f"1. Verified strict positivity constraint: min = {min_val:.4f} > 0.",
        f"2. Estimated optimal power exponent via Maximum Likelihood Estimation (MLE): λ = {fitted_lambda:.4f}.",
        f"3. Applied Box-Cox formula: y^(λ) = (y^λ - 1) / λ (for λ ≠ 0).",
        f"4. Standardized output to mean ≈ 0.0, std ≈ 1.0 for bell-curve conformity."
    ]
    sample_calc = f"Sample point x = {sample_x:.2f} with λ = {fitted_lambda:.4f} ➔ Standardized y' = {sample_res:.4f}"

    params = {
        "method": "box-cox",
        "lambda": round(fitted_lambda, 6),
        "standardize": True,
        "n_samples": int(len(valid_vals))
    }

    calculation = CalculationStepDetail(
        method="box_cox",
        formula="y^(λ) = (y^λ - 1) / λ (for λ ≠ 0) | ln(y) (for λ = 0)",
        steps=steps,
        parameters=params,
        sample_calculation=sample_calc
    )

    return transformed_series, params, calculation
