import uuid
from typing import Tuple, Dict, Any, List, Optional
import pandas as pd
import numpy as np
from fastapi import HTTPException, status

try:
    from app.models.explanation import OperationExplanation, AlternativeTechnique
    from app.services.ingestion_service import clean_row_value
    from app.engines.datamentor.cleaning.models import CleaningRequest, MathCalculationDetails
    from app.engines.datamentor.cleaning.validation import validate_cleaning_request
    from app.engines.datamentor.cleaning.missing_values.numerical import apply_numerical_imputation, calculate_median_math, calculate_mean_math
    from app.engines.datamentor.cleaning.missing_values.categorical import apply_categorical_imputation, calculate_mode_math
    from app.engines.datamentor.cleaning.duplicates import remove_duplicates
    from app.engines.datamentor.cleaning.constants import remove_constant_column
except ImportError:
    # pyrefly: ignore [missing-import]
    from app.cleaning.models import CleaningRequest, MathCalculationDetails
    # pyrefly: ignore [missing-import]
    from app.cleaning.validation import validate_cleaning_request
    # pyrefly: ignore [missing-import]
    from app.cleaning.missing_values.numerical import apply_numerical_imputation, calculate_median_math, calculate_mean_math
    # pyrefly: ignore [missing-import]
    from app.cleaning.missing_values.categorical import apply_categorical_imputation, calculate_mode_math
    # pyrefly: ignore [missing-import]
    from app.cleaning.duplicates import remove_duplicates
    # pyrefly: ignore [missing-import]
    from app.cleaning.constants import remove_constant_column


def format_row_preview(df: pd.DataFrame, limit: int = 5) -> List[Dict[str, Any]]:
    """Formats top DataFrame rows as clean, JSON-serializable dictionaries."""
    head_df = df.head(limit)
    rows = []
    for _, r in head_df.iterrows():
        rows.append({str(c): clean_row_value(v) for c, v in r.items()})
    return rows


