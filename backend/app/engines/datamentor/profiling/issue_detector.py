import pandas as pd
from typing import List, Dict, Any
import uuid
try:
    from app.profiling.config import profiling_config
except ImportError:
    from backend.app.profiling.config import profiling_config

def detect_issues(df: pd.DataFrame, dataset_profile: Dict[str, Any], column_profiles: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Detects issues at both dataset and column level."""
    issues = []
    
    # Dataset level issues
    if dataset_profile.get("duplicate_row_count", 0) > 0:
        issues.append({
            "issue_id": str(uuid.uuid4()),
            "issue_type": "duplicate_rows",
            "column": None,
            "severity": "moderate",
            "evidence": {
                "duplicate_count": dataset_profile["duplicate_row_count"],
                "duplicate_percentage": dataset_profile["duplicate_percentage"]
            },
            "explanation": "The dataset contains duplicate rows, which means some records are identical to others.",
            "recommended_next_step": "Review and consider dropping duplicates if they represent accidental multiple entries."
        })
        
    # Column level issues
    for col_name, profile in column_profiles.items():
        # Missing values
        missing_pct = profile.get("missing_percentage", 0)
        if missing_pct > 0:
            if missing_pct <= profiling_config.MISSING_LOW_THRESHOLD_PCT:
                severity = "low"
            elif missing_pct <= profiling_config.MISSING_MODERATE_THRESHOLD_PCT:
                severity = "moderate"
            else:
                severity = "high"
                
            issues.append({
                "issue_id": str(uuid.uuid4()),
                "issue_type": "missing_values",
                "column": col_name,
                "severity": severity,
                "evidence": {
                    "missing_count": profile["missing_count"],
                    "missing_percentage": missing_pct
                },
                "explanation": f"The '{col_name}' column contains missing values. A missing value means that a record does not contain a value for this column.",
                "recommended_next_step": "Evaluate an appropriate missing-value strategy (e.g., imputation or dropping)."
            })
            
        # Constant / Near-Constant
        if profile.get("unique_count") == 1 and profile.get("missing_percentage", 100) < 100:
            issues.append({
                "issue_id": str(uuid.uuid4()),
                "issue_type": "constant_column",
                "column": col_name,
                "severity": "informational",
                "evidence": {
                    "unique_count": 1
                },
                "explanation": f"The '{col_name}' column contains only a single unique value across all rows.",
                "recommended_next_step": "Consider removing this column as it provides no variance for machine learning models."
            })
        elif "categorical_profile" in profile:
            cat_prof = profile["categorical_profile"]
            if cat_prof.get("most_frequent_value_count", 0) > 0:
                dominance = (cat_prof["most_frequent_value_count"] / cat_prof["count"]) * 100
                if dominance >= profiling_config.NEAR_CONSTANT_DOMINANCE_PCT and profile.get("unique_count") > 1:
                    issues.append({
                        "issue_id": str(uuid.uuid4()),
                        "issue_type": "near_constant_column",
                        "column": col_name,
                        "severity": "low",
                        "evidence": {
                            "dominant_value": cat_prof["most_frequent_value"],
                            "dominance_percentage": dominance
                        },
                        "explanation": f"The '{col_name}' column is dominated by a single value '{cat_prof['most_frequent_value']}' ({dominance:.1f}%).",
                        "recommended_next_step": "Evaluate if this column is useful or if it should be removed due to low variance."
                    })
                    
        # Skewness
        if "numerical_profile" in profile and profile["numerical_profile"].get("skewness") is not None:
            skew = abs(profile["numerical_profile"]["skewness"])
            if skew >= profiling_config.SKEWNESS_MODERATE_THRESHOLD:
                severity = "high" if skew >= profiling_config.SKEWNESS_HIGH_THRESHOLD else "moderate"
                issues.append({
                    "issue_id": str(uuid.uuid4()),
                    "issue_type": "high_skewness",
                    "column": col_name,
                    "severity": severity,
                    "evidence": {
                        "skewness": profile["numerical_profile"]["skewness"]
                    },
                    "explanation": f"The '{col_name}' column is highly skewed. The data distribution is asymmetrical.",
                    "recommended_next_step": "Consider applying a log or power transformation to normalize the distribution."
                })
                
        # Identifier
        if profile.get("semantic_type") == "identifier":
             issues.append({
                "issue_id": str(uuid.uuid4()),
                "issue_type": "potential_identifier",
                "column": col_name,
                "severity": "informational",
                "evidence": profile.get("identifier_profile", {}),
                "explanation": f"The '{col_name}' column appears to be an identifier (like an ID or UUID).",
                "recommended_next_step": "Identifiers are usually not helpful for machine learning and should be excluded from training."
            })
             
    return issues
