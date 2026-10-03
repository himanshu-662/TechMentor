from datetime import datetime
from pydantic import BaseModel, Field


class HealthCheckResponse(BaseModel):
    """Schema for application health check response."""
    status: str = Field(default="healthy", description="Overall health status")
    app_name: str = Field(description="Name of the application")
    version: str = Field(description="Application version")
    environment: str = Field(description="Current deployment environment")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="UTC timestamp of the check")