def execute_cleaning_pipeline(
    df: pd.DataFrame,
    req: CleaningRequest
) -> Tuple[pd.DataFrame, OperationExplanation, Dict[str, Any], Dict[str, Any], int, Optional[MathCalculationDetails]]:
    """
    Core deterministic transformation execution pipeline:
    1. Validates inputs and semantic constraints.
    2. Executes action on DataFrame copy.
    3. Calculates rigorous before & after metrics.
    4. Generates standard 7-Pillar OperationExplanation.
    Returns: (df_transformed, explanation, metrics_before, metrics_after, affected_rows, math_details)
    """
    op = req.operation.lower()
    col = req.column
    method = (req.method or "median").lower() if req.method else None

    # Step 1: Validate
    validate_cleaning_request(df, op, col, method)

    df_new = df.copy()
    op_id = f"op_clean_{uuid.uuid4().hex[:8]}"

    metrics_before: Dict[str, Any] = {
        "total_rows": int(len(df)),
        "total_columns": int(len(df.columns)),
        "total_missing_cells": int(df.isna().sum().sum()),
        "duplicate_rows": int(df.duplicated().sum()) if len(df) > 0 else 0
    }

    affected_rows = 0
    math_details: Optional[MathCalculationDetails] = None

    # ------------------------------------------------------------------
    # Operation A: Impute Missing Values
    # ------------------------------------------------------------------
    if op == "impute_missing":
        series = df[col]
        missing_count = int(series.isna().sum())
        affected_rows = missing_count
        is_numeric = pd.api.types.is_numeric_dtype(series)

        metrics_before["column"] = col
        metrics_before["column_missing_count"] = missing_count
        metrics_before["column_missing_percentage"] = round((missing_count / len(df)) * 100, 2)
        if is_numeric and len(series.dropna()) > 0:
            metrics_before["column_mean"] = round(float(series.dropna().mean()), 2)
            metrics_before["column_median"] = round(float(series.dropna().median()), 2)
            metrics_before["column_skewness"] = round(float(series.dropna().skew()), 2) if len(series.dropna()) > 2 else 0.0

        if method == "drop_rows":
            df_new = df_new.dropna(subset=[col])
            tech_name = "Listwise Row Deletion"
            what_happened = f"Removed {missing_count} row(s) containing missing values in column '{col}'."
            why_selected = "Preserves authentic observed entries without injecting synthetic values."
            alternatives = [
                AlternativeTechnique(
                    name="Median Imputation" if is_numeric else "Mode Imputation",
                    description="Fills missing entries with distribution center.",
                    pros=["Retains full sample size"],
                    cons=["Injects approximations"],
                    best_used_when="Data is limited and rows cannot be discarded."
                )
            ]
            when_to_use = "When missingness rate is negligible (<2%) and dataset size is sufficient."
        elif is_numeric:
            imputed_s, fill_val, math_details = apply_numerical_imputation(series, method, req.constant_value)
            df_new[col] = imputed_s
            if method == "median":
                tech_name = "Median Imputation"
                what_happened = f"Imputed {missing_count} missing value(s) in column '{col}' with median value ({fill_val})."
                why_selected = "Robust against distribution skewness and extreme outliers; preserves 50th percentile."
                alternatives = [
                    AlternativeTechnique(
                        name="Mean Imputation",
                        description="Replaces nulls with sample mean.",
                        pros=["Preserves sample sum"],
                        cons=["Distorted by outliers"],
                        best_used_when="Data is strictly normally distributed without outliers."
                    ),
                    AlternativeTechnique(
                        name="Constant Value",
                        description="Fills with explicit sentinel value.",
                        pros=["Explicit indicator"],
                        cons=["Arbitrary value"],
                        best_used_when="Missing represents an explicit absent state."
                    )
                ]
                when_to_use = "Best for skewed continuous attributes with low-to-moderate missingness (<20%)."
            elif method == "mean":
                tech_name = "Mean Imputation"
                what_happened = f"Imputed {missing_count} missing value(s) in column '{col}' with mean value ({fill_val})."
                why_selected = "Preserves overall expected value and sample sum for symmetrical distributions."
                alternatives = [
                    AlternativeTechnique(
                        name="Median Imputation",
                        description="Replaces nulls with 50th percentile.",
                        pros=["Outlier resistant"],
                        cons=["Ignores tail distribution"],
                        best_used_when="Data has outliers or skewness."
                    )
                ]
                when_to_use = "Best for normally distributed, bell-shaped numerical features with zero outliers."
            else:
                tech_name = f"Constant Value Imputation ({fill_val})"
                what_happened = f"Imputed {missing_count} missing value(s) in column '{col}' with constant sentinel ({fill_val})."
                why_selected = "Explicit indicator preserving missingness mechanism."
                alternatives = [AlternativeTechnique(name="Median Imputation", description="Replaces with median.", pros=["Blends with data"], cons=["Masks absence"], best_used_when="Missingness is random noise.")]
                when_to_use = "When empty entries represent an intentional absent state (e.g. 0 count)."
        else:
            # Categorical
            imputed_s, fill_val, math_details = apply_categorical_imputation(series, method, req.constant_value)
            df_new[col] = imputed_s
            if method == "mode":
                tech_name = "Mode Imputation"
                what_happened = f"Imputed {missing_count} missing categorical value(s) in column '{col}' with mode ('{fill_val}')."
                why_selected = "Most frequent category preserves discrete vocabulary without injecting invalid math."
                alternatives = [AlternativeTechnique(name="Constant Sentinel ('Unknown')", description="Explicit missing category.", pros=["Preserves missing signal"], cons=["Adds category"], best_used_when="Missingness is informative.")]
                when_to_use = "Recommended for categorical variables with one clearly dominant class."
            else:
                tech_name = f"Constant Category Imputation ('{fill_val}')"
                what_happened = f"Imputed {missing_count} missing entries in column '{col}' with constant sentinel category '{fill_val}'."
                why_selected = "Preserves the presence of missingness as a discrete signal for decision trees."
                alternatives = [AlternativeTechnique(name="Mode Imputation", description="Replaces with dominant category.", pros=["No new category"], cons=["Assumes dominant class"], best_used_when="Missingness is random noise.")]
                when_to_use = "When absence of a category is informative (Missing Not At Random)."

        series_after = df_new[col] if col in df_new.columns else pd.Series(dtype=object)
        missing_after = int(series_after.isna().sum())
        metrics_after: Dict[str, Any] = {
            "total_rows": int(len(df_new)),
            "total_columns": int(len(df_new.columns)),
            "total_missing_cells": int(df_new.isna().sum().sum()),
            "duplicate_rows": int(df_new.duplicated().sum()) if len(df_new) > 0 else 0,
            "column": col,
            "column_missing_count": missing_after,
            "column_missing_percentage": round((missing_after / len(df_new)) * 100, 2) if len(df_new) > 0 else 0.0
        }
        if is_numeric and len(series_after.dropna()) > 0:
            metrics_after["column_mean"] = round(float(series_after.dropna().mean()), 2)
            metrics_after["column_median"] = round(float(series_after.dropna().median()), 2)
            metrics_after["column_skewness"] = round(float(series_after.dropna().skew()), 2) if len(series_after.dropna()) > 2 else 0.0

        impact_summary = f"Column '{col}' nulls reduced from {missing_count} to {missing_after}. Total missing cells in dataset: {metrics_before['total_missing_cells']} -> {metrics_after['total_missing_cells']}."

        explanation = OperationExplanation(
            operation_id=op_id,
            module_name="Cleaning & Missing-Value Handling",
            what_happened=what_happened,
            why_it_happened=f"Stage 3 Profiling detected {missing_count} missing value(s) ({metrics_before['column_missing_percentage']}%) in column '{col}'. Machine learning estimators require complete numeric matrices.",
            technique_used=tech_name,
            selection_rationale=why_selected,
            metrics_before=metrics_before,
            metrics_after=metrics_after,
            impact_summary=impact_summary,
            alternatives=alternatives,
            when_to_use=when_to_use,
            learning_concept_tag="missing_values"
        )

    # ------------------------------------------------------------------
    # Operation B: Remove Duplicate Rows
    # ------------------------------------------------------------------
    elif op == "drop_duplicates":
        df_new, dup_count, dedup_metrics = remove_duplicates(df)
        affected_rows = dup_count
        metrics_after = {
            "total_rows": int(len(df_new)),
            "total_columns": int(len(df_new.columns)),
            "total_missing_cells": int(df_new.isna().sum().sum()),
            "duplicate_rows": int(df_new.duplicated().sum()) if len(df_new) > 0 else 0
        }
        impact_summary = f"Eliminated {dup_count} exact duplicate rows. Total rows reduced from {len(df)} to {len(df_new)}."

        explanation = OperationExplanation(
            operation_id=op_id,
            module_name="Cleaning & Missing-Value Handling",
            what_happened=f"Removed {dup_count} exact duplicate row(s) from the dataset.",
            why_it_happened=f"Identified {dup_count} exact duplicate rows ({dedup_metrics['percentage_removed']}% of dataset). Duplicate records introduce false sample importance.",
            technique_used="Exact Row Hash Deduplication",
            selection_rationale="Identical rows arise from re-transmissions or logging duplicates. Removing them guarantees unique representative observations.",
            metrics_before=metrics_before,
            metrics_after=metrics_after,
            impact_summary=impact_summary,
            alternatives=[
                AlternativeTechnique(
                    name="Retain Duplicates",
                    description="Keep rows without modification.",
                    pros=["No sample size reduction"],
                    cons=["Skews model distributions"],
                    best_used_when="Duplication represents genuine identical independent observations."
                )
            ],
            when_to_use="Always remove exact duplicate records unless domain experts confirm they are genuine identical events.",
            learning_concept_tag="duplicate_records"
        )

    # ------------------------------------------------------------------
    # Operation C: Remove Constant Feature
    # ------------------------------------------------------------------
    elif op in ("drop_constant_column", "drop_column"):
        df_new, drop_metrics = remove_constant_column(df, col)
        affected_rows = len(df)
        metrics_after = {
            "total_rows": int(len(df_new)),
            "total_columns": int(len(df_new.columns)),
            "total_missing_cells": int(df_new.isna().sum().sum()),
            "duplicate_rows": int(df_new.duplicated().sum()) if len(df_new) > 0 else 0,
            "dropped_column": col
        }
        impact_summary = f"Removed zero-variance column '{col}'. Active columns reduced from {len(df.columns)} to {len(df_new.columns)}."

        explanation = OperationExplanation(
            operation_id=op_id,
            module_name="Cleaning & Missing-Value Handling",
            what_happened=f"Removed column '{col}' from the active dataset.",
            why_it_happened=f"Column '{col}' exhibited zero variance across all {len(df)} records.",
            technique_used="Zero-Variance Feature Pruning",
            selection_rationale="A feature with zero variance cannot differentiate between target classes and consumes unnecessary memory.",
            metrics_before=metrics_before,
            metrics_after=metrics_after,
            impact_summary=impact_summary,
            alternatives=[
                AlternativeTechnique(
                    name="Retain Feature",
                    description="Keep column untouched.",
                    pros=["Preserves complete original schema"],
                    cons=["Zero predictive utility, adds clutter"],
                    best_used_when="Required strictly for regulatory reporting or audit trails."
                )
            ],
            when_to_use="Recommended whenever a column has only 1 distinct value across all valid entries.",
            learning_concept_tag="constant_features"
        )
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Unsupported operation '{op}'.")

    return df_new, explanation, metrics_before, metrics_after, affected_rows, math_details


class CleaningEngine:
    """Core deterministic transformation execution engine for Step 04."""
    execute = staticmethod(execute_cleaning_pipeline)
    format_preview = staticmethod(format_row_preview)
