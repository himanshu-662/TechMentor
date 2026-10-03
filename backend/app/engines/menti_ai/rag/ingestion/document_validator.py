"""Document validation module for Phase 16 RAG Knowledge Base.
Validates file extensions, MIME types, content sizes, encodings, and checksums.
"""
import hashlib
import os
from typing import Tuple, Optional, Dict, Any

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit
ALLOWED_EXTENSIONS = {".md", ".markdown", ".txt", ".pdf", ".html", ".htm", ".json", ".docx"}
ALLOWED_MIME_TYPES = {
    "text/plain",
    "text/markdown",
    "text/html",
    "application/json",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/octet-stream"
}


class DocumentValidationError(Exception):
    """Raised when document validation fails."""
    pass


class DocumentValidator:
    """Validates document files and text content before parsing and ingestion."""

    @staticmethod
    def calculate_checksum(content: bytes) -> str:
        """Calculate SHA-256 hash of binary content."""
        return hashlib.sha256(content).hexdigest()

    @staticmethod
    def validate_file_metadata(
        filename: str,
        file_size: int,
        mime_type: Optional[str] = None
    ) -> Tuple[bool, Optional[str]]:
        """Validate filename extension and file size."""
        if not filename or not filename.strip():
            return False, "Filename cannot be empty."

        ext = os.path.splitext(filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            return False, f"Unsupported file extension '{ext}'. Allowed extensions: {', '.join(sorted(ALLOWED_EXTENSIONS))}"

        if file_size <= 0:
            return False, "File is empty (0 bytes)."

        if file_size > MAX_FILE_SIZE_BYTES:
            return False, f"File size ({file_size / (1024*1024):.2f} MB) exceeds the 10 MB limit."

        return True, None

    @staticmethod
    def validate_content(content_bytes: bytes, filename: str = "document.txt") -> Tuple[bool, Optional[str], str]:
        """Validate raw binary content, check for valid decoding and non-empty text.
        
        Returns:
            (is_valid, error_message, decoded_text)
        """
        if not content_bytes or len(content_bytes.strip()) == 0:
            return False, "Document content is empty.", ""

        ext = os.path.splitext(filename)[1].lower()

        # For text-based files, verify decoding
        if ext in {".md", ".markdown", ".txt", ".html", ".htm", ".json"}:
            decoded = None
            for encoding in ("utf-8", "utf-8-sig", "latin-1", "cp1252"):
                try:
                    decoded = content_bytes.decode(encoding)
                    break
                except UnicodeDecodeError:
                    continue

            if decoded is None:
                return False, "Failed to decode text file. Ensure it is encoded in UTF-8 or compatible text encoding.", ""

            if not decoded.strip():
                return False, "Decoded text content is empty.", ""

            return True, None, decoded

        # For binary files like PDF/DOCX, return empty string for now (parsed by dedicated parser)
        return True, None, ""

    @staticmethod
    def sanitize_path(filename: str) -> str:
        """Strip dangerous path traversal characters from user-provided filename."""
        clean_name = os.path.basename(filename)
        clean_name = clean_name.replace("..", "").replace("/", "").replace("\\", "")
        return clean_name or "document.txt"
