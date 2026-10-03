"""Grouped summary aggregation generator with data leakage warning guards."""
from typing import Dict, Any, Tuple, List
import pandas as pd
from app.feature_engineering.models import AggregationFunctionEnum


def generate_aggregation_feature(
    df: pd.DataFrame,
    params: Dict[str, Any]
) -> Tuple[pd.Series, str, List[str], List[str]]:
    """
    Generate grouped aggregation feature: df.groupby(group_by_col)[target_col].transform(agg_func).
    
    Returns:
        (result_series, formula_human_readable, step_by_step_calculation, warnings)
    """
    group_by_col = params.get("group_by_column")
    target_col = params.get("target_column")
    agg_func = params.get("agg_func", AggregationFunctionEnum.MEAN.value).lower()
    
    if not group_by_col or group_by_col not in df.columns:
        raise ValueError(f"Grouping column '{group_by_col}' does not exist in dataset.")
    if not target_col or target_col not in df.columns:
        raise ValueError(f"Target numerical column '{target_col}' does not exist in dataset.")
    if group_by_col == target_col:
        raise ValueError("Grouping column and target column must be distinct.")

    target_series = pd.to_numeric(df[target_col], errors="coerce")
    group_series = df[group_by_col]
    
    # Calculate unique group count
    unique_groups = group_series.nunique()
    total_rows = len(df)
    
    warnings: List[str] = [
        "LEAKAGE WARNING: Grouped aggregations computed across an entire dataset create feature leakage if applied across train and test partitions simultaneously. In production ML pipelines, always fit group statistics on the training set only."
    ]
    
    if unique_groups == total_rows:
        warnings.append(
            f"Grouping column '{group_by_col}' has 1-to-1 unique cardinality (every row is a unique group). "
            f"Aggregations will simply mirror individual row values."
        )

    # Temporary series for transformation
    temp_df = pd.DataFrame({group_by_col: group_series, target_col: target_series})
    
    if agg_func == AggregationFunctionEnum.MEAN.value:
        result = temp_df.groupby(group_by_col)[target_col].transform("mean")
        formula = f"mean({target_col} | {group_by_col})"
    elif agg_func == AggregationFunctionEnum.SUM.value:
        result = temp_df.groupby(group_by_col)[target_col].transform("sum")
        formula = f"sum({target_col} | {group_by_col})"
    elif agg_func == AggregationFunctionEnum.MEDIAN.value:
        result = temp_df.groupby(group_by_col)[target_col].transform("median")
        formula = f"median({target_col} | {group_by_col})"
    elif agg_func == AggregationFunctionEnum.MIN.value:
        result = temp_df.groupby(group_by_col)[target_col].transform("min")
        formula = f"min({target_col} | {group_by_col})"
    elif agg_func == AggregationFunctionEnum.MAX.value:
        result = temp_df.groupby(group_by_col)[target_col].transform("max")
        formula = f"max({target_col} | {group_by_col})"
    elif agg_func == AggregationFunctionEnum.COUNT.value:
        result = temp_df.groupby(group_by_col)[target_col].transform("count")
        formula = f"count({target_col} | {group_by_col})"
    elif agg_func == AggregationFunctionEnum.STD.value:
        result = temp_df.groupby(group_by_col)[target_col].transform("std").fillna(0.0)
        formula = f"std({target_col} | {group_by_col})"
    else:
        raise ValueError(f"Unsupported aggregation function: '{agg_func}'")

    step_steps = [
        f"1. Group records by entity column '{group_by_col}' ({unique_groups} distinct categories)",
        f"2. Compute '{agg_func}' statistical summary of '{target_col}' within each partition",
        f"3. Broadcast summary metric back to every row belonging to each group."
    ]

    return result, formula, step_steps, warnings
