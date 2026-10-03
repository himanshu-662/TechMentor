"""Date & Time feature generator (Decomposition, Cyclical encoding, Date difference)."""
from typing import Dict, Any, Tuple, List
import numpy as np
import pandas as pd
from app.feature_engineering.models import DatePartEnum, CyclicalPeriodEnum, DateUnitEnum


def generate_datetime_parts_feature(
    df: pd.DataFrame,
    params: Dict[str, Any]
) -> Tuple[pd.Series, str, List[str], List[str]]:
    """
    Extract calendar/clock component from a datetime column.
    
    Returns:
        (result_series, formula_human_readable, step_by_step_calculation, warnings)
    """
    col = params.get("datetime_column") or params.get("column_a")
    part = params.get("part", DatePartEnum.YEAR.value).lower()
    
    if not col or col not in df.columns:
        raise ValueError(f"Datetime column '{col}' does not exist in dataset.")

    dt_series = pd.to_datetime(df[col], errors="coerce")
    null_count = int(dt_series.isna().sum())
    warnings: List[str] = []
    if null_count > 0:
        warnings.append(f"Could not parse datetime in {null_count} rows (set to NaN).")

    if part == DatePartEnum.YEAR.value:
        result = dt_series.dt.year
        formula = f"year({col})"
        desc = "Extracted 4-digit calendar year (e.g. 2026)"
    elif part == DatePartEnum.MONTH.value:
        result = dt_series.dt.month
        formula = f"month({col})"
        desc = "Extracted calendar month index (1 to 12)"
    elif part == DatePartEnum.DAY.value:
        result = dt_series.dt.day
        formula = f"day({col})"
        desc = "Extracted day of the month (1 to 31)"
    elif part == DatePartEnum.WEEKDAY.value:
        result = dt_series.dt.weekday
        formula = f"weekday({col})"
        desc = "Extracted day of week (0=Monday, 6=Sunday)"
    elif part == DatePartEnum.DAY_OF_YEAR.value:
        result = dt_series.dt.dayofyear
        formula = f"day_of_year({col})"
        desc = "Extracted ordinal day of the year (1 to 366)"
    elif part == DatePartEnum.WEEK_OF_YEAR.value:
        result = dt_series.dt.isocalendar().week.astype(float)
        formula = f"week_of_year({col})"
        desc = "Extracted ISO week of the year (1 to 53)"
    elif part == DatePartEnum.QUARTER.value:
        result = dt_series.dt.quarter
        formula = f"quarter({col})"
        desc = "Extracted fiscal/calendar quarter (1 to 4)"
    elif part == DatePartEnum.HOUR.value:
        result = dt_series.dt.hour
        formula = f"hour({col})"
        desc = "Extracted hour of day (0 to 23)"
    elif part == DatePartEnum.MINUTE.value:
        result = dt_series.dt.minute
        formula = f"minute({col})"
        desc = "Extracted minute of hour (0 to 59)"
    elif part == DatePartEnum.SECOND.value:
        result = dt_series.dt.second
        formula = f"second({col})"
        desc = "Extracted second of minute (0 to 59)"
    elif part == DatePartEnum.IS_WEEKEND.value:
        result = (dt_series.dt.weekday >= 5).astype(int)
        formula = f"is_weekend({col})"
        desc = "Extracted binary weekend flag (1 if Saturday/Sunday, else 0)"
    else:
        raise ValueError(f"Unsupported date part: '{part}'")

    step_steps = [
        f"1. Parse '{col}' into ISO-8601 timestamps",
        f"2. {desc}",
        f"3. Return extracted discrete temporal feature."
    ]

    return result, formula, step_steps, warnings


