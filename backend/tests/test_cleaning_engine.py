import io
import hashlib
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)


def compute_bytes_hash(data: bytes) -> str:
    """Computes SHA-256 hash for byte arrays."""
    return hashlib.sha256(data).hexdigest()


@pytest.fixture
def test_dataset_setup():
    """Uploads a dataset containing missing values, duplicates, and constant features."""
    csv_content = (
        "id,name,age,salary,department,country\n"
        "1,Alice,29,75000,Engineering,USA\n"
        "2,Bob,34,,Sales,USA\n"
        "3,Charlie,42,120000,Engineering,USA\n"
        "4,Diana,,95000,HR,USA\n"
        "5,Evan,25,54000,Sales,USA\n"
        "6,Frank,58,250000,Engineering,USA\n"
        "1,Alice,29,75000,Engineering,USA\n"  # Duplicate row
    )
    raw_bytes = csv_content.encode("utf-8")
    original_hash = compute_bytes_hash(raw_bytes)

    resp = client.post(
        "/api/datasets/upload",
        files={"file": ("company_staff.csv", io.BytesIO(raw_bytes), "text/csv")}
    )
    assert resp.status_code == 200
    dataset_id = resp.json()["dataset_id"]

    return {
        "dataset_id": dataset_id,
        "original_hash": original_hash,
        "raw_bytes": raw_bytes
    }


def test_cleaning_recommendations(test_dataset_setup):
    """Test deterministic cleaning recommendations generated from Phase 3 profile."""
    dataset_id = test_dataset_setup["dataset_id"]
    resp = client.get(f"/api/datasets/{dataset_id}/cleaning/recommendations")
    assert resp.status_code == 200
    recs = resp.json()
    assert len(recs) >= 3

    # Check duplicate recommendation
    dup_rec = next((r for r in recs if r["issue_type"] == "duplicate_rows"), None)
    assert dup_rec is not None
    assert dup_rec["recommended_method"] == "remove"
    assert dup_rec["evidence"]["duplicate_count"] == 1

    # Check constant column recommendation for 'country'
    const_rec = next((r for r in recs if r["issue_type"] == "constant_column" and r["column"] == "country"), None)
    assert const_rec is not None
    assert const_rec["recommended_method"] == "drop"

    # Check missing values recommendation for 'salary' (numerical skewed)
    salary_rec = next((r for r in recs if r["issue_type"] == "missing_values" and r["column"] == "salary"), None)
    assert salary_rec is not None
    assert salary_rec["recommended_method"] in ("median", "mean")
    assert salary_rec["evidence"]["missing_count"] == 1


