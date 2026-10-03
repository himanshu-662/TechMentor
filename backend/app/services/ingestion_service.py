import os
import re
import uuid
import math
import json
import shutil
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Tuple, Optional
import pandas as pd
import numpy as np
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings
from app.models.dataset import DatasetUploadResponse, ColumnMetadata, DatasetSummary

# Use numeric 413 or modern status attribute
HTTP_413_PAYLOAD_TOO_LARGE = getattr(status, "HTTP_413_CONTENT_TOO_LARGE", 413)


def format_file_size(size_bytes: int) -> str:
    """Format bytes into human-readable string (B, KB, MB, GB)."""
    if size_bytes == 0:
        return "0 B"
    size_names = ("B", "KB", "MB", "GB", "TB")
    i = int(math.floor(math.log(size_bytes, 1024)))
    p = math.pow(1024, i)
    s = round(size_bytes / p, 2)
    return f"{s} {size_names[i]}"


def sanitize_filename(filename: str) -> str:
    """Sanitize the uploaded file's original name for display purposes."""
    if not filename:
        return "dataset"
    clean_name = os.path.basename(filename)
    clean_name = re.sub(r'[^a-zA-Z0-9_\-\. ]', '_', clean_name).strip()
    return clean_name or "dataset"


def clean_row_value(val: Any) -> Any:
    """Convert pandas/numpy non-JSON-serializable types (NaN, NaT, Inf) to None/standard types."""
    if pd.isna(val) or val is pd.NaT:
        return None
    if isinstance(val, (np.floating, float)):
        if np.isneginf(val) or np.isposinf(val) or np.isnan(val):
            return None
        return float(val)
    if isinstance(val, (np.integer, int)):
        return int(val)
    if isinstance(val, (np.bool_, bool)):
        return bool(val)
    if isinstance(val, (pd.Timestamp, np.datetime64)):
        return str(val)
    return str(val) if not isinstance(val, (str, int, float, bool)) else val


