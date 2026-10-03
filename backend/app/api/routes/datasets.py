from typing import List
from fastapi import APIRouter, UploadFile, File, status, HTTPException
from app.models.dataset import DatasetUploadResponse, DatasetSummary
from app.services.ingestion_service import ingestion_service

router = APIRouter(prefix="/datasets", tags=["Dataset Ingestion"])


@router.get(
    "",
    response_model=List[DatasetSummary],
    status_code=status.HTTP_200_OK,
    summary="List stored dataset history",
    description="Returns all previously uploaded and stored datasets with row/column counts, sizes, and upload timestamps."
)
async def list_datasets() -> List[DatasetSummary]:
    """List all stored datasets for file history and quick switching."""
    return ingestion_service.list_all_datasets()
@router.delete(
    "",
    status_code=status.HTTP_200_OK,
    summary="Clear all stored datasets",
    description="Deletes all datasets, sessions, and files from disk storage."
)
async def clear_all_datasets():
    """Clear all stored datasets from storage."""
    deleted_count = ingestion_service.clear_all_datasets()
    return {"status": "success", "message": f"Successfully cleared {deleted_count} dataset items from storage."}



@router.post(
    "/upload",
    response_model=DatasetUploadResponse,
    status_code=status.HTTP_200_OK,
    summary="Upload and ingest a raw dataset",
    description="Accepts CSV, XLSX, or XLS files up to 50MB. Validates structure, extracts basic metadata, detected data types, and first 10 rows preview."
)
async def upload_dataset(
    file: UploadFile = File(..., description="Dataset file in CSV, XLSX, or XLS format")
) -> DatasetUploadResponse:
    """
    Ingest a raw dataset file:
    - Validates file type and size (<=50MB)
    - Generates a secure unique dataset ID
    - Safely parses with Pandas
    - Extracts row/column counts, column names, detected data types, and 10-row preview
    """
    return await ingestion_service.process_dataset_upload(file)


@router.get(
    "/{dataset_id}/profile",
    status_code=status.HTTP_200_OK,
    summary="Get complete dataset profile"
)
async def get_dataset_profile(dataset_id: str):
    """
    Returns automated dataset profiling including numerical, categorical stats, issues, etc.
    """
    from app.core.config import settings
    from pathlib import Path
    import glob
    from fastapi import HTTPException
    from app.services.ingestion_service import IngestionService
    from app.services.profiling_service import profile_dataset

    # Find the dataset file
    pattern = str(settings.STORAGE_DIR / f"{dataset_id}.*")
    matches = glob.glob(pattern)
    
    if not matches:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    file_path = Path(matches[0])
    extension = file_path.suffix[1:]
    
    try:
        df = IngestionService.read_dataset_to_dataframe(file_path, extension)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    # TODO: Add caching here later
    profile = profile_dataset(df)
    
    return profile


@router.get(
    "/{dataset_id}",
    response_model=DatasetUploadResponse,
    status_code=status.HTTP_200_OK,
    summary="Get dataset details and preview",
    description="Returns metadata, column types, and first 10 preview rows of a stored dataset."
)
async def get_dataset(dataset_id: str) -> DatasetUploadResponse:
    """Retrieve full metadata and preview for a stored dataset by ID."""
    return ingestion_service.get_dataset_details(dataset_id)


@router.delete(
    "/{dataset_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete stored dataset",
    description="Deletes a dataset and its versions from disk storage."
)
async def delete_dataset(dataset_id: str):
    """Permanently delete a dataset and its session from storage."""
    success = ingestion_service.delete_dataset(dataset_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with ID '{dataset_id}' not found."
        )
    return {"status": "success", "message": f"Dataset {dataset_id} deleted successfully."}

