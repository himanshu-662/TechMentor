from typing import List, Dict, Any, Optional
import pandas as pd
try:
    from app.cleaning.models import CleaningRecommendation
except ImportError:
    from backend.app.cleaning.models import CleaningRecommendation


def generate_recommendations(
    df: pd.DataFrame,
    profile_data: Dict[str, Any]
) -> List[CleaningRecommendation]:
    """
    Computes deterministic, mathematically grounded recommendations for dataset cleaning
    based on Phase 3 profiling metrics. Zero hallucinations, zero LLMs.
    """
    recommendations: List[CleaningRecommendation] = []
    dataset_summary = profile_data.get("dataset_summary", {})
    column_profiles = profile_data.get("column_profiles", {})

    # 1. Duplicate Row Recommendation
    dup_rows = dataset_summary.get("duplicate_rows", 0)
    dup_pct = dataset_summary.get("duplicate_percentage", 0.0)
    if dup_rows > 0:
        recommendations.append(CleaningRecommendation(
            column=None,
            issue_type="duplicate_rows",
            recommended_method="remove",
            reason=f"Dataset contains {dup_rows} exact duplicate row(s) ({dup_pct}% of total records). Identical rows inflate metrics and create sampling bias.",
            evidence={
                "duplicate_count": dup_rows,
                "duplicate_percentage": dup_pct,
                "total_rows": dataset_summary.get("row_count", len(df))
            },
            alternatives=["retain"],
            educational_explanation="In data science, duplicate observations often originate from re-transmissions or logging faults. Removing exact duplicates guarantees each row represents a unique event.",
            math_breakdown=f"Total records ({len(df)}) - Duplicates ({dup_rows}) = {len(df) - dup_rows} unique records."
        ))

    # 2. Column Recommendations (Missing Values & Constants)
    for col_name, prof in column_profiles.items():
        missing_count = prof.get("missing_count", 0)
        missing_pct = prof.get("missing_percentage", 0.0)
        sem_type = prof.get("semantic_type", "unknown")
        unique_count = prof.get("unique_count", 0)

        # Constant feature check
        if unique_count == 1 and missing_pct < 100:
            val_sample = df[col_name].dropna().iloc[0] if len(df[col_name].dropna()) > 0 else "N/A"
            recommendations.append(CleaningRecommendation(
                column=col_name,
                issue_type="constant_column",
                recommended_method="drop",
                reason=f"Column '{col_name}' has zero variance (constant value '{val_sample}' across all rows). It provides 0 bits of information for machine learning.",
                evidence={
                    "unique_count": 1,
                    "constant_value": str(val_sample)
                },
                alternatives=["retain"],
                educational_explanation="Machine learning models learn patterns by comparing variance between observations. A feature that never changes cannot distinguish between classes or predict an outcome.",
                math_breakdown="Variance Var(X) = 0. Standard deviation σ = 0."
            ))

        # Missing values check
        if missing_count > 0:
            if sem_type == "numerical":
                num_prof = prof.get("numerical_profile", {})
                skewness = num_prof.get("skewness", 0.0)
                mean_val = num_prof.get("mean")
                median_val = num_prof.get("median")

                is_skewed = abs(skewness) >= 1.0

                if is_skewed:
                    rec_method = "median"
                    reason = f"Strong distribution skewness ({skewness:.2f}). The median is robust against extreme tail values and prevents pulling central tendency."
                    math_bd = f"Sorted midpoint value: Median = {median_val:.2f} vs Mean = {mean_val:.2f} (dragged by tail)."
                    edu_exp = "Because extreme outliers pull the arithmetic mean upward or downward, the median (50th percentile) is the standard statistical best practice for skewed data."
                else:
                    rec_method = "mean"
                    reason = f"Symmetrical distribution (skewness = {skewness:.2f}). Mean imputation preserves the expected value and population sum."
                    math_bd = f"Sum of values / N = Mean = {mean_val:.2f}."
                    edu_exp = "For normally distributed, bell-shaped features with zero outliers, mean imputation minimizes squared error distance."

                recommendations.append(CleaningRecommendation(
                    column=col_name,
                    issue_type="missing_values",
                    recommended_method=rec_method,
                    reason=reason,
                    evidence={
                        "missing_count": missing_count,
                        "missing_percentage": missing_pct,
                        "skewness": skewness,
                        "mean": mean_val,
                        "median": median_val
                    },
                    alternatives=["mean" if rec_method == "median" else "median", "constant", "drop_rows"],
                    educational_explanation=edu_exp,
                    math_breakdown=math_bd
                ))
            else:
                # Categorical / string / boolean
                cat_prof = prof.get("categorical_profile", {})
                most_freq = cat_prof.get("most_frequent_value", "Unknown")
                most_freq_cnt = cat_prof.get("most_frequent_value_count", 0)

                recommendations.append(CleaningRecommendation(
                    column=col_name,
                    issue_type="missing_values",
                    recommended_method="mode",
                    reason=f"Categorical attribute. Mode ('{most_freq}') represents the highest frequency category ({most_freq_cnt} occurrences).",
                    evidence={
                        "missing_count": missing_count,
                        "missing_percentage": missing_pct,
                        "mode_category": most_freq,
                        "mode_frequency": most_freq_cnt
                    },
                    alternatives=["constant", "drop_rows"],
                    educational_explanation="Categorical features cannot be averaged mathematically. Imputing the mode (most common value) preserves existing category taxonomy.",
                    math_breakdown=f"Dominant category: '{most_freq}' ({most_freq_cnt} rows)."
                ))

    return recommendations