class IngestionService:
    """Service handling dataset validation, storage, and initial structure extraction."""

    @staticmethod
    def validate_file_extension(filename: str) -> str:
        """Extract and validate file extension against supported types."""
        if not filename or "." not in filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File has no extension. Supported formats: .csv, .xlsx, .xls"
            )
        
        ext = filename.rsplit(".", 1)[-1].lower()
        if ext not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format '.{ext}'. Supported formats: {', '.join(sorted(settings.ALLOWED_EXTENSIONS))}"
            )
        return ext

    @classmethod
    async def save_and_validate_upload(cls, file: UploadFile) -> Tuple[str, Path, int, str, str]:
        """
        Stream upload safely, enforce 50MB limit, generate secure UUID, and save to storage.
        Returns: (dataset_id, saved_path, file_size, extension, sanitized_original_name)
        """
        original_name = file.filename or "dataset"
        sanitized_name = sanitize_filename(original_name)
        extension = cls.validate_file_extension(original_name)

        dataset_id = f"ds_{uuid.uuid4().hex}"
        safe_filename = f"{dataset_id}.{extension}"
        target_path = settings.STORAGE_DIR / safe_filename

        # Prevent directory traversal
        try:
            target_path.resolve().relative_to(settings.STORAGE_DIR.resolve())
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file path sequence detected."
            )

        total_bytes = 0
        chunk_size = 1024 * 1024  # 1MB chunks

        try:
            with open(target_path, "wb") as buffer:
                while True:
                    chunk = await file.read(chunk_size)
                    if not chunk:
                        break
                    total_bytes += len(chunk)

                    if total_bytes > settings.MAX_UPLOAD_SIZE_BYTES:
                        buffer.close()
                        if target_path.exists():
                            target_path.unlink()
                        raise HTTPException(
                            status_code=HTTP_413_PAYLOAD_TOO_LARGE,
                            detail=f"File exceeds maximum allowed size of {format_file_size(settings.MAX_UPLOAD_SIZE_BYTES)} (50 MB)."
                        )
                    buffer.write(chunk)
        except HTTPException:
            raise
        except Exception as e:
            if target_path.exists():
                target_path.unlink()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to write uploaded file to disk: {str(e)}"
            )

        if total_bytes == 0:
            if target_path.exists():
                target_path.unlink()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded file is empty (0 bytes)."
            )

        # Automatically initialize non-destructive version session
        try:
            from app.services.version_service import version_service
            version_service.ensure_session_initialized(dataset_id)
        except Exception:
            pass

        return dataset_id, target_path, total_bytes, extension, sanitized_name

    @classmethod
    def read_dataset_to_dataframe(cls, file_path: Path, extension: str) -> pd.DataFrame:
        """Read CSV, XLSX, or XLS file into a Pandas DataFrame with error handling."""
        try:
            if extension == "csv":
                # Check for binary null-byte corruption
                with open(file_path, "rb") as f:
                    sample_bytes = f.read(8192)
                    if b"\x00" in sample_bytes:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="The uploaded CSV file contains binary or invalid non-text data."
                        )
                
                # Try UTF-8 first, fallback to Latin-1
                try:
                    df = pd.read_csv(file_path, encoding="utf-8")
                except UnicodeDecodeError:
                    df = pd.read_csv(file_path, encoding="latin-1")
            elif extension == "xlsx":
                df = pd.read_excel(file_path, engine="openpyxl")
            elif extension == "xls":
                df = pd.read_excel(file_path, engine="xlrd")
            else:
                raise ValueError(f"Unsupported extension: {extension}")
        except HTTPException:
            raise
        except pd.errors.EmptyDataError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded file contains no columns or data."
            )
        except Exception as err:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to parse dataset file. Ensure the file is a valid {extension.upper()} document. Error: {str(err)}"
            )

        if df.empty and len(df.columns) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded dataset has no columns or records."
            )

        return df

    @classmethod
    async def process_dataset_upload(cls, file: UploadFile) -> DatasetUploadResponse:
        """Main orchestrator for dataset upload and ingestion."""
        dataset_id, saved_path, file_size, extension, sanitized_name = await cls.save_and_validate_upload(file)

        try:
            df = cls.read_dataset_to_dataframe(saved_path, extension)
        except HTTPException:
            if saved_path.exists():
                saved_path.unlink()
            raise
        except Exception as e:
            if saved_path.exists():
                saved_path.unlink()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Unexpected error processing dataset: {str(e)}"
            )

        # Extract structural metadata
        row_count = int(len(df))
        column_count = int(len(df.columns))
        column_names = [str(col) for col in df.columns]

        # Extract detected data types
        detected_types: Dict[str, str] = {
            str(col): str(dtype) for col, dtype in df.dtypes.items()
        }

        # Build column details
        columns_meta: List[ColumnMetadata] = []
        for col in df.columns:
            col_series = df[col]
            null_count = int(col_series.isna().sum())
            non_null_samples = col_series.dropna().head(3).tolist()
            clean_samples = [clean_row_value(s) for s in non_null_samples]

            columns_meta.append(
                ColumnMetadata(
                    name=str(col),
                    data_type=str(col_series.dtype),
                    null_count=null_count,
                    sample_values=clean_samples
                )
            )

        # Extract first 10 rows for preview
        preview_df = df.head(10)
        preview_rows: List[Dict[str, Any]] = []
        for _, row in preview_df.iterrows():
            row_dict = {}
            for col in df.columns:
                row_dict[str(col)] = clean_row_value(row[col])
            preview_rows.append(row_dict)

        now_utc = datetime.utcnow()
        response = DatasetUploadResponse(
            dataset_id=dataset_id,
            filename=sanitized_name,
            file_type=extension,
            file_size_bytes=file_size,
            file_size_formatted=format_file_size(file_size),
            row_count=row_count,
            column_count=column_count,
            column_names=column_names,
            detected_data_types=detected_types,
            columns=columns_meta,
            preview_rows=preview_rows,
            uploaded_at=now_utc,
            message=f"Successfully ingested {sanitized_name} ({row_count} rows, {column_count} columns)."
        )

        # Persist dataset metadata to session directory for persistent file history
        try:
            cls.save_meta(dataset_id, {
                "dataset_id": dataset_id,
                "filename": sanitized_name,
                "file_type": extension,
                "file_size_bytes": file_size,
                "file_size_formatted": format_file_size(file_size),
                "row_count": row_count,
                "column_count": column_count,
                "column_names": column_names,
                "detected_data_types": detected_types,
                "uploaded_at": now_utc.isoformat() + "Z",
                "message": response.message
            })
        except Exception:
            pass

        return response

    @classmethod
    def save_meta(cls, dataset_id: str, meta: Dict[str, Any]) -> None:
        """Persist metadata dictionary to dataset session directory."""
        session_dir = settings.STORAGE_DIR / dataset_id
        session_dir.mkdir(parents=True, exist_ok=True)
        meta_file = session_dir / "meta.json"
        meta_file.write_text(json.dumps(meta, indent=2), encoding="utf-8")

    @classmethod
    def get_meta(cls, dataset_id: str) -> Optional[Dict[str, Any]]:
        """Read saved metadata dictionary from dataset session directory if it exists."""
        meta_file = settings.STORAGE_DIR / dataset_id / "meta.json"
        if meta_file.exists():
            try:
                return json.loads(meta_file.read_text(encoding="utf-8"))
            except Exception:
                return None
        return None

    @staticmethod
    def _parse_to_naive_utc(val: Any) -> datetime:
        """Helper to ensure datetime is always offset-naive UTC for consistent sorting."""
        if isinstance(val, datetime):
            if val.tzinfo is not None:
                return val.replace(tzinfo=None)
            return val
        if isinstance(val, (int, float)):
            return datetime.utcfromtimestamp(val)
        if isinstance(val, str):
            try:
                cleaned = val.rstrip("Z")
                if "+" in cleaned:
                    cleaned = cleaned.split("+")[0]
                return datetime.fromisoformat(cleaned)
            except Exception:
                pass
        return datetime.utcnow()

    @classmethod
    def get_dataset_details(cls, dataset_id: str) -> DatasetUploadResponse:
        """Fetch full dataset metadata, column types, and preview rows."""
        from app.services.version_service import version_service
        try:
            df, current_file, ext = version_service.get_current_dataset(dataset_id)
        except Exception:
            import glob
            pattern = str(settings.STORAGE_DIR / f"{dataset_id}.*")
            matches = [m for m in glob.glob(pattern) if Path(m).is_file()]
            if not matches:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Dataset with ID '{dataset_id}' not found."
                )
            current_file = Path(matches[0])
            ext = current_file.suffix.lstrip(".").lower()
            df = cls.read_dataset_to_dataframe(current_file, ext)

        meta = cls.get_meta(dataset_id) or {}
        filename = meta.get("filename") or f"{dataset_id}.{ext}"
        file_size = current_file.stat().st_size if current_file.exists() else meta.get("file_size_bytes", 0)
        uploaded_at = cls._parse_to_naive_utc(meta.get("uploaded_at", current_file.stat().st_mtime if current_file.exists() else None))

        row_count = int(len(df))
        column_count = int(len(df.columns))
        column_names = [str(col) for col in df.columns]
        detected_types: Dict[str, str] = {
            str(col): str(dtype) for col, dtype in df.dtypes.items()
        }

        columns_meta: List[ColumnMetadata] = []
        for col in df.columns:
            col_series = df[col]
            null_count = int(col_series.isna().sum())
            non_null_samples = col_series.dropna().head(3).tolist()
            clean_samples = [clean_row_value(s) for s in non_null_samples]
            columns_meta.append(
                ColumnMetadata(
                    name=str(col),
                    data_type=str(col_series.dtype),
                    null_count=null_count,
                    sample_values=clean_samples
                )
            )

        preview_df = df.head(10)
        preview_rows: List[Dict[str, Any]] = []
        for _, row in preview_df.iterrows():
            row_dict = {}
            for col in df.columns:
                row_dict[str(col)] = clean_row_value(row[col])
            preview_rows.append(row_dict)

        return DatasetUploadResponse(
            dataset_id=dataset_id,
            filename=filename,
            file_type=ext,
            file_size_bytes=file_size,
            file_size_formatted=format_file_size(file_size),
            row_count=row_count,
            column_count=column_count,
            column_names=column_names,
            detected_data_types=detected_types,
            columns=columns_meta,
            preview_rows=preview_rows,
            uploaded_at=uploaded_at,
            message=f"Dataset {filename} loaded successfully."
        )

    @classmethod
    def list_all_datasets(cls) -> List[DatasetSummary]:
        """Scan storage directory and return only verified stored datasets for file history."""
        results: List[DatasetSummary] = []
        seen_ids = set()

        if not settings.STORAGE_DIR.exists():
            return []

        for item in settings.STORAGE_DIR.iterdir():
            dataset_id = None
            if item.is_dir() and item.name.startswith("ds_"):
                dataset_id = item.name
            elif item.is_file() and item.name.startswith("ds_") and not item.name.endswith(".tmp"):
                dataset_id = item.stem

            if not dataset_id or dataset_id in seen_ids:
                continue
            seen_ids.add(dataset_id)

            try:
                meta = cls.get_meta(dataset_id)
                session_dir = settings.STORAGE_DIR / dataset_id

                # Verify that the underlying dataset data file actually exists on disk
                target_file = None
                current_dir = session_dir / "current"
                if current_dir.exists():
                    files = [f for f in current_dir.glob(f"{dataset_id}.*") if f.is_file()]
                    if files:
                        target_file = files[0]

                if not target_file and (session_dir / "original").exists():
                    orig_files = [f for f in (session_dir / "original").glob(f"{dataset_id}.*") if f.is_file()]
                    if orig_files:
                        target_file = orig_files[0]

                if not target_file:
                    flat_files = [f for f in settings.STORAGE_DIR.glob(f"{dataset_id}.*") if f.is_file() and not f.name.endswith(".tmp") and not f.name.endswith(".json")]
                    if flat_files:
                        target_file = flat_files[0]

                if not target_file or not target_file.exists():
                    continue

                history_file = session_dir / "history.json"
                version_count = 0
                if history_file.exists():
                    try:
                        history_data = json.loads(history_file.read_text(encoding="utf-8"))
                        version_count = len(history_data)
                    except Exception:
                        pass

                if meta:
                    dt = cls._parse_to_naive_utc(meta.get("uploaded_at"))
                    results.append(
                        DatasetSummary(
                            dataset_id=dataset_id,
                            filename=meta.get("filename", target_file.name),
                            file_type=meta.get("file_type", target_file.suffix.lstrip(".").lower()),
                            file_size_formatted=meta.get("file_size_formatted", format_file_size(target_file.stat().st_size)),
                            file_size_bytes=meta.get("file_size_bytes", target_file.stat().st_size),
                            row_count=meta.get("row_count", 0),
                            column_count=meta.get("column_count", 0),
                            uploaded_at=dt,
                            version_count=version_count
                        )
                    )
                else:
                    ext = target_file.suffix.lstrip(".").lower()
                    st = target_file.stat()
                    dt = cls._parse_to_naive_utc(st.st_mtime)
                    try:
                        df = cls.read_dataset_to_dataframe(target_file, ext)
                        rows = int(len(df))
                        cols = int(len(df.columns))
                    except Exception:
                        rows = 0
                        cols = 0

                    summary_item = DatasetSummary(
                        dataset_id=dataset_id,
                        filename=target_file.name,
                        file_type=ext,
                        file_size_formatted=format_file_size(st.st_size),
                        file_size_bytes=st.st_size,
                        row_count=rows,
                        column_count=cols,
                        uploaded_at=dt,
                        version_count=version_count
                    )
                    cls.save_meta(dataset_id, {
                        "dataset_id": dataset_id,
                        "filename": target_file.name,
                        "file_type": ext,
                        "file_size_bytes": st.st_size,
                        "file_size_formatted": format_file_size(st.st_size),
                        "row_count": rows,
                        "column_count": cols,
                        "uploaded_at": dt.isoformat() + "Z"
                    })
                    results.append(summary_item)
            except Exception:
                continue

        results.sort(key=lambda x: x.uploaded_at, reverse=True)
        return results


    @classmethod
    def delete_dataset(cls, dataset_id: str) -> bool:
        """Deletes a dataset and all associated files/sessions from storage."""
        found = False
        session_dir = settings.STORAGE_DIR / dataset_id
        if session_dir.exists():
            shutil.rmtree(session_dir, ignore_errors=True)
            found = True

        for flat_file in settings.STORAGE_DIR.glob(f"{dataset_id}.*"):
            if flat_file.is_file():
                try:
                    flat_file.unlink()
                    found = True
                except Exception:
                    pass

        try:
            from app.services.profiling_service import clear_dataset_cache
            clear_dataset_cache(dataset_id)
        except Exception:
            pass

        return found

    @classmethod
    def clear_all_datasets(cls) -> int:
        """Deletes all datasets, sessions, and files from storage."""
        count = 0
        if not settings.STORAGE_DIR.exists():
            return 0
        for item in settings.STORAGE_DIR.iterdir():
            try:
                if item.is_dir():
                    shutil.rmtree(item, ignore_errors=True)
                    count += 1
                elif item.is_file():
                    item.unlink()
                    count += 1
            except Exception:
                pass
        return count



ingestion_service = IngestionService()

