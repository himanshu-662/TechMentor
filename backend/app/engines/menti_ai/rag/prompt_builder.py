"""Re-export PromptBuilder from menti_ai for rag package compatibility."""
from app.engines.menti_ai.prompt_builder import PromptBuilder

__all__ = ["PromptBuilder"]
