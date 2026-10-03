import math
from typing import Tuple, List, Optional, Dict, Any
import pandas as pd
import numpy as np
from app.outliers.models import CalculationDetail


def detect_outliers_iqr(
    series: pd.Series,
    multiplier: float = 1.5
) -> Tuple[pd.Series, Optional[float], Optional[float], CalculationDetail, Dict[str, Any]]:
    """
    Detect outliers using Tukey's Interquartile Range (IQR) rule.
    
    Returns:
        (outlier_mask, lower_bound, upper_bound, calculation_detail, stats_dict)
    """
    clean_series = pd.to_numeric(series, errors='coerce').dropna()
    clean_series = clean_series[~np.isinf(clean_series)]

    if len(clean_series) == 0:
        empty_calc = CalculationDetail(
            method="iqr",
            formula="IQR = Q3 - Q1; Lower = Q1 - (multiplier * IQR); Upper = Q3 + (multiplier * IQR)",
            steps=["Column contains no valid numerical values."],
            parameters={"multiplier": multiplier}
        )
        return pd.Series(False, index=series.index), None, None, empty_calc, {}

    q1 = float(clean_series.quantile(0.25))
    q3 = float(clean_series.quantile(0.75))
    iqr = float(q3 - q1)

    lower_bound = float(q1 - (multiplier * iqr))
    upper_bound = float(q3 + (multiplier * iqr))

    numeric_full = pd.to_numeric(series, errors='coerce')
    outlier_mask = (numeric_full < lower_bound) | (numeric_full > upper_bound)
    outlier_mask = outlier_mask.fillna(False)

    # Format step-by-step calculation with real numbers
    steps = [
        f"1. Calculate 25th Percentile (Q1) = {round(q1, 4)}",
        f"2. Calculate 75th Percentile (Q3) = {round(q3, 4)}",
        f"3. Calculate Spread: IQR = Q3 - Q1 = {round(q3, 4)} - {round(q1, 4)} = {round(iqr, 4)}",
        f"4. Lower Fence = Q1 - ({multiplier} × IQR) = {round(q1, 4)} - ({multiplier} × {round(iqr, 4)}) = {round(lower_bound, 4)}",
        f"5. Upper Fence = Q3 + ({multiplier} × IQR) = {round(q3, 4)} + ({multiplier} × {round(iqr, 4)}) = {round(upper_bound, 4)}",
        f"6. Result: Flag any observation < {round(lower_bound, 4)} or > {round(upper_bound, 4)} as an outlier."
    ]

    calc_detail = CalculationDetail(
        method="iqr",
        formula="IQR = Q3 - Q1; Lower = Q1 - (multiplier × IQR); Upper = Q3 + (multiplier × IQR)",
        steps=steps,
        parameters={"multiplier": multiplier, "q1": q1, "q3": q3, "iqr": iqr}
    )

    stats = {
        "q1": q1,
        "q3": q3,
        "iqr": iqr,
        "lower_bound": lower_bound,
        "upper_bound": upper_bound,
        "multiplier": multiplier
    }

    return outlier_mask, lower_bound, upper_bound, calc_detail, stats
