import pandas as pd
from typing import Dict, Any, Tuple
try:
    from app.profiling.config import profiling_config
except ImportError:
    from backend.app.profiling.config import profiling_config

def detect_datetime_column(series: pd.Series, col_name: str) -> Dict[str, Any]:
    """Detects if a column is likely a datetime column."""
    
    if pd.api.types.is_datetime64_any_dtype(series):
        valid_data = series.dropna()
        return _build_datetime_response(True, valid_data)
        
    # Check heuristics
    name_hint = any(hint in col_name.lower() for hint in profiling_config.DATETIME_NAME_HINTS)
    
    # If not a string or object type, unlikely to be parsed as datetime (unless it's int timestamps, but let's stick to string formats for now or rely on pandas to_datetime)
    if not pd.api.types.is_object_dtype(series) and not pd.api.types.is_string_dtype(series):
        return _build_datetime_response(False, pd.Series(dtype='object'))

    valid_data = series.dropna()
    if len(valid_data) == 0:
        return _build_datetime_response(False, pd.Series(dtype='object'))
        
    sample = valid_data.sample(min(len(valid_data), profiling_config.DATETIME_SAMPLE_SIZE))
    
    # Try parsing sample
    parsed_sample = pd.to_datetime(sample, errors='coerce')
    parseable_count = parsed_sample.notna().sum()
    parse_ratio = parseable_count / len(sample)
    
    if parse_ratio >= profiling_config.DATETIME_PARSE_THRESHOLD or (name_hint and parse_ratio > 0.5):
        # We consider it a datetime column. Let's parse the whole valid data to get min/max
        parsed_full = pd.to_datetime(valid_data, errors='coerce').dropna()
        return _build_datetime_response(True, parsed_full)
        
    return _build_datetime_response(False, pd.Series(dtype='object'))


def _build_datetime_response(is_datetime: bool, parsed_series: pd.Series) -> Dict[str, Any]:
    if not is_datetime or len(parsed_series) == 0:
        return {
            "detected_datetime_status": False,
            "minimum_date": None,
            "maximum_date": None,
            "unique_date_count": 0
        }
        
    return {
        "detected_datetime_status": True,
        "minimum_date": parsed_series.min().isoformat(),
        "maximum_date": parsed_series.max().isoformat(),
        "unique_date_count": int(parsed_series.nunique())
    }
