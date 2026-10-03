"""Binning & Discretization feature generator (Equal-width & Custom intervals)."""
from typing import Dict, Any, Tuple, List
import pandas as pd
from app.feature_engineering.models import BinningStrategyEnum


def generate_binning_feature(
    df: pd.DataFrame,
    params: Dict[str, Any]
) -> Tuple[pd.Series, str, List[str], List[str]]:
    """
    Discretize continuous numerical column into categorical bin intervals.
    
    Returns:
        (result_series, formula_human_readable, step_by_step_calculation, warnings)
    """
    col = params.get("source_column") or params.get("column_a")
    strategy = params.get("strategy", BinningStrategyEnum.EQUAL_WIDTH.value).lower()
    
    if not col or col not in df.columns:
        raise ValueError(f"Source column '{col}' does not exist in dataset.")

    series = pd.to_numeric(df[col], errors="coerce")
    warnings: List[str] = []
    
    if strategy == BinningStrategyEnum.EQUAL_WIDTH.value:
        num_bins = int(params.get("num_bins", 4))
        if num_bins < 2 or num_bins > 50:
            raise ValueError("Number of bins must be between 2 and 50.")
        
        labels = params.get("labels")
        if labels and len(labels) != num_bins:
            raise ValueError(f"Number of custom labels ({len(labels)}) does not match num_bins ({num_bins}).")
        
        binned = pd.cut(series, bins=num_bins, labels=labels if labels else False, include_lowest=True)
        if labels:
            result = binned.astype(str)
        else:
            # Generate readable bin interval strings
            binned_intervals = pd.cut(series, bins=num_bins, include_lowest=True)
            result = binned_intervals.astype(str)
            
        formula = f"equal_width_binning({col}, bins={num_bins})"
        step_steps = [
            f"1. Compute minimum ({series.min()}) and maximum ({series.max()}) of '{col}'",
            f"2. Partition continuous range into {num_bins} uniform equal-width intervals",
            f"3. Map each numeric observation into its discrete bucket interval."
        ]
        
    elif strategy == BinningStrategyEnum.CUSTOM_BINS.value:
        bin_edges = params.get("bin_edges")
        if not bin_edges or len(bin_edges) < 2:
            raise ValueError("Custom binning requires 'bin_edges' list with at least 2 boundary values.")
        
        sorted_edges = sorted([float(x) for x in bin_edges])
        labels = params.get("labels")
        if labels and len(labels) != (len(sorted_edges) - 1):
            raise ValueError(
                f"Number of custom labels ({len(labels)}) must equal number of intervals ({len(sorted_edges) - 1})."
            )
            
        # Check if values fall outside bin boundaries
        min_edge = sorted_edges[0]
        max_edge = sorted_edges[-1]
        out_of_bounds = (series < min_edge) | (series > max_edge)
        oob_count = int(out_of_bounds.sum())
        if oob_count > 0:
            warnings.append(
                f"{oob_count} values fall outside custom boundaries [{min_edge}, {max_edge}] and were assigned NaN."
            )
            
        binned_intervals = pd.cut(
            series,
            bins=sorted_edges,
            labels=labels if labels else False,
            include_lowest=True
        )
        if labels:
            result = binned_intervals.astype(str)
        else:
            binned_intervals_auto = pd.cut(series, bins=sorted_edges, include_lowest=True)
            result = binned_intervals_auto.astype(str)
            
        formula = f"custom_binning({col}, edges={sorted_edges})"
        step_steps = [
            f"1. Define custom threshold boundaries: {sorted_edges}",
            f"2. Check interval memberships for each row",
            f"3. Assign categorical threshold labels to each row."
        ]
    else:
        raise ValueError(f"Unsupported binning strategy: '{strategy}'")

    return result, formula, step_steps, warnings
