from typing import Tuple, Dict, Any, List
import pandas as pd
try:
    from app.cleaning.models import MathCalculationDetails
except ImportError:
    from backend.app.cleaning.models import MathCalculationDetails


def calculate_mode_math(series: pd.Series) -> MathCalculationDetails:
    """Computes transparent educational math demonstration for mode imputation."""
    clean = series.dropna()
    counts = clean.value_counts()
    top_items = counts.head(3).to_dict()
    mode_val = str(counts.index[0]) if len(counts) > 0 else "Unknown"
    mode_count = int(counts.iloc[0]) if len(counts) > 0 else 0

    return MathCalculationDetails(
        technique="Mode Imputation",
        formula="ArgMax_c (Frequency Count of Category c)",
        sample_values=[f"{k}: {v}" for k, v in top_items.items()],
        step_by_step=[
            f"1. Tallied frequencies across all {len(clean)} valid categorical observations.",
            f"2. Identified most frequent category '{mode_val}' occurring {mode_count} times.",
            f"3. Assigned mode category to all missing entries."
        ],
        result_value=mode_val
    )


def apply_categorical_imputation(
    series: pd.Series,
    method: str,
    constant_val: Any = None
) -> Tuple[pd.Series, Any, MathCalculationDetails]:
    """
    Executes categorical imputation and returns (imputed_series, fill_value, math_details).
    """
    clean = series.dropna()
    m = method.lower()

    if m == "mode":
        counts = clean.value_counts()
        fill_value = str(counts.index[0]) if len(counts) > 0 else "Unknown"
        math_details = calculate_mode_math(series)
    elif m == "constant":
        fill_value = str(constant_val) if constant_val is not None and str(constant_val).strip() else "Unknown"
        math_details = MathCalculationDetails(
            technique=f"Constant Sentinel ('{fill_value}')",
            formula=f"cat_missing = '{fill_value}'",
            sample_values=[fill_value],
            step_by_step=[
                f"1. Designated explicit sentinel category '{fill_value}'.",
                "2. Preserved the missingness mechanism as an explicit categorical bucket for tree-based models."
            ],
            result_value=fill_value
        )
    else:
        fill_value = "Unknown"
        math_details = calculate_mode_math(series)

    imputed_series = series.fillna(fill_value)
    return imputed_series, fill_value, math_details
