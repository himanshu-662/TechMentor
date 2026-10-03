from typing import List
from pydantic import BaseModel


class ProfilingConfig(BaseModel):
    """Configuration thresholds and parameters for automated profiling."""
    
    # Missing value severity thresholds (in percent)
    MISSING_LOW_THRESHOLD_PCT: float = 5.0
    MISSING_MODERATE_THRESHOLD_PCT: float = 20.0
    
    # Dominance threshold for near-constant columns (in percent)
    NEAR_CONSTANT_DOMINANCE_PCT: float = 95.0
    
    # Skewness thresholds (absolute value)
    SKEWNESS_MODERATE_THRESHOLD: float = 1.0
    SKEWNESS_HIGH_THRESHOLD: float = 2.0
    
    # Categorical profiling
    TOP_CATEGORIES_LIMIT: int = 10
    MAX_CATEGORICAL_UNIQUE_COUNT: int = 25
    MAX_CATEGORICAL_UNIQUE_RATIO: float = 0.05
    
    # Datetime detection
    DATETIME_NAME_HINTS: List[str] = [
        "date", "time", "timestamp", "year", "month", "day",
        "created", "updated", "dob", "birth", "joined", "start", "end"
    ]
    DATETIME_SAMPLE_SIZE: int = 100
    DATETIME_PARSE_THRESHOLD: float = 0.8
    
    # Identifier detection
    IDENTIFIER_UNIQUENESS_THRESHOLD: float = 0.95
    IDENTIFIER_NAME_PATTERNS: List[str] = [
        "id", "user_id", "customer_id", "student_id", "transaction_id",
        "uuid", "guid", "code", "account_id", "client_id", "order_id"
    ]


profiling_config = ProfilingConfig()
