"""Core Feature Engineering Engine coordinating generation, validation, and educational explanations."""
from typing import Dict, Any, Tuple, List
import pandas as pd

from app.engines.menti_ai.education.concept_registry import concept_registry
from app.feature_engineering.models import (
    FeatureTypeEnum,
    FeatureValidationSummary,
    FeatureEngineeringPreviewResponse,
    SampleFeatureRow
)
from app.feature_engineering.generators.mathematical import generate_mathematical_feature
from app.feature_engineering.generators.interactions import generate_interaction_feature
from app.feature_engineering.generators.ratios import generate_ratio_feature
from app.feature_engineering.generators.datetime_features import (
    generate_datetime_parts_feature,
    generate_cyclical_feature,
    generate_date_difference_feature
)
from app.feature_engineering.generators.aggregations import generate_aggregation_feature
from app.feature_engineering.generators.binning import generate_binning_feature
from app.feature_engineering.generators.indicators import generate_indicator_feature
from app.feature_engineering.generators.frequency import generate_frequency_feature
from app.feature_engineering.generators.text_features import generate_text_statistics_feature
from app.feature_engineering.validation import validate_feature_name, evaluate_feature_series


# Mapping of FeatureType to primary Educational Concept ID
FEATURE_TYPE_CONCEPT_MAP: Dict[str, str] = {
    FeatureTypeEnum.MATHEMATICAL.value: "mathematical_features",
    FeatureTypeEnum.INTERACTION.value: "interaction_features",
    FeatureTypeEnum.RATIO.value: "ratio_features",
    FeatureTypeEnum.DATETIME_PARTS.value: "datetime_features",
    FeatureTypeEnum.CYCLICAL.value: "cyclical_encoding",
    FeatureTypeEnum.DATE_DIFFERENCE.value: "date_difference",
    FeatureTypeEnum.AGGREGATION.value: "aggregation_features",
    FeatureTypeEnum.BINNING.value: "feature_binning",
    FeatureTypeEnum.INDICATOR.value: "indicator_features",
    FeatureTypeEnum.FREQUENCY.value: "frequency_features",
    FeatureTypeEnum.TEXT_STATISTICS.value: "text_features",
}


