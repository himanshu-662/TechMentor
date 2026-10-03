"""DataMentor Step 03: EDA & Profiling Engine.
Computes 1st to 4th central moments (Mean, Variance, Skewness, Kurtosis),
distribution histograms, semantic column types, and data quality issues.
"""
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np

try:
    from app.profiling.column_profiler import profile_column
    from app.profiling.issue_detector import detect_issues
    from app.services.profiling_service import profile_dataset as service_profile_dataset
except ImportError:
    from backend.app.profiling.column_profiler import profile_column
    from backend.app.profiling.issue_detector import detect_issues
    from backend.app.services.profiling_service import profile_dataset as service_profile_dataset


class ProfilingEngine:
    """Deterministic Profiling Engine calculating statistical moments and health scores."""

    @staticmethod
    def calculate_central_moments(series: pd.Series) -> Dict[str, Optional[float]]:
        """Calculate the first 4 statistical moments (Mean, Variance, Skewness, Kurtosis)."""
        valid = series.dropna().astype(float)
        if len(valid) < 2:
            return {"mean": None, "variance": None, "skewness": None, "kurtosis": None}

        mean_val = float(valid.mean())
        var_val = float(valid.var())
        skew_val = float(valid.skew()) if len(valid) >= 3 else 0.0
        kurt_val = float(valid.kurtosis()) if len(valid) >= 4 else 0.0

        return {
            "mean": round(mean_val, 4),
            "variance": round(var_val, 4),
            "skewness": round(skew_val, 4),
            "kurtosis": round(kurt_val, 4)
        }

    @classmethod
    def profile_column(cls, series: pd.Series, col_name: str) -> Dict[str, Any]:
        """Profile an individual column, delegating to domain column profiler."""
        return profile_column(series, col_name)

    @classmethod
    def profile_dataset(cls, df: pd.DataFrame, dataset_id: Optional[str] = None) -> Dict[str, Any]:
        """Compute complete automated dataset profile across all columns."""
        return service_profile_dataset(df, dataset_id=dataset_id)

    @classmethod
    def detect_issues(cls, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Detect automated issues (missing values, high cardinality, constant columns, skew)."""
        profile = cls.profile_dataset(df)
        return detect_issues(profile)
