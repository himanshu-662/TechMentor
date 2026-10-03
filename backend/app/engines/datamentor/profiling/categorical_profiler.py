import pandas as pd
from typing import Dict, Any
try:
    from app.profiling.config import profiling_config
except ImportError:
    from backend.app.profiling.config import profiling_config

def profile_categorical_column(series: pd.Series) -> Dict[str, Any]:
    """Profiles a categorical column."""
    count = len(series)
    missing_count = int(series.isna().sum())
    missing_percentage = (missing_count / count * 100) if count > 0 else 0.0
    
    valid_data = series.dropna()
    unique_count = int(valid_data.nunique())
    unique_percentage = (unique_count / count * 100) if count > 0 else 0.0
    
    if len(valid_data) == 0:
        return {
            "count": count,
            "missing_count": missing_count,
            "missing_percentage": missing_percentage,
            "unique_count": 0,
            "unique_percentage": 0.0,
            "most_frequent_value": None,
            "most_frequent_value_count": 0,
            "top_categories": []
        }

    value_counts = valid_data.value_counts()
    most_frequent_value = str(value_counts.index[0])
    most_frequent_value_count = int(value_counts.iloc[0])
    
    top_categories_limit = profiling_config.TOP_CATEGORIES_LIMIT
    top_categories_series = value_counts.head(top_categories_limit)
    
    top_categories = [{"category": str(k), "count": int(v)} for k, v in top_categories_series.items()]

    return {
        "count": count,
        "missing_count": missing_count,
        "missing_percentage": missing_percentage,
        "unique_count": unique_count,
        "unique_percentage": unique_percentage,
        "most_frequent_value": most_frequent_value,
        "most_frequent_value_count": most_frequent_value_count,
        "top_categories": top_categories
    }
