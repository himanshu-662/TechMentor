"""Outlier detection algorithms."""
from app.outliers.detectors.iqr import detect_outliers_iqr
from app.outliers.detectors.zscore import detect_outliers_zscore
from app.outliers.detectors.modified_zscore import detect_outliers_modified_zscore

__all__ = [
    "detect_outliers_iqr",
    "detect_outliers_zscore",
    "detect_outliers_modified_zscore"
]
