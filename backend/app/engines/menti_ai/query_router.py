"""Menti.ai Socratic Engine: Query Router.
Classifies student and developer intents (Concept, Math, What-If, Prediction, Dataset).
"""
import re
from typing import Optional, Dict, Any
from app.engines.menti_ai.rag.models.rag_models import QueryTypeEnum


class QueryRouter:
    """Classifies user queries into routing categories for Menti.ai Socratic mentoring."""

    DATASET_PATTERNS = [
        r'\b(my|this|the)\s+dataset\b',
        r'\b(how\s+many\s+rows|columns|features|records)\b',
        r'\b(missing\s+values?|nulls?|nans?)\s+in\s+my\b',
        r'\btarget\s+variable\b',
        r'\bdataset\s+(shape|size|distribution)\b'
    ]

    PROCESSING_PATTERNS = [
        r'\bwhy\s+did\s+(you|we|datamentor)\s+(remove|impute|clean|drop|transform)\b',
        r'\bwhy\s+were\s+\d+\s+rows\s+removed\b',
        r'\boutlier\s+treatment\b',
        r'\bscaling\s+applied\b',
        r'\bcleaning\s+step\b'
    ]

    VALIDATION_PATTERNS = [
        r'\bvalidation\s+(warning|error|check|rule)\b',
        r'\bdata\s+leakage\s+warning\b',
        r'\bdrift\s+detected\b',
        r'\bmulticollinearity\s+warning\b'
    ]

    TRAINING_PATTERNS = [
        r'\b(hyperparameters?|estimator|model\s+fitted|training\s+time|iterations)\b',
        r'\bwhy\s+choose\s+(random\s+forest|logistic|xgboost)\b',
        r'\btrain\s+test\s+split\s+ratio\b'
    ]

    EVALUATION_PATTERNS = [
        r'\bwhat\s+is\s+my\s+(accuracy|f1|precision|recall|rmse|mae|r2|roc|auc)\b',
        r'\bconfusion\s+matrix\s+(for\s+my|results)\b',
        r'\bwhy\s+is\s+my\s+(f1|precision|recall|accuracy|loss)\b'
    ]

    PREDICTION_PATTERNS = [
        r'\bpredict\b',
        r'\bprediction\b',
        r'\bwhat\s+(is|would\s+be|will\s+be)\s+the\s+prediction\b',
        r'\bwhat\s+would\s+the\s+model\s+predict\b',
        r'\bwhat\s+will\s+(my\s+)?model\s+predict\b',
        r'\bclassify\s+(this|the|an\s+instance|input)\b',
        r'\bwhat\s+if\s+\w+\s*(=|:|\bis\b)',
        r'\bpredict\s+(the\s+)?(output|target|label|result|class|value)\b',
        r'\b(output|prediction)\s+for\s+\w+\s*(=|:|\bis\b)',
        r'\{[\s\S]*:[\s\S]*\}'
    ]

    MIXED_PATTERNS = [
        r'\bwhy\s+is\s+my\s+\w+\s+(low|high|bad|poor|0\.\d+|\d+%)\b',
        r'\bwhy\s+does\s+my\s+model\s+(overfit|underfit|fail|perform\s+poorly)\b',
        r'\bhow\s+can\s+I\s+improve\s+my\s+model\b',
        r'\bwhy\s+is\s+training\s+accuracy\s+higher\s+than\s+test\b',
        r'\bwhy\s+is\s+my\s+recall\s+\d+(\.\d+)?\b'
    ]

    @classmethod
    def route_query(
        cls,
        question: str,
        has_dataset_context: bool = False,
        has_model_context: bool = False
    ) -> QueryTypeEnum:
        """Determine the QueryTypeEnum based on regex heuristics and runtime context."""
        q = question.lower().strip()

        # Check Prediction queries (e.g. predict for age=25, what will model predict, what-if)
        for pat in cls.PREDICTION_PATTERNS:
            if re.search(pat, q):
                return QueryTypeEnum.PREDICTION

        # Check Mixed first
        for pat in cls.MIXED_PATTERNS:
            if re.search(pat, q):
                return QueryTypeEnum.MIXED

        # Check Evaluation
        for pat in cls.EVALUATION_PATTERNS:
            if re.search(pat, q):
                return QueryTypeEnum.MIXED if (has_model_context or has_dataset_context) else QueryTypeEnum.EVALUATION

        # Check Processing
        for pat in cls.PROCESSING_PATTERNS:
            if re.search(pat, q):
                return QueryTypeEnum.PROCESSING

        # Check Validation
        for pat in cls.VALIDATION_PATTERNS:
            if re.search(pat, q):
                return QueryTypeEnum.VALIDATION

        # Check Training
        for pat in cls.TRAINING_PATTERNS:
            if re.search(pat, q):
                return QueryTypeEnum.TRAINING

        # Check Dataset
        for pat in cls.DATASET_PATTERNS:
            if re.search(pat, q):
                return QueryTypeEnum.DATASET

        # If user explicitly references "my model" or "my dataset" with specific numbers/attributes
        if ("my model" in q or "my data" in q or "my score" in q) and (has_dataset_context or has_model_context):
            return QueryTypeEnum.MIXED

        # Default fallback is GENERAL_KNOWLEDGE
        return QueryTypeEnum.GENERAL_KNOWLEDGE


__all__ = ["QueryRouter"]
