"""Validation and statistical integrity inspection for engineered features."""
import re
from typing import Dict, Any, List, Tuple
import numpy as np
import pandas as pd
from app.feature_engineering.models import FeatureValidationSummary, SampleFeatureRow


def validate_feature_name(name: str, existing_columns: List[str]) -> Tuple[bool, List[str]]:
    """Verify that feature name is valid and does not accidentally overwrite existing columns."""
    errors: List[str] = []
    if not name or not name.strip():
        errors.append("Feature name cannot be empty.")
        return False, errors
        
    cleaned_name = name.strip()
    if not re.match(r'^[a-zA-Z_][a-zA-Z0-9_]*$', cleaned_name):
        errors.append(
            f"Feature name '{cleaned_name}' contains invalid characters. Use letters, numbers, and underscores only, starting with a letter or underscore."
        )
        
    if cleaned_name in existing_columns:
        errors.append(f"A column named '{cleaned_name}' already exists in the dataset. Please choose a unique name.")
        
    return len(errors) == 0, errors


def evaluate_feature_series(
    series: pd.Series,
    df: pd.DataFrame,
    source_columns: List[str],
    additional_warnings: List[str] = None
) -> Tuple[FeatureValidationSummary, List[SampleFeatureRow]]:
    """
    Compute distribution metrics, anomaly detection, and format sample preview rows.
    """
    total_rows = len(df)
    null_count = int(series.isna().sum())
    null_pct = (null_count / total_rows * 100) if total_rows > 0 else 0.0
    
    # Infinite values count
    if pd.api.types.is_numeric_dtype(series):
        inf_mask = np.isinf(series)
        inf_count = int(inf_mask.sum())
    else:
        inf_count = 0
        
    unique_count = int(series.nunique(dropna=False))
    is_constant = (unique_count <= 1) and (total_rows > 1)
    
    warnings: List[str] = list(additional_warnings or [])
    errors: List[str] = []
    
    if is_constant:
        warnings.append("The engineered feature is constant (identical value across all rows). It provides 0 variance.")
    if null_pct > 20.0:
        warnings.append(f"High missing value rate: {null_pct:.1f}% of rows resulted in NaN.")
    if inf_count > 0:
        errors.append(f"Feature contains {inf_count} infinite (+/- Inf) values, which will cause ML model training to crash.")

    summary_stats: Dict[str, Any] = {}
    if pd.api.types.is_numeric_dtype(series):
        clean_num = series.dropna()
        if len(clean_num) > 0:
            summary_stats = {
                "min": float(clean_num.min()) if not np.isinf(clean_num.min()) else None,
                "max": float(clean_num.max()) if not np.isinf(clean_num.max()) else None,
                "mean": float(clean_num.mean()) if not np.isinf(clean_num.mean()) else None,
                "median": float(clean_num.median()) if not np.isinf(clean_num.median()) else None,
                "std": float(clean_num.std()) if len(clean_num) > 1 and not np.isinf(clean_num.std()) else 0.0
            }
    else:
        # Categorical / string distribution
        top_counts = series.value_counts(dropna=False).head(5).to_dict()
        summary_stats = {
            "top_categories": {str(k): int(v) for k, v in top_counts.items()},
            "unique_categories": unique_count
        }

    valid = len(errors) == 0

    validation = FeatureValidationSummary(
        valid=valid,
        total_rows=total_rows,
        null_count=null_count,
        null_percentage=round(null_pct, 2),
        inf_count=inf_count,
        is_constant=is_constant,
        unique_count=unique_count,
        dtype=str(series.dtype),
        warnings=warnings,
        errors=errors,
        summary_stats=summary_stats
    )

    # Build sample rows for preview (first 10 rows or mixed sample)
    sample_indices = list(range(min(10, total_rows)))
    preview_rows: List[SampleFeatureRow] = []
    
    for idx in sample_indices:
        src_vals = {}
        for col in source_columns:
            if col in df.columns:
                val = df.iloc[idx][col]
                src_vals[col] = None if pd.isna(val) else (float(val) if isinstance(val, (np.floating, float)) else str(val))
                
        gen_val = series.iloc[idx]
        is_val_null = pd.isna(gen_val)
        is_val_inf = bool(np.isinf(gen_val)) if isinstance(gen_val, (int, float, np.number)) else False
        
        formatted_gen_val: Any
        if is_val_null:
            formatted_gen_val = None
        elif is_val_inf:
            formatted_gen_val = "Infinity"
        elif isinstance(gen_val, (float, np.floating)):
            formatted_gen_val = round(float(gen_val), 4)
        elif isinstance(gen_val, (int, np.integer)):
            formatted_gen_val = int(gen_val)
        elif isinstance(gen_val, (bool, np.bool_)):
            formatted_gen_val = bool(gen_val)
        else:
            formatted_gen_val = str(gen_val)

        preview_rows.append(
            SampleFeatureRow(
                index=idx,
                source_values=src_vals,
                generated_value=formatted_gen_val,
                is_anomaly=is_val_null or is_val_inf
            )
        )

    return validation, preview_rows
