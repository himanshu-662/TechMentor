"""Outlier treatment execution functions."""
from app.outliers.treatments.keep import treat_keep
from app.outliers.treatments.remove import treat_remove
from app.outliers.treatments.cap import treat_cap
from app.outliers.treatments.flag import treat_flag

__all__ = ["treat_keep", "treat_remove", "treat_cap", "treat_flag"]
