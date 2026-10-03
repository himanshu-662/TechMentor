import pandas as pd
from typing import Dict, Any
try:
    from app.profiling.numerical_profiler import profile_numerical_column
    from app.profiling.categorical_profiler import profile_categorical_column
    from app.profiling.datetime_detector import detect_datetime_column
    from app.profiling.identifier_detector import detect_identifier_column
    from app.profiling.config import profiling_config
except ImportError:
    from backend.app.profiling.numerical_profiler import profile_numerical_column
    from backend.app.profiling.categorical_profiler import profile_categorical_column
    from backend.app.profiling.datetime_detector import detect_datetime_column
    from backend.app.profiling.identifier_detector import detect_identifier_column
    from backend.app.profiling.config import profiling_config

def determine_semantic_type(series: pd.Series, col_name: str) -> str:
    """Heuristically determines the semantic type of a column."""
    
    # Check identifier first
    id_det = detect_identifier_column(series, col_name)
    if id_det["detected_identifier_status"] and id_det["confidence_level"] == "high":
        return "identifier"
        
    # Check datetime
    dt_det = detect_datetime_column(series, col_name)
    if dt_det["detected_datetime_status"]:
        return "datetime"
        
    # Check boolean
    if pd.api.types.is_bool_dtype(series):
        return "boolean"
        
    valid_data = series.dropna()
    if len(valid_data) == 0:
        return "unknown"
        
    unique_count = valid_data.nunique()
    
    if unique_count == 2:
        return "boolean"
        
    if pd.api.types.is_numeric_dtype(series):
        # Could be numerical or categorical based on uniqueness and dtype
        if pd.api.types.is_integer_dtype(series):
            # If low cardinality, might be categorical
            if unique_count <= profiling_config.MAX_CATEGORICAL_UNIQUE_COUNT and (unique_count / len(valid_data)) <= profiling_config.MAX_CATEGORICAL_UNIQUE_RATIO:
                return "categorical"
        return "numerical"
        
    if pd.api.types.is_object_dtype(series) or pd.api.types.is_string_dtype(series):
        # Categorical vs Text
        if unique_count <= profiling_config.MAX_CATEGORICAL_UNIQUE_COUNT or (unique_count / len(valid_data)) <= profiling_config.MAX_CATEGORICAL_UNIQUE_RATIO:
            return "categorical"
        
        # If very high uniqueness and long strings, likely text
        avg_len = valid_data.astype(str).str.len().mean()
        if avg_len > 50:
            return "text"
            
        return "categorical" # Default for objects with some repetition
        
    return "unknown"


def profile_column(series: pd.Series, col_name: str) -> Dict[str, Any]:
    """Coordinates profiling for a single column."""
    
    count = len(series)
    missing_count = int(series.isna().sum())
    missing_percentage = (missing_count / count * 100) if count > 0 else 0.0
    unique_count = int(series.dropna().nunique())
    unique_percentage = (unique_count / count * 100) if count > 0 else 0.0
    
    pandas_dtype = str(series.dtype)
    semantic_type = determine_semantic_type(series, col_name)
    
    base_profile = {
        "column_name": col_name,
        "pandas_dtype": pandas_dtype,
        "semantic_type": semantic_type,
        "total_count": count,
        "missing_count": missing_count,
        "missing_percentage": missing_percentage,
        "unique_count": unique_count,
        "unique_percentage": unique_percentage
    }
    
    if semantic_type == "numerical":
        base_profile["numerical_profile"] = profile_numerical_column(series)
    elif semantic_type == "categorical" or semantic_type == "boolean":
        base_profile["categorical_profile"] = profile_categorical_column(series)
    elif semantic_type == "datetime":
        base_profile["datetime_profile"] = detect_datetime_column(series, col_name)
    elif semantic_type == "identifier":
        base_profile["identifier_profile"] = detect_identifier_column(series, col_name)
        
    return base_profile
