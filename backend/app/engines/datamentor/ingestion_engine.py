"""DataMentor Step 01 & Step 02: Ingestion & Dataset Parsing Engine.
Pure business logic for file validation, SHA-256 immutability hashing, parsing,
column type inference, and dataset summary extraction.
"""
import os
import re
import math
import hashlib
from pathlib import Path
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np

try:
    from app.models.dataset import ColumnMetadata
except ImportError:
    from backend.app.models.dataset import ColumnMetadata


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
    """Sanitize the uploaded file's original name for storage and display."""
    if not filename:
        return "dataset"
    clean_name = os.path.basename(filename)
    clean_name = re.sub(r'[^a-zA-Z0-9_\-\. ]', '_', clean_name).strip()
    return clean_name or "dataset"


def clean_row_value(val: Any) -> Any:
    """Convert pandas/numpy non-JSON-serializable types (NaN, NaT, Inf) to None/primitives."""
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


class IngestionEngine:
    """Deterministic Ingestion & Parsing Engine."""

    @staticmethod
    def compute_sha256(content: bytes) -> str:
        """Compute SHA-256 checksum for cryptographic immutability."""
        return hashlib.sha256(content).hexdigest()

    @staticmethod
    def detect_delimiter(file_path: Path) -> str:
        """Heuristically detect delimiter for text/csv datasets."""
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                sample = f.read(4096)
            for sep in [",", "\t", ";", "|"]:
                if sep in sample:
                    lines = sample.split("\n")
                    if len(lines) > 1 and len(lines[0].split(sep)) > 1:
                        return sep
        except Exception:
            pass
        return ","

    @classmethod
    def load_dataframe(cls, file_path: Path, filename: str) -> pd.DataFrame:
        """Load tabular data into pandas DataFrame with robust format detection."""
        ext = file_path.suffix.lower()
        if ext in [".csv", ".txt"]:
            sep = cls.detect_delimiter(file_path)
            try:
                df = pd.read_csv(file_path, sep=sep, encoding="utf-8")
            except UnicodeDecodeError:
                df = pd.read_csv(file_path, sep=sep, encoding="latin1")
        elif ext in [".xlsx", ".xls"]:
            df = pd.read_excel(file_path)
        elif ext == ".json":
            try:
                df = pd.read_json(file_path, orient="records")
            except ValueError:
                df = pd.read_json(file_path)
        else:
            raise ValueError(f"Unsupported file format: {ext}")

        # Clean string column names
        df.columns = [str(c).strip() for c in df.columns]
        return df

    @classmethod
    def infer_column_metadata(cls, df: pd.DataFrame) -> List[ColumnMetadata]:
        """Infer semantic data type, missing values, and uniqueness for all columns."""
        metadata: List[ColumnMetadata] = []
        total_rows = len(df)

        for col in df.columns:
            series = df[col]
            missing_count = int(series.isna().sum())
            missing_pct = round((missing_count / total_rows * 100), 2) if total_rows > 0 else 0.0
            unique_count = int(series.nunique(dropna=True))
            unique_pct = round((unique_count / total_rows * 100), 2) if total_rows > 0 else 0.0

            # Determine semantic type
            dtype_str = str(series.dtype)
            if pd.api.types.is_numeric_dtype(series):
                if pd.api.types.is_integer_dtype(series):
                    data_type = "integer"
                else:
                    data_type = "float"
            elif pd.api.types.is_datetime64_any_dtype(series):
                data_type = "datetime"
            elif pd.api.types.is_bool_dtype(series):
                data_type = "boolean"
            else:
                data_type = "categorical" if unique_count <= 50 else "text"

            sample_vals = [clean_row_value(v) for v in series.dropna().head(3).tolist()]

            metadata.append(
                ColumnMetadata(
                    name=str(col),
                    data_type=data_type,
                    raw_dtype=dtype_str,
                    missing_count=missing_count,
                    missing_percentage=missing_pct,
                    unique_count=unique_count,
                    unique_percentage=unique_pct,
                    sample_values=sample_vals
                )
            )

        return metadata
