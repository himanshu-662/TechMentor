"""MinMaxScaler implementation with configurable feature range, zero-range protection, and step breakdown."""
from typing import Tuple, Dict, Any
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from app.transformations.models import CalculationStepDetail


def fit_transform_minmax(
    series: pd.Series,
    feature_range: Tuple[float, float] = (0.0, 1.0)
) -> Tuple[pd.Series, Dict[str, Any], CalculationStepDetail]:
    """Fit and transform a numerical series using MinMaxScaler.
    
    Formula: x_scaled = ((x - min) / (max - min)) * (max_range - min_range) + min_range
    Handles constant features (max == min) by setting transformed values to min_range.
    """
    valid_mask = series.notna()
    valid_vals = series[valid_mask].astype(float)
    min_range, max_range = feature_range

    if len(valid_vals) == 0:
        return series.copy(), {
            "min": 0.0, "max": 1.0, "range": 1.0, "feature_range": list(feature_range)
        }, CalculationStepDetail(
            method="minmax",
            formula="x' = ((x - min) / (max - min)) * (range_max - range_min) + range_min",
            steps=["No valid numerical values present."],
            parameters={"min": 0.0, "max": 1.0, "feature_range": list(feature_range)},
            sample_calculation="x' = x"
        )

    data_min = float(valid_vals.min())
    data_max = float(valid_vals.max())
    data_range = data_max - data_min

    transformed_series = series.copy().astype(float)

    if data_range == 0.0 or np.isnan(data_range):
        # Constant feature safeguard
        transformed_series.loc[valid_mask] = min_range
        steps = [
            f"1. Identified feature minimum: min = {data_min:.4f}.",
            f"2. Identified feature maximum: max = {data_max:.4f}.",
            f"3. Range (max - min) = 0.0 (Feature is constant).",
            f"4. Constant safeguard applied: All values mapped to lower bound {min_range:.2f} to prevent division by zero."
        ]
        sample_calc = f"x' = ({data_min:.2f} - {data_min:.2f}) / 0 (protected) ➔ {min_range:.2f}"
    else:
        scaler = MinMaxScaler(feature_range=feature_range)
        reshaped = valid_vals.values.reshape(-1, 1)
        scaled_vals = scaler.fit_transform(reshaped).flatten()
        transformed_series.loc[valid_mask] = scaled_vals

        sample_x = float(valid_vals.iloc[0])
        std_norm = (sample_x - data_min) / data_range
        sample_scaled = std_norm * (max_range - min_range) + min_range

        steps = [
            f"1. Identified minimum value: min = {data_min:.4f}.",
            f"2. Identified maximum value: max = {data_max:.4f}.",
            f"3. Computed empirical data range: ({data_max:.4f} - {data_min:.4f}) = {data_range:.4f}.",
            f"4. Standardized to [0, 1]: x_std = (x - {data_min:.4f}) / {data_range:.4f}.",
            f"5. Rescaled to target range [{min_range:.2f}, {max_range:.2f}]: x' = x_std * ({max_range:.2f} - {min_range:.2f}) + {min_range:.2f}."
        ]
        sample_calc = f"Sample point x = {sample_x:.2f} ➔ x' = (({sample_x:.2f} - {data_min:.2f}) / {data_range:.2f}) * ({max_range - min_range:.2f}) + {min_range:.2f} = {sample_scaled:.4f}"

    params = {
        "data_min": round(data_min, 6),
        "data_max": round(data_max, 6),
        "data_range": round(data_range, 6),
        "feature_range": [round(min_range, 4), round(max_range, 4)],
        "n_samples": int(len(valid_vals))
    }

    calculation = CalculationStepDetail(
        method="minmax",
        formula="x' = ((x - min) / (max - min)) * (max_r - min_r) + min_r",
        steps=steps,
        parameters=params,
        sample_calculation=sample_calc
    )

    return transformed_series, params, calculation
