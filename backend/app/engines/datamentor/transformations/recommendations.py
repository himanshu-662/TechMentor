"""Deterministic, evidence-based transformation recommendation engine without LLM fabrication."""
from typing import Dict, Any, List
from app.transformations.models import TransformationRecommendation, AlternativeTransformation


def recommend_transformation(
    column: str,
    stats: Dict[str, Any],
) -> TransformationRecommendation:
    """Analyze empirical numerical stats and generate deterministic recommendation with alternatives."""
    skewness = stats.get("skewness", 0.0) or 0.0
    outlier_pct = stats.get("outlier_percentage", 0.0) or 0.0
    min_val = stats.get("min", 0.0) or 0.0
    max_val = stats.get("max", 0.0) or 0.0
    has_negatives = min_val < 0.0
    is_strictly_positive = min_val > 0.0

    evidence = {
        "skewness": round(skewness, 3),
        "outlier_percentage": round(outlier_pct, 2),
        "min": round(min_val, 3),
        "max": round(max_val, 3),
        "has_negatives": has_negatives,
        "is_strictly_positive": is_strictly_positive
    }

    educational_note = "Remember: Not every feature needs transformation. Monotonic scalers do not alter tree-based models (e.g. Random Forest, XGBoost), but are essential for linear models, KNN, SVM, and Neural Networks."

    # Case 1: Extreme Outliers & Heavy Tails -> RobustScaler
    if outlier_pct >= 3.0:
        recommended = "robust"
        reason = (
            f"Feature contains significant extreme values ({outlier_pct:.1f}% outliers). "
            f"RobustScaler centers with the median and scales with Interquartile Range (IQR), "
            f"ensuring extreme values do not distort scaling parameters."
        )
        confidence = 0.90
        alternatives = [
            AlternativeTransformation(
                name="StandardScaler",
                method_id="standard",
                description="Centers with mean and unit variance.",
                trade_off="The mean and variance will be heavily inflated by the extreme outliers."
            ),
            AlternativeTransformation(
                name="Yeo-Johnson Power Transform",
                method_id="yeo_johnson",
                description="Reshapes heavy tails to conform to Gaussian distribution.",
                trade_off="Transforms distribution shape non-linearly, altering relative spacing."
            )
        ]

    # Case 2: Strong Positive Skew (skew > 1.0) and non-negative -> log1p
    elif skewness > 1.0 and not has_negatives:
        recommended = "log1p"
        reason = (
            f"Feature exhibits strong positive (right) skewness (skew = {skewness:.2f}). "
            f"Natural logarithm log1p(x) compresses the extended upper tail and stabilizes variance."
        )
        confidence = 0.92
        alternatives = [
            AlternativeTransformation(
                name="Yeo-Johnson Power Transform",
                method_id="yeo_johnson",
                description="Parametric MLE power transformation.",
                trade_off="Computationally finds optimal lambda, but log1p is more interpretable."
            ),
            AlternativeTransformation(
                name="RobustScaler",
                method_id="robust",
                description="Linear median/IQR scaling without log reshaping.",
                trade_off="Preserves skewed shape, which may violate linear model assumptions."
            )
        ]
        if is_strictly_positive:
            alternatives.append(
                AlternativeTransformation(
                    name="Box-Cox Power Transform",
                    method_id="box_cox",
                    description="Classic power transform for strictly positive data.",
                    trade_off="Strictly positive requirement satisfied, but requires MLE parameter fitting."
                )
            )

    # Case 3: Strong Skew (positive or negative) with negative values -> Yeo-Johnson
    elif (skewness > 1.0 or skewness < -1.0) and has_negatives:
        recommended = "yeo_johnson"
        reason = (
            f"Feature is significantly skewed (skew = {skewness:.2f}) and contains negative values (min = {min_val:.2f}). "
            f"Yeo-Johnson power transform optimizes normality log-likelihood while natively supporting negative numbers."
        )
        confidence = 0.88
        alternatives = [
            AlternativeTransformation(
                name="RobustScaler",
                method_id="robust",
                description="Robust median/IQR linear scaling.",
                trade_off="Handles negatives well, but will not reshape the underlying non-normal distribution."
            ),
            AlternativeTransformation(
                name="StandardScaler",
                method_id="standard",
                description="Z-Score standardization.",
                trade_off="Assumes Gaussian distribution and is sensitive to heavy tail skewness."
            )
        ]

    # Case 4: Symmetric Distribution (skew between -0.5 and 0.5) -> StandardScaler
    elif -0.5 <= skewness <= 0.5:
        recommended = "standard"
        reason = (
            f"Feature distribution is approximately symmetric (skew = {skewness:.2f}). "
            f"StandardScaler centers the mean at 0.0 and sets variance to 1.0, optimal for gradient descent and regularized models."
        )
        confidence = 0.95
        alternatives = [
            AlternativeTransformation(
                name="MinMaxScaler",
                method_id="minmax",
                description="Scales data into fixed [0, 1] range.",
                trade_off="Preferred if downstream algorithms strictly require bounded positive inputs."
            ),
            AlternativeTransformation(
                name="RobustScaler",
                method_id="robust",
                description="Median/IQR based scaling.",
                trade_off="StandardScaler is statistically more efficient for symmetric bell distributions."
            )
        ]

    # Case 5: Moderate skewness or bounded preference -> MinMaxScaler / StandardScaler
    else:
        recommended = "minmax"
        reason = (
            f"Feature has moderate skewness (skew = {skewness:.2f}) within a bounded span [{min_val:.2f}, {max_val:.2f}]. "
            f"MinMaxScaler normalizes the span into a clean [0, 1] interval."
        )
        confidence = 0.80
        alternatives = [
            AlternativeTransformation(
                name="StandardScaler",
                method_id="standard",
                description="Standard Z-Score normalization.",
                trade_off="Zero-centers the distribution without bounding to [0, 1]."
            ),
            AlternativeTransformation(
                name="Yeo-Johnson",
                method_id="yeo_johnson",
                description="Power transform for normality.",
                trade_off="Non-linear mapping if Gaussian distribution is strictly needed."
            )
        ]

    return TransformationRecommendation(
        recommended_method=recommended,
        reason=reason,
        evidence=evidence,
        confidence=confidence,
        alternative_methods=alternatives,
        educational_note=educational_note
    )