def generate_cyclical_feature(
    df: pd.DataFrame,
    params: Dict[str, Any]
) -> Tuple[pd.Series, str, List[str], List[str]]:
    """
    Generate cyclical sine/cosine transformation of a periodic temporal feature.
    
    Returns:
        (result_series, formula_human_readable, step_by_step_calculation, warnings)
    """
    col = params.get("datetime_column") or params.get("column_a")
    period_type = params.get("period_type", CyclicalPeriodEnum.HOUR_24.value).lower()
    harmonic = params.get("harmonic", "sin").lower()  # "sin" or "cos"
    custom_period = params.get("custom_period")
    
    if not col or col not in df.columns:
        raise ValueError(f"Column '{col}' does not exist in dataset.")

    dt_series = pd.to_datetime(df[col], errors="coerce")
    warnings: List[str] = []
    
    if period_type == CyclicalPeriodEnum.HOUR_24.value:
        raw_vals = dt_series.dt.hour + (dt_series.dt.minute / 60.0)
        period = 24.0
        period_label = "24-Hour Day"
    elif period_type == CyclicalPeriodEnum.MONTH_12.value:
        raw_vals = dt_series.dt.month - 1  # 0 to 11
        period = 12.0
        period_label = "12-Month Year"
    elif period_type == CyclicalPeriodEnum.WEEKDAY_7.value:
        raw_vals = dt_series.dt.weekday  # 0 to 6
        period = 7.0
        period_label = "7-Day Week"
    elif period_type == CyclicalPeriodEnum.DAY_OF_YEAR_365.value:
        raw_vals = dt_series.dt.dayofyear - 1
        period = 365.25
        period_label = "365-Day Year"
    elif custom_period:
        # Numeric column directly
        raw_vals = pd.to_numeric(df[col], errors="coerce")
        period = float(custom_period)
        period_label = f"Custom Period ({period})"
    else:
        # Fallback to numeric
        raw_vals = pd.to_numeric(df[col], errors="coerce")
        period = 24.0
        period_label = "24-Hour Cycle"

    radians = 2.0 * np.pi * raw_vals / period
    
    if harmonic == "cos":
        result = np.cos(radians)
        formula = f"cos(2π × {col} / {period})"
    else:
        result = np.sin(radians)
        formula = f"sin(2π × {col} / {period})"

    step_steps = [
        f"1. Extract continuous temporal position for {period_label} from '{col}'",
        f"2. Convert cyclical range [0, {period}) to radians: θ = 2π × val / {period}",
        f"3. Compute trigonometric coordinate {harmonic}(θ) embedding on unit circle [-1, +1]."
    ]

    return result, formula, step_steps, warnings


def generate_date_difference_feature(
    df: pd.DataFrame,
    params: Dict[str, Any]
) -> Tuple[pd.Series, str, List[str], List[str]]:
    """
    Compute elapsed duration between two datetime columns: (End_Date - Start_Date).
    
    Returns:
        (result_series, formula_human_readable, step_by_step_calculation, warnings)
    """
    start_col = params.get("start_datetime_column") or params.get("column_a")
    end_col = params.get("end_datetime_column") or params.get("column_b")
    unit = params.get("unit", DateUnitEnum.DAYS.value).lower()
    
    if not start_col or start_col not in df.columns:
        raise ValueError(f"Start datetime column '{start_col}' does not exist in dataset.")
    if not end_col or end_col not in df.columns:
        raise ValueError(f"End datetime column '{end_col}' does not exist in dataset.")

    dt_start = pd.to_datetime(df[start_col], errors="coerce")
    dt_end = pd.to_datetime(df[end_col], errors="coerce")
    
    time_delta = dt_end - dt_start
    warnings: List[str] = []
    
    if unit == DateUnitEnum.HOURS.value:
        result = time_delta.dt.total_seconds() / 3600.0
        formula = f"({end_col} - {start_col}) [Hours]"
    elif unit == DateUnitEnum.MINUTES.value:
        result = time_delta.dt.total_seconds() / 60.0
        formula = f"({end_col} - {start_col}) [Minutes]"
    elif unit == DateUnitEnum.SECONDS.value:
        result = time_delta.dt.total_seconds()
        formula = f"({end_col} - {start_col}) [Seconds]"
    else:  # Days
        result = time_delta.dt.total_seconds() / 86400.0
        formula = f"({end_col} - {start_col}) [Days]"

    neg_mask = result < 0
    neg_count = int(neg_mask.sum())
    if neg_count > 0:
        warnings.append(
            f"Detected {neg_count} negative elapsed duration values where '{end_col}' occurs before '{start_col}'. "
            f"Check for swapped columns or timezone anomalies."
        )

    step_steps = [
        f"1. Parse start timestamp '{start_col}' and end timestamp '{end_col}'",
        f"2. Compute time interval Δt = [{end_col}] - [{start_col}]",
        f"3. Normalize total interval duration into '{unit}'.",
        f"4. Output continuous elapsed duration metric."
    ]

    return result, formula, step_steps, warnings
