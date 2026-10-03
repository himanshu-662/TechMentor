"""RobustScaler implementation utilizing Median and Interquartile Range (IQR)."""
from typing import Tuple, Dict, Any
import numpy as np
import pandas as pd
from sklearn.preprocessing import RobustScaler
from app.transformations.models import CalculationStepDetail


def fit_transform_robust(
    series: pd.Series
) -> Tuple[pd.Series, Dict[str, Any], CalculationStepDetail]:
    """Fit and transform a numerical series using RobustScaler.
    
    Formula: x' = (x - median) / IQR
    where IQR = Q3 (75th percentile) - Q1 (25th percentile).
    Handles zero IQR features safely.
    """
    valid_mask = series.notna()
    valid_vals = series[valid_mask].astype(float)

    if len(valid_vals) == 0:
        return series.copy(), {
            "center": 0.0, "scale": 1.0, "q1": 0.0, "q3": 0.0, "iqr": 1.0
        }, CalculationStepDetail(
            method="robust",
            formula="x' = (x - median) / IQR",
            steps=["No valid numerical values available."],
            parameters={"center": 0.0, "scale": 1.0},
            sample_calculation="x' = x"
        )

    median_val = float(valid_vals.median())
    q1_val = float(valid_vals.quantile(0.25))
    q3_val = float(valid_vals.quantile(0.75))
    iqr_val = float(q3_val - q1_val)

    transformed_series = series.copy().astype(float)

    if iqr_val == 0.0 or np.isnan(iqr_val):
        # Fallback when middle 50% of values are identical
        transformed_series.loc[valid_mask] = valid_vals - median_val
        steps = [
            f"1. Calculated feature median = {median_val:.4f}.",
            f"2. Calculated Q1 (25th percentile) = {q1_val:.4f} and Q3 (75th percentile) = {q3_val:.4f}.",
            f"3. Interquartile range IQR = (Q3 - Q1) = 0.0 (Over 50% of values are identical).",
            f"4. Zero-IQR safeguard applied: Centered by median without dividing by zero."
        ]
        sample_calc = f"x' = (x - {median_val:.2f}) / 1.0 = x - {median_val:.2f}"
        scale_used = 1.0
    else:
        scaler = RobustScaler()
        reshaped = valid_vals.values.reshape(-1, 1)
        scaled_vals = scaler.fit_transform(reshaped).flatten()
        transformed_series.loc[valid_mask] = scaled_vals

        sample_x = float(valid_vals.iloc[0])
        sample_scaled = (sample_x - median_val) / iqr_val

        steps = [
            f"1. Calculated robust center (Median) = {median_val:.4f}.",
            f"2. Calculated 25th percentile (Q1) = {q1_val:.4f} and 75th percentile (Q3) = {q3_val:.4f}.",
            f"3. Computed Interquartile Range: IQR = ({q3_val:.4f} - {q1_val:.4f}) = {iqr_val:.4f}.",
            f"4. Subtracted median from each value: (x - {median_val:.4f}).",
            f"5. Divided by IQR: x' = (x - {median_val:.4f}) / {iqr_val:.4f}.",
            f"6. Resulting distribution has median = 0.0 and IQR = 1.0, resistant to extreme outliers."
        ]
        sample_calc = f"Sample point x = {sample_x:.2f} ➔ x' = ({sample_x:.2f} - {median_val:.2f}) / {iqr_val:.2f} = {sample_scaled:.4f}"
        scale_used = iqr_val

    params = {
        "median": round(median_val, 6),
        "q1": round(q1_val, 6),
        "q3": round(q3_val, 6),
        "iqr": round(iqr_val, 6),
        "scale_factor": round(scale_used, 6),
        "n_samples": int(len(valid_vals))
    }

    calculation = CalculationStepDetail(
        method="robust",
        formula="x' = (x - median) / IQR",
        steps=steps,
        parameters=params,
        sample_calculation=sample_calc
    )

    return transformed_series, params, calculation
