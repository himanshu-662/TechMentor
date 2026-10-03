"""Re-export PredictionHelper from menti_ai for rag package compatibility."""
from app.engines.menti_ai.prediction_helper import PredictionHelper

__all__ = ["PredictionHelper"]
