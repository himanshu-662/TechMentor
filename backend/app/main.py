from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from app.core.config import settings
from app.api.v1.router import api_router
from app.api.routes.datasets import router as datasets_router
from app.api.routes.cleaning import router as cleaning_router
from app.api.routes.education import router as education_router
from app.api.routes.outliers import router as outliers_router
from app.api.routes.transformations import router as transformations_router
from app.api.routes.feature_engineering import router as feature_engineering_router
from app.api.routes.encoding import router as encoding_router
from app.api.routes.dimensionality import router as dimensionality_router
from app.api.routes.feature_selection import router as feature_selection_router
from app.api.routes.split import router as split_router, legacy_split_router
from app.api.routes.modeling import router as modeling_router, legacy_modeling_router
from app.api.routes.knowledge import router as knowledge_router
from app.api.routes.rag import router as rag_router
from app.models.health import HealthCheckResponse


def create_application() -> FastAPI:
    """Application factory for FastAPI backend."""
    app = FastAPI(
        title=settings.PROJECT_NAME,
        description=settings.PROJECT_DESCRIPTION,
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
    )

    # CORS configuration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Mount API routes under /api/v1
    app.include_router(api_router, prefix=settings.API_V1_STR)

    # Also mount domain routers directly under /api for clean REST routing
    app.include_router(datasets_router, prefix="/api")
    app.include_router(cleaning_router, prefix="/api")
    app.include_router(education_router, prefix="/api")
    app.include_router(outliers_router, prefix="/api")
    app.include_router(encoding_router, prefix="/api")
    app.include_router(transformations_router, prefix="/api")
    app.include_router(feature_engineering_router, prefix="/api")
    app.include_router(dimensionality_router, prefix="/api")
    app.include_router(feature_selection_router, prefix="/api")
    app.include_router(split_router, prefix="/api")
    app.include_router(legacy_split_router, prefix="/api")
    app.include_router(modeling_router, prefix="/api")
    app.include_router(legacy_modeling_router, prefix="/api")
    app.include_router(knowledge_router, prefix="/api")
    app.include_router(rag_router, prefix="/api")

    # Health check aliases
    @app.get(
        "/health",
        response_model=HealthCheckResponse,
        tags=["System"],
        summary="Root Health Check",
        include_in_schema=True
    )
    @app.get(
        "/api/health",
        response_model=HealthCheckResponse,
        tags=["System"],
        summary="API Health Check",
        include_in_schema=False
    )
    async def root_health_check() -> HealthCheckResponse:
        return HealthCheckResponse(
            status="healthy",
            app_name=settings.PROJECT_NAME,
            version="0.8.0",
            environment=settings.ENVIRONMENT,
            timestamp=datetime.utcnow()
        )

    @app.get("/", tags=["System"], summary="API Root")
    async def root():
        return {
            "app": settings.PROJECT_NAME,
            "version": "0.8.0",
            "phase": "Phase 8 - Feature Engineering Engine",
            "status": "online",
            "docs": "/docs",
            "health": f"{settings.API_V1_STR}/health",
            "upload_endpoint": "/api/datasets/upload",
            "message": "Welcome to DataMentor AI API. Learning-first data preparation engine."
        }

    return app


app = create_application()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
