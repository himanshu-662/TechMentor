"""Basic text statistics feature generator for unstructured string columns."""
import re
from typing import Dict, Any, Tuple, List
import pandas as pd
from app.feature_engineering.models import TextStatisticTypeEnum


def generate_text_statistics_feature(
    df: pd.DataFrame,
    params: Dict[str, Any]
) -> Tuple[pd.Series, str, List[str], List[str]]:
    """
    Extract deterministic statistical features from raw text column.
    
    Returns:
        (result_series, formula_human_readable, step_by_step_calculation, warnings)
    """
    col = params.get("text_column") or params.get("source_column") or params.get("column_a")
    stat_type = params.get("statistic_type", TextStatisticTypeEnum.CHAR_COUNT.value).lower()
    
    if not col or col not in df.columns:
        raise ValueError(f"Text column '{col}' does not exist in dataset.")

    text_series = df[col].fillna("").astype(str)
    warnings: List[str] = []
    
    null_count = int(df[col].isna().sum())
    if null_count > 0:
        warnings.append(f"Source text column has {null_count} missing values (treated as empty strings with stat=0).")

    if stat_type == TextStatisticTypeEnum.CHAR_COUNT.value:
        result = text_series.str.len()
        formula = f"char_length({col})"
        desc = "total character length (including spaces)"
    elif stat_type == TextStatisticTypeEnum.WORD_COUNT.value:
        result = text_series.apply(lambda s: len(s.strip().split()) if s.strip() else 0)
        formula = f"word_count({col})"
        desc = "number of whitespace-separated words"
    elif stat_type == TextStatisticTypeEnum.SENTENCE_COUNT.value:
        sentence_regex = re.compile(r'[.!?]+')
        result = text_series.apply(
            lambda s: len([seg for seg in sentence_regex.split(s) if seg.strip()]) if s.strip() else 0
        )
        formula = f"sentence_count({col})"
        desc = "number of punctuated sentences"
    elif stat_type == TextStatisticTypeEnum.UPPERCASE_COUNT.value:
        result = text_series.apply(lambda s: sum(1 for c in s if c.isupper()))
        formula = f"uppercase_count({col})"
        desc = "number of uppercase capital letters"
    elif stat_type == TextStatisticTypeEnum.DIGIT_COUNT.value:
        result = text_series.apply(lambda s: sum(1 for c in s if c.isdigit()))
        formula = f"digit_count({col})"
        desc = "number of numeric digit characters"
    else:
        raise ValueError(f"Unsupported text statistic type: '{stat_type}'")

    step_steps = [
        f"1. Handle missing string values by converting nulls to empty string ''",
        f"2. Apply deterministic text parser to calculate {desc}",
        f"3. Return extracted numerical text meta-feature vector."
    ]

    return result, formula, step_steps, warnings
