from typing import Tuple, Optional, Dict, Any
import pandas as pd
import numpy as np
from app.outliers.models import CalculationDetail


def detect_outliers_zscore(
    series: pd.Series,
    threshold: float = 3.0
) -> Tuple[pd.Series, Optional[float], Optional[float], CalculationDetail, Dict[str, Any]]:
    """
    Detect outliers using standard parametric Z-Score (|Z| > threshold).
    
    Returns:
        (outlier_mask, lower_bound, upper_bound, calculation_detail, stats_dict)
    """
    clean_series = pd.to_numeric(series, errors='coerce').dropna()
    clean_series = clean_series[~np.isinf(clean_series)]

    if len(clean_series) == 0:
        empty_calc = CalculationDetail(
            method="zscore",
            formula="Z = (x - mean) / std; Flag if |Z| > threshold",
            steps=["Column contains no valid numerical values."],
            parameters={"threshold": threshold}
        )
        return pd.Series(False, index=series.index), None, None, empty_calc, {}

    mean = float(clean_series.mean())
    std = float(clean_series.std(ddof=1)) if len(clean_series) > 1 else 0.0

    # Edge case: zero standard deviation (constant column)
    if std == 0.0 or np.isnan(std):
        calc_detail = CalculationDetail(
            method="zscore",
            formula="Z = (x - mean) / std",
            steps=[
                f"1. Mean (μ) = {round(mean, 4)}",
                f"2. Standard Deviation (σ) = 0.0 (All values are identical or constant)",
                "3. Z-scores cannot be computed with zero variance (division by zero).",
                "4. Result: 0 outliers detected because all observations are identical to the mean."
            ],
            parameters={"threshold": threshold, "mean": mean, "std": 0.0}
        )
        return pd.Series(False, index=series.index), mean, mean, calc_detail, {"mean": mean, "std": 0.0}

    lower_bound = float(mean - (threshold * std))
    upper_bound = float(mean + (threshold * std))

    numeric_full = pd.to_numeric(series, errors='coerce')
    z_scores = (numeric_full - mean) / std
    outlier_mask = z_scores.abs() > threshold
    outlier_mask = outlier_mask.fillna(False)

    steps = [
        f"1. Calculate Sample Mean (μ) = {round(mean, 4)}",
        f"2. Calculate Standard Deviation (σ) = {round(std, 4)}",
        f"3. Threshold Z-Score (t) = {threshold}",
        f"4. Lower Limit = μ - ({threshold} × σ) = {round(mean, 4)} - ({threshold} × {round(std, 4)}) = {round(lower_bound, 4)}",
        f"5. Upper Limit = μ + ({threshold} × σ) = {round(mean, 4)} + ({threshold} × {round(std, 4)}) = {round(upper_bound, 4)}",
        f"6. Result: Flag any observation with |Z| > {threshold} (values < {round(lower_bound, 4)} or > {round(upper_bound, 4)})."
    ]

    calc_detail = CalculationDetail(
        method="zscore",
        formula="Z = (x - μ) / σ; Flag if |Z| > threshold",
        steps=steps,
        parameters={"threshold": threshold, "mean": mean, "std": std}
    )

    stats = {
        "mean": mean,
        "std": std,
        "threshold": threshold,
        "lower_bound": lower_bound,
        "upper_bound": upper_bound
    }

    return outlier_mask, lower_bound, upper_bound, calc_detail, stats
