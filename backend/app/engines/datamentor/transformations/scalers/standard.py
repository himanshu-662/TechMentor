"""StandardScaler implementation with mathematical step generation and constant-feature safety."""
from typing import Tuple, Dict, Any
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from app.transformations.models import CalculationStepDetail


def fit_transform_standard(
    series: pd.Series
) -> Tuple[pd.Series, Dict[str, Any], CalculationStepDetail]:
    """Fit and transform a numerical series using StandardScaler.
    
    Formula: z = (x - mean) / std
    Handles constant features (std = 0) by setting transformed values to 0.0.
    """
    valid_mask = series.notna()
    valid_vals = series[valid_mask].astype(float)

    if len(valid_vals) == 0:
        return series.copy(), {"mean": 0.0, "std": 1.0, "var": 1.0}, CalculationStepDetail(
            method="standard",
            formula="z = (x - μ) / σ",
            steps=["No valid non-null numerical values available to compute mean and standard deviation."],
            parameters={"mean": 0.0, "std": 1.0, "var": 1.0},
            sample_calculation="z = (x - 0) / 1 = x"
        )

    mean_val = float(valid_vals.mean())
    std_val = float(valid_vals.std(ddof=0))  # Population std matching scikit-learn
    var_val = float(valid_vals.var(ddof=0))

    transformed_series = series.copy().astype(float)

    if std_val == 0.0 or np.isnan(std_val):
        # Constant column safeguard
        transformed_series.loc[valid_mask] = 0.0
        steps = [
            f"1. Calculated sample mean (μ) = {mean_val:.4f}.",
            f"2. Calculated population standard deviation (σ) = 0.0 (Feature is constant / zero variance).",
            f"3. Constant safeguard applied: All valid values are mapped to 0.0 to prevent division by zero."
        ]
        sample_calc = f"z = ({mean_val:.2f} - {mean_val:.2f}) / 0 (protected) = 0.00"
    else:
        scaler = StandardScaler()
        reshaped = valid_vals.values.reshape(-1, 1)
        scaled_vals = scaler.fit_transform(reshaped).flatten()
        transformed_series.loc[valid_mask] = scaled_vals

        sample_x = float(valid_vals.iloc[0])
        sample_z = (sample_x - mean_val) / std_val
        steps = [
            f"1. Calculated mean (μ) = {mean_val:.4f}.",
            f"2. Calculated standard deviation (σ) = {std_val:.4f} (Variance σ² = {var_val:.4f}).",
            f"3. Subtracted mean from each value: (x - {mean_val:.4f}).",
            f"4. Divided by standard deviation: z = (x - {mean_val:.4f}) / {std_val:.4f}.",
            f"5. Resulting standardized distribution has mean ≈ 0.0 and std ≈ 1.0."
        ]
        sample_calc = f"Sample point x = {sample_x:.2f} ➔ z = ({sample_x:.2f} - {mean_val:.2f}) / {std_val:.2f} = {sample_z:.4f}"

    params = {
        "mean": round(mean_val, 6),
        "std": round(std_val, 6),
        "var": round(var_val, 6),
        "n_samples": int(len(valid_vals))
    }

    calculation = CalculationStepDetail(
        method="standard",
        formula="z = (x - μ) / σ",
        steps=steps,
        parameters=params,
        sample_calculation=sample_calc
    )

    return transformed_series, params, calculation
