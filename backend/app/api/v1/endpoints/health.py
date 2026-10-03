from datetime import datetime
from fastapi import APIRouter, status
from app.core.config import settings
from app.models.health import HealthCheckResponse

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthCheckResponse,
    status_code=status.HTTP_200_OK,
    summary="Application Health Check",
    description="Returns the current operational status, environment, and metadata for DataMentor AI backend."
)
async def health_check() -> HealthCheckResponse:
    """Return system operational status and metadata."""
    return HealthCheckResponse(
        status="healthy",
        app_name=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        timestamp=datetime.utcnow()
    )
