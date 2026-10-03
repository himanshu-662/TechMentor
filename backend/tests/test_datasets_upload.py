import io
import pandas as pd
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)


def test_valid_csv_upload_and_metadata_extraction():
    """Test uploading a valid CSV file with mixed data types and verifying metadata."""
    csv_content = (
        "id,name,age,salary,joined_date,is_active\n"
        "1,Alice,29,75000.50,2023-01-15,true\n"
        "2,Bob,34,82000.00,2022-06-01,false\n"
        "3,Charlie,,65000.00,2024-03-10,true\n"
        "4,Diana,41,120000.00,2020-11-20,true\n"
        "5,Evan,25,54000.00,2025-01-05,false\n"
    )
    file_bytes = csv_content.encode("utf-8")
    
    response = client.post(
        "/api/datasets/upload",
        files={"file": ("employees.csv", io.BytesIO(file_bytes), "text/csv")}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["filename"] == "employees.csv"
    assert data["file_type"] == "csv"
    assert data["row_count"] == 5
    assert data["column_count"] == 6
    assert "id" in data["column_names"]
    assert "age" in data["column_names"]
    assert "salary" in data["column_names"]
    assert len(data["preview_rows"]) == 5
    assert data["preview_rows"][0]["name"] == "Alice"
    assert data["preview_rows"][2]["age"] is None  # Missing value in Charlie's age
    assert "dataset_id" in data
    assert data["dataset_id"].startswith("ds_")


def test_valid_xlsx_upload_and_metadata_extraction():
    """Test uploading a valid Excel XLSX file and verifying metadata extraction."""
    df = pd.DataFrame({
        "customer_id": [101, 102, 103],
        "region": ["North", "South", "East"],
        "spending": [250.75, 410.20, 99.50]
    })
    excel_buffer = io.BytesIO()
    with pd.ExcelWriter(excel_buffer, engine="openpyxl") as writer:
        df.to_excel(writer, index=False)
    excel_bytes = excel_buffer.getvalue()

    response = client.post(
        "/api/datasets/upload",
        files={"file": ("customers.xlsx", io.BytesIO(excel_bytes), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
    )

    assert response.status_code == 200
    data = response.json()

    assert data["filename"] == "customers.xlsx"
    assert data["file_type"] == "xlsx"
    assert data["row_count"] == 3
    assert data["column_count"] == 3
    assert data["column_names"] == ["customer_id", "region", "spending"]
    assert len(data["preview_rows"]) == 3
    assert data["preview_rows"][0]["region"] == "North"


def test_unsupported_file_type():
    """Test rejecting files with unsupported extensions (e.g. .pdf, .txt, .json)."""
    text_content = b"This is just a text file, not a tabular dataset."
    response = client.post(
        "/api/datasets/upload",
        files={"file": ("document.txt", io.BytesIO(text_content), "text/plain")}
    )
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]


def test_empty_dataset_upload():
    """Test rejecting an empty 0-byte file."""
    empty_bytes = b""
    response = client.post(
        "/api/datasets/upload",
        files={"file": ("empty.csv", io.BytesIO(empty_bytes), "text/csv")}
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_malformed_csv_upload():
    """Test uploading a corrupted / non-CSV byte stream with a .csv extension."""
    garbage_bytes = b"\x00\x01\x02\x03\x04\x05\x06\x07\x08"
    response = client.post(
        "/api/datasets/upload",
        files={"file": ("corrupted.csv", io.BytesIO(garbage_bytes), "text/csv")}
    )
    # Should safely return 400 bad request with clean error
    assert response.status_code == 400


def test_oversized_file_rejection(monkeypatch):
    """Test rejecting a file exceeding the maximum size limit."""
    # Temporarily set max size to 100 bytes for this test
    monkeypatch.setattr(settings, "MAX_UPLOAD_SIZE_BYTES", 100)
    
    large_csv = ("col1,col2,col3\n" + "val1,val2,val3\n" * 20).encode("utf-8")
    assert len(large_csv) > 100

    response = client.post(
        "/api/datasets/upload",
        files={"file": ("toolarge.csv", io.BytesIO(large_csv), "text/csv")}
    )
    assert response.status_code == 413
    assert "exceeds maximum allowed size" in response.json()["detail"]


def test_health_check():
    """Verify system health endpoint."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_dataset_list_get_and_delete():
    """Test full dataset history lifecycle: list, get by ID, and delete."""
    csv_content = "id,name,score\n1,Alpha,95\n2,Beta,88\n".encode("utf-8")
    upload_res = client.post(
        "/api/datasets/upload",
        files={"file": ("history_test.csv", io.BytesIO(csv_content), "text/csv")}
    )
    assert upload_res.status_code == 200
    dataset_id = upload_res.json()["dataset_id"]

    # 1. Test listing
    list_res = client.get("/api/datasets")
    assert list_res.status_code == 200
    datasets = list_res.json()
    assert isinstance(datasets, list)
    matching = [d for d in datasets if d["dataset_id"] == dataset_id]
    assert len(matching) == 1
    assert matching[0]["filename"] == "history_test.csv"
    assert matching[0]["row_count"] == 2
    assert matching[0]["column_count"] == 3

    # 2. Test getting details by ID
    get_res = client.get(f"/api/datasets/{dataset_id}")
    assert get_res.status_code == 200
    details = get_res.json()
    assert details["dataset_id"] == dataset_id
    assert details["row_count"] == 2
    assert len(details["columns"]) == 3
    assert len(details["preview_rows"]) == 2

    # 3. Test deleting dataset
    del_res = client.delete(f"/api/datasets/{dataset_id}")
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "success"

    # 4. Verify 404 after deletion
    get_after_del = client.get(f"/api/datasets/{dataset_id}")
    assert get_after_del.status_code == 404

