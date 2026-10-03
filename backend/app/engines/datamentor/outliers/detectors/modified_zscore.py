from typing import Tuple, Optional, Dict, Any
import pandas as pd
import numpy as np
from app.outliers.models import CalculationDetail


def detect_outliers_modified_zscore(
    series: pd.Series,
    threshold: float = 3.5
) -> Tuple[pd.Series, Optional[float], Optional[float], CalculationDetail, Dict[str, Any]]:
    """
    Detect outliers using Boris Iglewicz & David Hoaglin's Modified Z-Score:
    ModZ = 0.6745 * (x - median) / MAD
    Outliers flagged if |ModZ| > threshold (default 3.5).
    
    Returns:
        (outlier_mask, lower_bound, upper_bound, calculation_detail, stats_dict)
    """
    clean_series = pd.to_numeric(series, errors='coerce').dropna()
    clean_series = clean_series[~np.isinf(clean_series)]

    if len(clean_series) == 0:
        empty_calc = CalculationDetail(
            method="modified_zscore",
            formula="ModZ = 0.6745 * (x - median) / MAD; Flag if |ModZ| > threshold",
            steps=["Column contains no valid numerical values."],
            parameters={"threshold": threshold}
        )
        return pd.Series(False, index=series.index), None, None, empty_calc, {}

    median = float(clean_series.median())
    abs_deviations = (clean_series - median).abs()
    mad = float(abs_deviations.median())

    # Edge case: MAD == 0 (more than 50% of values are identical to the median)
    if mad == 0.0 or np.isnan(mad):
        # When MAD is 0, compute Mean Absolute Deviation from median as robust fallback
        mean_ad = float(abs_deviations.mean())
        if mean_ad == 0.0:
            calc_detail = CalculationDetail(
                method="modified_zscore",
                formula="ModZ = 0.6745 * (x - median) / MAD",
                steps=[
                    f"1. Sample Median = {round(median, 4)}",
                    f"2. Median Absolute Deviation (MAD) = 0.0 (Over 50% of observations are exactly equal to the median)",
                    "3. Standard MAD cannot divide by zero; all non-zero deviations are identical.",
                    "4. Result: 0 outliers detected because distribution has zero dispersion around median."
                ],
                parameters={"threshold": threshold, "median": median, "mad": 0.0}
            )
            return pd.Series(False, index=series.index), median, median, calc_detail, {"median": median, "mad": 0.0}
        else:
            # Scale using mean absolute deviation * 0.7979
            effective_dispersion = mean_ad * 0.7979
            lower_bound = float(median - (threshold * effective_dispersion / 0.6745))
            upper_bound = float(median + (threshold * effective_dispersion / 0.6745))
            numeric_full = pd.to_numeric(series, errors='coerce')
            mod_z = 0.6745 * (numeric_full - median) / effective_dispersion
            outlier_mask = (mod_z.abs() > threshold).fillna(False)

            steps = [
                f"1. Calculate Sample Median (x̃) = {round(median, 4)}",
                f"2. Raw MAD = 0.0 (High repetition at median). Using Mean Absolute Deviation = {round(mean_ad, 4)}",
                f"3. Effective Scale Factor = {round(effective_dispersion, 4)}",
                f"4. Lower Fence = x̃ - ({threshold} × Scale / 0.6745) = {round(lower_bound, 4)}",
                f"5. Upper Fence = x̃ + ({threshold} × Scale / 0.6745) = {round(upper_bound, 4)}",
                f"6. Result: Flag observations with |Modified Z| > {threshold}."
            ]
            calc_detail = CalculationDetail(
                method="modified_zscore",
                formula="ModZ = 0.6745 * (x - x̃) / MeanAD (Fallback for MAD=0)",
                steps=steps,
                parameters={"threshold": threshold, "median": median, "mad": 0.0, "mean_ad": mean_ad}
            )
            return outlier_mask, lower_bound, upper_bound, calc_detail, {"median": median, "mad": 0.0, "mean_ad": mean_ad}

    # Standard Modified Z-Score
    scale_factor = mad / 0.6745
    lower_bound = float(median - (threshold * scale_factor))
    upper_bound = float(median + (threshold * scale_factor))

    numeric_full = pd.to_numeric(series, errors='coerce')
    mod_z_scores = 0.6745 * (numeric_full - median) / mad
    outlier_mask = (mod_z_scores.abs() > threshold).fillna(False)

    steps = [
        f"1. Calculate Sample Median (x̃) = {round(median, 4)}",
        f"2. Calculate Median Absolute Deviation: MAD = median(|x - {round(median, 4)}|) = {round(mad, 4)}",
        f"3. Consistency Scaling Factor = MAD / 0.6745 = {round(mad, 4)} / 0.6745 = {round(scale_factor, 4)}",
        f"4. Lower Bound = x̃ - ({threshold} × Scale) = {round(median, 4)} - ({threshold} × {round(scale_factor, 4)}) = {round(lower_bound, 4)}",
        f"5. Upper Bound = x̃ + ({threshold} × Scale) = {round(median, 4)} + ({threshold} × {round(scale_factor, 4)}) = {round(upper_bound, 4)}",
        f"6. Result: Flag observations with |Modified Z| > {threshold} (values < {round(lower_bound, 4)} or > {round(upper_bound, 4)})."
    ]

    calc_detail = CalculationDetail(
        method="modified_zscore",
        formula="ModZ = 0.6745 × (x - x̃) / MAD; Flag if |ModZ| > threshold",
        steps=steps,
        parameters={"threshold": threshold, "median": median, "mad": mad}
    )

    stats = {
        "median": median,
        "mad": mad,
        "threshold": threshold,
        "lower_bound": lower_bound,
        "upper_bound": upper_bound
    }

    return outlier_mask, lower_bound, upper_bound, calc_detail, stats
