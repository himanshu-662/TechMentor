import json
import shutil
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
import pandas as pd
from fastapi import HTTPException, status

try:
    from app.core.config import settings
    from app.services.ingestion_service import IngestionService
    from app.services.profiling_service import clear_dataset_cache
except ImportError:
    from backend.app.core.config import settings
    from backend.app.services.ingestion_service import IngestionService
    from backend.app.services.profiling_service import clear_dataset_cache


class VersionService:
    """
    Manages non-destructive dataset versioning, snapshot persistence,
    transformation audit logs, and version rollback (undo).
    
    Guarantees:
    - The raw uploaded file in `original/` is never mutated.
    - Each confirmed operation yields a version snapshot in `versions/`.
    - Every change is recorded in `history.json`.
    """

    @classmethod
    def get_session_dir(cls, dataset_id: str) -> Path:
        """Returns the isolated session directory for a dataset."""
        session_dir = settings.STORAGE_DIR / dataset_id
        return session_dir

    @classmethod
    def ensure_session_initialized(cls, dataset_id: str) -> Tuple[Path, str]:
        """
        Ensures a dataset session directory exists with:
        ├── original/
        ├── current/
        ├── versions/
        └── history.json

        Migrates from legacy flat file storage if necessary without data loss.
        """
        session_dir = cls.get_session_dir(dataset_id)
        original_dir = session_dir / "original"
        current_dir = session_dir / "current"
        versions_dir = session_dir / "versions"
        history_file = session_dir / "history.json"

        # Check if already initialized
        if original_dir.exists() and current_dir.exists():
            # Find current file
            files = list(current_dir.glob(f"{dataset_id}.*"))
            if files:
                ext = files[0].suffix.lstrip(".").lower()
                return files[0], ext

        # Look for existing flat file in STORAGE_DIR
        flat_matches = list(settings.STORAGE_DIR.glob(f"{dataset_id}.*"))
        # Exclude directories
        flat_files = [f for f in flat_matches if f.is_file()]
        if not flat_files:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Dataset with ID '{dataset_id}' not found in storage."
            )

        source_file = flat_files[0]
        ext = source_file.suffix.lstrip(".").lower()

        # Create session directories
        original_dir.mkdir(parents=True, exist_ok=True)
        current_dir.mkdir(parents=True, exist_ok=True)
        versions_dir.mkdir(parents=True, exist_ok=True)

        target_name = f"{dataset_id}.{ext}"
        original_copy = original_dir / target_name
        current_copy = current_dir / target_name
        v0_copy = versions_dir / f"v0_initial.{ext}"

        # Copy original file to all initial slots
        if not original_copy.exists():
            shutil.copy2(source_file, original_copy)
        if not current_copy.exists():
            shutil.copy2(source_file, current_copy)
        if not v0_copy.exists():
            shutil.copy2(source_file, v0_copy)

        # Initialize history.json if missing
        if not history_file.exists():
            history_file.write_text(json.dumps([], indent=2), encoding="utf-8")

        return current_copy, ext

    @classmethod
    def get_current_dataset(cls, dataset_id: str) -> Tuple[pd.DataFrame, Path, str]:
        """Loads active working DataFrame and file path for a dataset."""
        current_file, ext = cls.ensure_session_initialized(dataset_id)
        df = IngestionService.read_dataset_to_dataframe(current_file, ext)
        return df, current_file, ext

    @classmethod
    def get_original_dataset(cls, dataset_id: str) -> Tuple[pd.DataFrame, Path, str]:
        """Loads untouched original DataFrame and file path for verification."""
        session_dir = cls.get_session_dir(dataset_id)
        cls.ensure_session_initialized(dataset_id)
        original_dir = session_dir / "original"
        files = list(original_dir.glob(f"{dataset_id}.*"))
        if not files:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Original dataset archive not found."
            )
        orig_file = files[0]
        ext = orig_file.suffix.lstrip(".").lower()
        df = IngestionService.read_dataset_to_dataframe(orig_file, ext)
        return df, orig_file, ext

    @classmethod
    def compute_file_hash(cls, file_path: Path) -> str:
        """Computes SHA-256 hash of a file for data integrity verification."""
        hasher = hashlib.sha256()
        with open(file_path, "rb") as f:
            while chunk := f.read(65536):
                hasher.update(chunk)
        return hasher.hexdigest()

    @classmethod
    def get_history(cls, dataset_id: str) -> List[Dict[str, Any]]:
        """Reads transformation history audit log."""
        session_dir = cls.get_session_dir(dataset_id)
        cls.ensure_session_initialized(dataset_id)
        history_file = session_dir / "history.json"
        if not history_file.exists():
            return []
        try:
            return json.loads(history_file.read_text(encoding="utf-8"))
        except Exception:
            return []

    @classmethod
    def save_new_version(
        cls,
        dataset_id: str,
        df: pd.DataFrame,
        operation_record: Dict[str, Any]
    ) -> Tuple[int, Path]:
        """
        Saves a new snapshot version, updates current working copy,
        and appends to history.json. NEVER touches original/.
        """
        session_dir = cls.get_session_dir(dataset_id)
        current_file, ext = cls.ensure_session_initialized(dataset_id)
        versions_dir = session_dir / "versions"
        history_file = session_dir / "history.json"

        history = cls.get_history(dataset_id)
        version_num = len(history) + 1
        op_id = operation_record.get("operation_id", f"op_{version_num}")
        version_filename = f"v{version_num}_{op_id}.{ext}"
        version_path = versions_dir / version_filename

        # Write to new version file
        try:
            if ext == "csv":
                df.to_csv(version_path, index=False, encoding="utf-8")
                # Also update current/ working copy
                df.to_csv(current_file, index=False, encoding="utf-8")
                # Also update flat file in STORAGE_DIR for backward compatibility
                flat_file = settings.STORAGE_DIR / f"{dataset_id}.{ext}"
                df.to_csv(flat_file, index=False, encoding="utf-8")
            elif ext in ("xlsx", "xls"):
                df.to_excel(version_path, index=False, engine="openpyxl")
                df.to_excel(current_file, index=False, engine="openpyxl")
                flat_file = settings.STORAGE_DIR / f"{dataset_id}.xlsx"
                df.to_excel(flat_file, index=False, engine="openpyxl")
            else:
                df.to_csv(version_path, index=False)
                df.to_csv(current_file, index=False)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to persist dataset version: {str(e)}"
            )

        # Record history entry
        record = {
            **operation_record,
            "version": version_num,
            "version_filename": version_filename,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        history.append(record)
        history_file.write_text(json.dumps(history, indent=2), encoding="utf-8")

        # Invalidate profiling cache so Stage 2 re-profiling reflects the new state
        clear_dataset_cache(dataset_id)

        return version_num, current_file

    @classmethod
    def undo_last_operation(cls, dataset_id: str) -> Dict[str, Any]:
        """
        Reverts the latest transformation:
        - Points current working copy back to version N-1
        - Removes the latest snapshot file
        - Pops the latest entry from history.json
        - Clears profiling cache
        """
        session_dir = cls.get_session_dir(dataset_id)
        current_file, ext = cls.ensure_session_initialized(dataset_id)
        versions_dir = session_dir / "versions"
        history_file = session_dir / "history.json"

        history = cls.get_history(dataset_id)
        if not history:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No operations to undo. Dataset is already in its initial uploaded state."
            )

        # Remove latest operation
        reverted_op = history.pop()
        previous_version_num = len(history)

        # Locate previous snapshot
        if previous_version_num == 0:
            target_snapshot = versions_dir / f"v0_initial.{ext}"
            if not target_snapshot.exists():
                orig_files = list((session_dir / "original").glob(f"{dataset_id}.*"))
                target_snapshot = orig_files[0]
        else:
            prev_entry = history[-1]
            target_snapshot = versions_dir / prev_entry["version_filename"]

        if not target_snapshot.exists():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Target rollback snapshot '{target_snapshot.name}' not found."
            )

        # Restore working copy
        shutil.copy2(target_snapshot, current_file)
        flat_file = settings.STORAGE_DIR / f"{dataset_id}.{ext}"
        shutil.copy2(target_snapshot, flat_file)

        # Delete reverted version snapshot file if it exists
        reverted_snapshot = versions_dir / reverted_op.get("version_filename", "")
        if reverted_snapshot.exists() and reverted_snapshot != target_snapshot:
            reverted_snapshot.unlink()

        # Save updated history
        history_file.write_text(json.dumps(history, indent=2), encoding="utf-8")

        # Invalidate cache
        clear_dataset_cache(dataset_id)

        # Read restored DataFrame for response
        df_restored = IngestionService.read_dataset_to_dataframe(current_file, ext)

        return {
            "dataset_id": dataset_id,
            "reverted_operation": reverted_op,
            "remaining_history_count": len(history),
            "current_version": previous_version_num,
            "row_count": int(len(df_restored)),
            "column_count": int(len(df_restored.columns)),
            "missing_cells": int(df_restored.isna().sum().sum()),
            "duplicate_rows": int(df_restored.duplicated().sum()) if len(df_restored) > 0 else 0,
            "message": f"Successfully rolled back operation '{reverted_op.get('action')}' on column '{reverted_op.get('column', 'N/A')}'."
        }


version_service = VersionService()
