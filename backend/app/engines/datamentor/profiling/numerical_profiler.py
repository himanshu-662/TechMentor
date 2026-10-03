import pandas as pd
import numpy as np
from typing import Dict, Any

def profile_numerical_column(series: pd.Series) -> Dict[str, Any]:
    """Profiles a numerical column."""
    count = len(series)
    missing_count = int(series.isna().sum())
    missing_percentage = (missing_count / count * 100) if count > 0 else 0.0
    
    valid_data = series.dropna()
    unique_count = int(valid_data.nunique())
    
    if len(valid_data) == 0:
        return {
            "count": count,
            "missing_count": missing_count,
            "missing_percentage": missing_percentage,
            "mean": None,
            "median": None,
            "standard_deviation": None,
            "minimum": None,
            "maximum": None,
            "Q1": None,
            "Q3": None,
            "IQR": None,
            "skewness": None,
            "unique_count": 0
        }

    # Handle infs by replacing with NaN temporarily to compute stats
    clean_data = valid_data.replace([np.inf, -np.inf], np.nan).dropna()
    
    if len(clean_data) == 0:
        return {
            "count": count,
            "missing_count": missing_count + len(valid_data), # Infs considered missing/invalid for stats? Let's just say missing_count is based on isna()
            "missing_percentage": missing_percentage,
            "mean": None,
            "median": None,
            "standard_deviation": None,
            "minimum": None,
            "maximum": None,
            "Q1": None,
            "Q3": None,
            "IQR": None,
            "skewness": None,
            "unique_count": unique_count
        }

    mean = float(clean_data.mean())
    median = float(clean_data.median())
    std = float(clean_data.std()) if len(clean_data) > 1 else 0.0
    min_val = float(clean_data.min())
    max_val = float(clean_data.max())
    q1 = float(clean_data.quantile(0.25))
    q3 = float(clean_data.quantile(0.75))
    iqr = q3 - q1
    skewness = float(clean_data.skew()) if len(clean_data) > 2 else 0.0

    # Ensure NaN isn't passed down where float is expected
    if pd.isna(std): std = 0.0
    if pd.isna(skewness): skewness = 0.0

    return {
        "count": count,
        "missing_count": missing_count,
        "missing_percentage": missing_percentage,
        "mean": mean,
        "median": median,
        "standard_deviation": std,
        "minimum": min_val,
        "maximum": max_val,
        "Q1": q1,
        "Q3": q3,
        "IQR": iqr,
        "skewness": skewness,
        "unique_count": unique_count
    }
