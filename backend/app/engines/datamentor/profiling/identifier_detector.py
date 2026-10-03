import pandas as pd
from typing import Dict, Any
try:
    from app.profiling.config import profiling_config
except ImportError:
    from backend.app.profiling.config import profiling_config

def detect_identifier_column(series: pd.Series, col_name: str) -> Dict[str, Any]:
    """Detects if a column is likely an identifier column."""
    
    valid_data = series.dropna()
    if len(valid_data) == 0:
        return {
            "detected_identifier_status": False,
            "detection_reasons": [],
            "confidence_level": "low"
        }
        
    unique_count = valid_data.nunique()
    uniqueness_ratio = unique_count / len(valid_data)
    
    is_unique = uniqueness_ratio >= profiling_config.IDENTIFIER_UNIQUENESS_THRESHOLD
    has_name_hint = any(hint == col_name.lower() or col_name.lower().endswith(f"_{hint}") for hint in profiling_config.IDENTIFIER_NAME_PATTERNS)
    
    reasons = []
    confidence = "low"
    
    if is_unique:
        reasons.append(f"High uniqueness ratio ({uniqueness_ratio*100:.1f}%)")
    if has_name_hint:
        reasons.append(f"Column name suggests an identifier")
        
    if is_unique and has_name_hint:
        confidence = "high"
        status = True
    elif is_unique and (pd.api.types.is_string_dtype(series) or pd.api.types.is_object_dtype(series)):
        confidence = "medium"
        status = True # High uniqueness strings are often IDs
    elif is_unique and pd.api.types.is_integer_dtype(series):
        # Could be an auto-increment ID or just continuous numbers
        confidence = "medium"
        status = True
    elif has_name_hint and uniqueness_ratio > 0.5:
        # e.g., customer_id in a transactional dataset with some repeats
        confidence = "low"
        status = True
    else:
        status = False
        
    return {
        "detected_identifier_status": status,
        "detection_reasons": reasons,
        "confidence_level": confidence
    }