def test_preview_does_not_modify_dataset(test_dataset_setup):
    """Verify preview does not mutate data or create version snapshots."""
    dataset_id = test_dataset_setup["dataset_id"]
    payload = {
        "operation": "impute_missing",
        "column": "salary",
        "method": "median"
    }
    resp = client.post(f"/api/datasets/{dataset_id}/cleaning/preview", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    # Check preview contents
    assert data["affected_rows"] == 1
    assert data["metrics_before"]["column_missing_count"] == 1
    assert data["metrics_after"]["column_missing_count"] == 0
    assert "explanation" in data
    assert "Median Imputation" in data["explanation"]["technique_used"]
    assert data["math_calculation"] is not None

    # Verify dataset is NOT modified: history should be empty and profile still has nulls
    history_resp = client.get(f"/api/datasets/{dataset_id}/cleaning/history")
    assert history_resp.status_code == 200
    assert len(history_resp.json()) == 0

    profile_resp = client.get(f"/api/datasets/{dataset_id}/profile")
    assert profile_resp.json()["dataset_summary"]["missing_cells"] == 2


def test_validation_errors(test_dataset_setup):
    """Test validation errors for incompatible operations and invalid parameters."""
    dataset_id = test_dataset_setup["dataset_id"]

    # 1. Non-existent column
    resp1 = client.post(f"/api/datasets/{dataset_id}/cleaning/preview", json={
        "operation": "impute_missing",
        "column": "non_existent_column",
        "method": "median"
    })
    assert resp1.status_code == 400
    assert "does not exist in the dataset" in resp1.json()["detail"]

    # 2. Incompatible method: Mean/Median on categorical column
    resp2 = client.post(f"/api/datasets/{dataset_id}/cleaning/preview", json={
        "operation": "impute_missing",
        "column": "department",
        "method": "mean"
    })
    assert resp2.status_code == 400

    # 3. Invalid operation
    resp3 = client.post(f"/api/datasets/{dataset_id}/cleaning/preview", json={
        "operation": "unsupported_magic_clean"
    })
    assert resp3.status_code == 400
    assert "Unsupported cleaning operation" in resp3.json()["detail"]


def test_versioning_apply_and_undo(test_dataset_setup):
    """
    Test complete lifecycle:
    1. Apply Deduplication -> Version 1
    2. Apply Median Imputation on salary -> Version 2
    3. Apply Mode Imputation on age -> Version 3
    4. Verify history has 3 entries
    5. Undo -> Back to Version 2
    6. Undo -> Back to Version 1
    7. Undo -> Back to Version 0
    """
    dataset_id = test_dataset_setup["dataset_id"]

    # Step 1: Remove duplicates
    resp1 = client.post(f"/api/datasets/{dataset_id}/cleaning/apply", json={
        "operation": "drop_duplicates",
        "confirmation": True
    })
    assert resp1.status_code == 200
    data1 = resp1.json()
    assert data1["version"] == 1
    assert data1["duplicate_rows"] == 0
    assert data1["row_count"] == 6

    # Step 2: Impute salary with median
    resp2 = client.post(f"/api/datasets/{dataset_id}/cleaning/apply", json={
        "operation": "impute_missing",
        "column": "salary",
        "method": "median",
        "confirmation": True
    })
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["version"] == 2
    assert data2["missing_cells"] == 1  # Only 'age' left

    # Step 3: Remove constant column 'country'
    resp3 = client.post(f"/api/datasets/{dataset_id}/cleaning/apply", json={
        "operation": "drop_constant_column",
        "column": "country",
        "confirmation": True
    })
    assert resp3.status_code == 200
    data3 = resp3.json()
    assert data3["version"] == 3
    assert data3["column_count"] == 5

    # Check history
    hist_resp = client.get(f"/api/datasets/{dataset_id}/cleaning/history")
    assert hist_resp.status_code == 200
    history = hist_resp.json()
    assert len(history) == 3
    assert history[0]["action"] == "drop_duplicates"
    assert history[1]["action"] == "impute_missing"
    assert history[2]["action"] == "drop_constant_column"

    # Step 4: Undo drop_constant_column (reverts to v2)
    undo_resp1 = client.post(f"/api/datasets/{dataset_id}/cleaning/undo")
    assert undo_resp1.status_code == 200
    u1 = undo_resp1.json()
    assert u1["current_version"] == 2
    assert u1["column_count"] == 6  # Country restored!

    # Step 5: Undo salary imputation (reverts to v1)
    undo_resp2 = client.post(f"/api/datasets/{dataset_id}/cleaning/undo")
    assert undo_resp2.status_code == 200
    u2 = undo_resp2.json()
    assert u2["current_version"] == 1
    assert u2["missing_cells"] == 2  # Salary null restored!

    # Step 6: Undo deduplication (reverts to v0)
    undo_resp3 = client.post(f"/api/datasets/{dataset_id}/cleaning/undo")
    assert undo_resp3.status_code == 200
    u3 = undo_resp3.json()
    assert u3["current_version"] == 0
    assert u3["row_count"] == 7  # Duplicate row restored!
    assert u3["duplicate_rows"] == 1


def test_critical_data_safety_original_never_mutated(test_dataset_setup):
    """
    CRITICAL DATA SAFETY TEST:
    Verify that the raw original dataset file in storage/datasets/{id}/original/
    is 100% byte-for-byte immutable across multiple transformations and undos.
    """
    dataset_id = test_dataset_setup["dataset_id"]
    session_dir = settings.STORAGE_DIR / dataset_id
    original_file = list((session_dir / "original").glob(f"{dataset_id}.*"))[0]

    with open(original_file, "rb") as f:
        hash_before = hashlib.sha256(f.read()).hexdigest()

    # Apply operations
    client.post(f"/api/datasets/{dataset_id}/cleaning/apply", json={
        "operation": "drop_duplicates",
        "confirmation": True
    })
    client.post(f"/api/datasets/{dataset_id}/cleaning/apply", json={
        "operation": "impute_missing",
        "column": "salary",
        "method": "median",
        "confirmation": True
    })

    # Verify original file hash during active transformations
    with open(original_file, "rb") as f:
        hash_during = hashlib.sha256(f.read()).hexdigest()
    assert hash_during == hash_before

    # Undo operations
    client.post(f"/api/datasets/{dataset_id}/cleaning/undo")

    # Verify original file hash after undo
    with open(original_file, "rb") as f:
        hash_after = hashlib.sha256(f.read()).hexdigest()
    assert hash_after == hash_before
