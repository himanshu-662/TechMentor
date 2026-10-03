from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class ColumnMetadata(BaseModel):
    """Schema representing basic column information from initial ingestion."""
    name: str = Field(description="Column name")
    data_type: str = Field(description="Detected Pandas / NumPy data type")
    null_count: int = Field(default=0, description="Number of null / NaN values in the column")
    sample_values: List[Any] = Field(default_factory=list, description="Sample non-null values for inspection")


class DatasetUploadResponse(BaseModel):
    """
    Structured response returned after raw dataset upload and initial ingestion.
    Contains basic metadata, detected data types, and first 10 rows preview.
    """
    dataset_id: str = Field(description="Server-generated unique safe identifier")
    filename: str = Field(description="Sanitized original filename")
    file_type: str = Field(description="Detected extension / format (csv, xlsx, xls)")
    file_size_bytes: int = Field(description="File size in bytes")
    file_size_formatted: str = Field(description="Human-readable file size (e.g. 1.25 MB)")
    row_count: int = Field(description="Total number of rows in the dataset")
    column_count: int = Field(description="Total number of columns in the dataset")
    column_names: List[str] = Field(description="List of column header names")
    detected_data_types: Dict[str, str] = Field(description="Map of column name to detected data type")
    columns: List[ColumnMetadata] = Field(default_factory=list, description="Detailed column metadata list")
    preview_rows: List[Dict[str, Any]] = Field(description="First 10 rows of the dataset as key-value objects")
    uploaded_at: datetime = Field(default_factory=datetime.utcnow, description="UTC upload timestamp")
    message: str = Field(default="Dataset uploaded and ingested successfully")


class DatasetSummary(BaseModel):
    """Minimal dataset summary model for listings."""
    dataset_id: str
    filename: str
    file_type: str
    file_size_formatted: str
    row_count: int
    column_count: int
    uploaded_at: datetime
    file_size_bytes: Optional[int] = None
    version_count: Optional[int] = 0

