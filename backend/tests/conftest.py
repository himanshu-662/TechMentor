import os
import shutil
from pathlib import Path
import pytest
from app.core.config import settings


@pytest.fixture(autouse=True)
def isolate_test_storage(tmp_path, monkeypatch):
    """
    Isolate backend storage directory to a temporary directory for each test.
    This guarantees that pytest execution never pollutes or leaves unwanted test files
    (like employees.csv, customers.xlsx, etc.) in the user's real workspace storage history.
    """
    test_storage = tmp_path / "test_uploads"
    test_storage.mkdir(parents=True, exist_ok=True)
    monkeypatch.setattr(settings, "STORAGE_DIR", test_storage)
    yield
