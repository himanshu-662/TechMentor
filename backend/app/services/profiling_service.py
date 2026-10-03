import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
try:
    from app.profiling.column_profiler import profile_column
    from app.profiling.issue_detector import detect_issues
except ImportError:
    from backend.app.profiling.column_profiler import profile_column
    from backend.app.profiling.issue_detector import detect_issues


# In-memory profile cache keyed by dataset_id or hash
_PROFILE_CACHE: Dict[str, Dict[str, Any]] = {}


def clear_dataset_cache(dataset_id: str) -> None:
    """Clear cached profile for a specific dataset."""
    if dataset_id in _PROFILE_CACHE:
        del _PROFILE_CACHE[dataset_id]


def profile_dataset(df: pd.DataFrame, dataset_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Coordinates complete automated dataset profiling across all columns and dataset-level metrics.
    Caches result if dataset_id is provided.
    """
    if dataset_id and dataset_id in _PROFILE_CACHE:
        return _PROFILE_CACHE[dataset_id]

    row_count = int(len(df))
    col_count = int(len(df.columns))
    missing_cells = int(df.isna().sum().sum())
    total_cells = row_count * col_count if row_count and col_count else 1
    missing_cells_percentage = round((missing_cells / total_cells) * 100, 2)
    
    dup_rows = int(df.duplicated().sum()) if row_count > 0 else 0
    dup_pct = round((dup_rows / row_count) * 100, 2) if row_count > 0 else 0.0

    # Profile each column
    column_profiles = {}
    numerical_count = 0
    categorical_count = 0
    datetime_count = 0
    identifier_count = 0
    constant_count = 0
    near_constant_count = 0

    for col in df.columns:
        col_series = df[col]
        prof = profile_column(col_series, str(col))
        column_profiles[str(col)] = prof

        sem_type = prof.get("semantic_type", "unknown")
        if sem_type == "numerical":
            numerical_count += 1
        elif sem_type in ("categorical", "boolean", "text"):
            categorical_count += 1
        elif sem_type == "datetime":
            datetime_count += 1
        elif sem_type == "identifier":
            identifier_count += 1

        if prof.get("unique_count") == 1 and prof.get("missing_percentage", 100) < 100:
            constant_count += 1

    dataset_summary = {
        "row_count": row_count,
        "column_count": col_count,
        "missing_cells": missing_cells,
        "missing_cells_percentage": missing_cells_percentage,
        "duplicate_rows": dup_rows,
        "duplicate_percentage": dup_pct,
        "numerical_column_count": numerical_count,
        "categorical_column_count": categorical_count,
        "datetime_column_count": datetime_count,
        "identifier_column_count": identifier_count,
        "constant_column_count": constant_count,
        "near_constant_column_count": near_constant_count
    }

    # Detect quality issues
    raw_issues = detect_issues(df, {
        "duplicate_row_count": dup_rows,
        "duplicate_percentage": dup_pct
    }, column_profiles)

    # Enhance issues with actionability linking directly to Stage 3 (Cleaning)
    issues = []
    for issue in raw_issues:
        itype = issue.get("issue_type")
        actionable_in_stage_3 = itype in ("missing_values", "duplicate_rows", "constant_column", "near_constant_column")
        issue_copy = dict(issue)
        issue_copy["actionable_in_stage_3"] = actionable_in_stage_3
        if actionable_in_stage_3:
            issue_copy["stage_target"] = "cleaning"
        issues.append(issue_copy)

    # Learning explanations
    learning_explanations = {
        "overview": {
            "title": "Why Automated Profiling Matters",
            "concept": "Dataset profiling gives you visibility into structural anomalies, missingness mechanisms, and distributions before any transformations occur. Operating on unseen data risks data leakage and faulty assumptions.",
            "rule_of_thumb": "Always inspect missing rates, duplicate counts, and data distributions before selecting cleaning or feature engineering strategies."
        },
        "missing_values": {
            "title": "Missing Values & Imputation",
            "concept": "Missing values (NaN / Null) happen due to non-response, system drops, or unrecorded events. Machine learning models cannot train with missing values.",
            "next_stage": "Stage 3 (Data Cleaning) enables median/mean/mode imputation or row/column dropping based on skewness and missingness severity."
        },
        "duplicates": {
            "title": "Duplicate Observations",
            "concept": "Exact duplicates artificially inflate sample importance and skew distribution metrics, leading to over-optimistic evaluation metrics.",
            "next_stage": "Stage 3 allows one-click deduplication to ensure unique representative records."
        },
        "identifiers": {
            "title": "High-Cardinality Identifiers",
            "concept": "Primary keys and UUIDs have 100% uniqueness but zero predictive value, causing overfitting if included in ML models.",
            "next_stage": "Stage 3 & Stage 7 allow excluding identifier columns from model feature sets."
        }
    }

    # Convert column_profiles dict to list for table rendering while keeping map
    columns_list = list(column_profiles.values())

    result = {
        "dataset_summary": dataset_summary,
        "column_profiles": column_profiles,
        "columns": columns_list,
        "issues": issues,
        "learning_explanations": learning_explanations,
        "status": "Analysis completed",
        "total_issues_count": len(issues),
        "cleanable_issues_count": sum(1 for i in issues if i.get("actionable_in_stage_3"))
    }

    if dataset_id:
        _PROFILE_CACHE[dataset_id] = result

    return result
