"""API routes package."""
from app.api.routes.datasets import router as datasets_router
from app.api.routes.cleaning import router as cleaning_router
from app.api.routes.education import router as education_router
from app.api.routes.outliers import router as outliers_router

__all__ = [
    "datasets_router",
    "cleaning_router",
    "education_router",
    "outliers_router"
]
