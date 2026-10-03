from typing import Dict, Any, List
import pandas as pd
import numpy as np
from app.outliers.models import OutlierRecommendation, AlternativeMethod


def generate_outlier_recommendation(
    series: pd.Series,
    column_name: str
) -> OutlierRecommendation:
    """
    Deterministically recommends the optimal outlier detection method
    based on empirical distribution properties (skewness, dispersion, symmetry).
    """
    clean = pd.to_numeric(series, errors='coerce').dropna()
    clean = clean[~np.isinf(clean)]

    if len(clean) < 3:
        return OutlierRecommendation(
            recommended_method="iqr",
            reason="Sample size is too small for parametric modeling; IQR is chosen as a safe non-parametric baseline.",
            evidence={"count": len(clean), "skewness": 0.0},
            alternative_methods=[
                AlternativeMethod(
                    name="Keep Unchanged",
                    method_id="keep",
                    description="Retain all observations due to insufficient statistical power.",
                    trade_off="May retain data entry errors."
                )
            ]
        )

    skewness = float(clean.skew())
    if np.isnan(skewness):
        skewness = 0.0

    mean = float(clean.mean())
    std = float(clean.std(ddof=1)) if len(clean) > 1 else 0.0
    median = float(clean.median())
    abs_dev = (clean - median).abs()
    mad = float(abs_dev.median())
    q1 = float(clean.quantile(0.25))
    q3 = float(clean.quantile(0.75))
    iqr = float(q3 - q1)

    evidence: Dict[str, Any] = {
        "count": int(len(clean)),
        "skewness": round(skewness, 4),
        "mean": round(mean, 4),
        "median": round(median, 4),
        "std": round(std, 4),
        "mad": round(mad, 4),
        "iqr": round(iqr, 4)
    }

    # Severe or Moderate Skewness (|skew| > 1.0)
    if abs(skewness) > 1.0:
        recommended_method = "iqr"
        direction = "right-skewed (positive tail)" if skewness > 0 else "left-skewed (negative tail)"
        reason = (
            f"The feature '{column_name}' is {direction} with a skewness coefficient of {round(skewness, 2)}. "
            f"Parametric Z-Scores would be distorted because the mean is pulled away from the center. "
            f"Tukey's IQR method is non-parametric and resistant to tail distortion."
        )
        alternatives = [
            AlternativeMethod(
                name="Modified Z-Score (Iglewicz & Hoaglin)",
                method_id="modified_zscore",
                description="Uses median and Median Absolute Deviation (MAD). Excellent for robust tail scoring.",
                trade_off="Slightly more complex to interpret than quartile boundaries."
            ),
            AlternativeMethod(
                name="Standard Z-Score (Mean & Std Dev)",
                method_id="zscore",
                description="Assumes a bell curve. Flags observations beyond 3 standard deviations.",
                trade_off="Vulnerable to masking because extreme outliers inflate standard deviation."
            )
        ]
    else:
        # Approximately Symmetric / Normal (|skew| <= 1.0)
        recommended_method = "zscore"
        reason = (
            f"The feature '{column_name}' is approximately symmetric (skewness = {round(skewness, 2)}). "
            f"Standard Z-Score is ideal for bell-shaped distributions, leveraging standard deviations (μ ± 3σ) "
            f"to flag statistically improbable observations."
        )
        alternatives = [
            AlternativeMethod(
                name="Interquartile Range (IQR)",
                method_id="iqr",
                description="Non-parametric box plot rule (Q1 - 1.5*IQR to Q3 + 1.5*IQR).",
                trade_off="Does not assume Gaussian distribution; slightly less sensitive on strictly normal data."
            ),
            AlternativeMethod(
                name="Modified Z-Score (MAD)",
                method_id="modified_zscore",
                description="Median-centered robust standard score.",
                trade_off="Provides extra defense against hidden cluster anomalies."
            )
        ]

    return OutlierRecommendation(
        recommended_method=recommended_method,
        reason=reason,
        evidence=evidence,
        alternative_methods=alternatives
    )
