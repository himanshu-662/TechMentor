"""Re-export QueryRouter from menti_ai for rag package compatibility."""
from app.engines.menti_ai.query_router import QueryRouter

__all__ = ["QueryRouter"]