def compute_feature_series(
    df: pd.DataFrame,
    feature_type: str,
    params: Dict[str, Any]
) -> Tuple[pd.Series, str, List[str], List[str], List[str]]:
    """
    Dispatch feature generation to the appropriate generator.
    
    Returns:
        (result_series, formula, step_by_step_calculation, warnings, source_columns_involved)
    """
    ft_norm = feature_type.lower()
    source_cols: List[str] = []

    if ft_norm == FeatureTypeEnum.MATHEMATICAL.value:
        src_a = params.get("column_a")
        src_b = params.get("column_b")
        if src_a:
            source_cols.append(src_a)
        if src_b:
            source_cols.append(src_b)
        series, formula, steps, warnings = generate_mathematical_feature(df, params)

    elif ft_norm == FeatureTypeEnum.INTERACTION.value:
        src_a = params.get("column_a")
        src_b = params.get("column_b")
        if src_a:
            source_cols.append(src_a)
        if src_b:
            source_cols.append(src_b)
        series, formula, steps, warnings = generate_interaction_feature(df, params)

    elif ft_norm == FeatureTypeEnum.RATIO.value:
        src_num = params.get("numerator_column") or params.get("column_a")
        src_denom = params.get("denominator_column") or params.get("column_b")
        if src_num:
            source_cols.append(src_num)
        if src_denom:
            source_cols.append(src_denom)
        series, formula, steps, warnings = generate_ratio_feature(df, params)

    elif ft_norm == FeatureTypeEnum.DATETIME_PARTS.value:
        col = params.get("datetime_column") or params.get("column_a")
        if col:
            source_cols.append(col)
        series, formula, steps, warnings = generate_datetime_parts_feature(df, params)

    elif ft_norm == FeatureTypeEnum.CYCLICAL.value:
        col = params.get("datetime_column") or params.get("column_a")
        if col:
            source_cols.append(col)
        series, formula, steps, warnings = generate_cyclical_feature(df, params)

    elif ft_norm == FeatureTypeEnum.DATE_DIFFERENCE.value:
        src_a = params.get("start_datetime_column") or params.get("column_a")
        src_b = params.get("end_datetime_column") or params.get("column_b")
        if src_a:
            source_cols.append(src_a)
        if src_b:
            source_cols.append(src_b)
        series, formula, steps, warnings = generate_date_difference_feature(df, params)

    elif ft_norm == FeatureTypeEnum.AGGREGATION.value:
        grp = params.get("group_by_column")
        tgt = params.get("target_column")
        if grp:
            source_cols.append(grp)
        if tgt:
            source_cols.append(tgt)
        series, formula, steps, warnings = generate_aggregation_feature(df, params)

    elif ft_norm == FeatureTypeEnum.BINNING.value:
        col = params.get("source_column") or params.get("column_a")
        if col:
            source_cols.append(col)
        series, formula, steps, warnings = generate_binning_feature(df, params)

    elif ft_norm == FeatureTypeEnum.INDICATOR.value:
        col = params.get("source_column") or params.get("column_a")
        if col:
            source_cols.append(col)
        series, formula, steps, warnings = generate_indicator_feature(df, params)

    elif ft_norm == FeatureTypeEnum.FREQUENCY.value:
        col = params.get("source_column") or params.get("column_a")
        if col:
            source_cols.append(col)
        series, formula, steps, warnings = generate_frequency_feature(df, params)

    elif ft_norm == FeatureTypeEnum.TEXT_STATISTICS.value:
        col = params.get("text_column") or params.get("source_column") or params.get("column_a")
        if col:
            source_cols.append(col)
        series, formula, steps, warnings = generate_text_statistics_feature(df, params)

    else:
        raise ValueError(f"Unrecognized feature engineering type: '{feature_type}'")

    return series, formula, steps, warnings, source_cols


def generate_feature_preview(
    dataset_id: str,
    df: pd.DataFrame,
    feature_type: str,
    new_feature_name: str,
    params: Dict[str, Any]
) -> FeatureEngineeringPreviewResponse:
    """
    Simulate feature creation non-destructively and return rich preview with educational guidance.
    """
    # Name validation
    is_valid_name, name_errors = validate_feature_name(new_feature_name, list(df.columns))
    if not is_valid_name:
        raise ValueError(" | ".join(name_errors))

    # Compute series
    series, formula, steps, warnings, source_cols = compute_feature_series(df, feature_type, params)

    # Validation and Preview Rows
    validation, preview_rows = evaluate_feature_series(
        series=series,
        df=df,
        source_columns=source_cols,
        additional_warnings=warnings
    )

    # Fetch educational concept
    concept_id = FEATURE_TYPE_CONCEPT_MAP.get(feature_type.lower(), "feature_engineering")
    concept = concept_registry.get_concept(concept_id)
    
    edu_dict: Dict[str, Any] = {}
    ml_impact = "Enhances predictive representation of domain signals."
    
    if concept:
        edu_dict = {
            "title": concept.title,
            "short_definition": concept.short_definition,
            "beginner_explanation": concept.beginner_explanation,
            "intermediate_explanation": concept.intermediate_explanation,
            "why_it_matters": concept.why_it_matters,
            "interview_tip": concept.interview_tip,
            "common_mistakes": concept.common_mistakes
        }
        ml_impact = concept.ml_impact

    return FeatureEngineeringPreviewResponse(
        dataset_id=dataset_id,
        feature_name=new_feature_name,
        feature_type=feature_type,
        formula_human_readable=formula,
        preview_rows=preview_rows,
        validation=validation,
        educational_concept_id=concept_id,
        educational_explanation=edu_dict,
        ml_impact_explanation=ml_impact,
        step_by_step_calculation=steps,
        warnings=warnings
    )
