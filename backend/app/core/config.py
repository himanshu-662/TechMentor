from typing import List, Set, Optional
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings and environment configuration."""
    
    PROJECT_NAME: str = "DataMentor AI"
    PROJECT_DESCRIPTION: str = (
        "AI-powered Data Preparation and Learning Platform with explainable operations"
    )
    VERSION: str = "0.2.0"
    API_V1_STR: str = "/api/v1"
    
    # CORS Origins (default permits standard local frontend dev servers)
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Storage & Upload Security Configuration
    MAX_UPLOAD_SIZE_BYTES: int = 50 * 1024 * 1024  # 50 MB
    ALLOWED_EXTENSIONS: Set[str] = {"csv", "xlsx", "xls"}
    STORAGE_DIR: Path = Path(__file__).resolve().parent.parent.parent / "storage" / "uploads"

    # LLM & RAG Configuration (Google Gemini)
    GEMINI_API_KEY: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-flash-latest-lite"
    EMBEDDING_PROVIDER: str = "local"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
# Ensure upload directory exists
settings.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
