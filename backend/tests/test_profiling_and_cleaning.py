import io
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


@pytest.fixture
def uploaded_dataset_id():
    """Upload a test dataset containing missing values, duplicates, and skewed numerical columns."""
    csv_content = (
        "id,name,age,salary,department,country\n"
        "1,Alice,29,75000,Engineering,USA\n"
        "2,Bob,34,,Sales,USA\n"
        "3,Charlie,42,120000,Engineering,USA\n"
        "4,Diana,,95000,HR,USA\n"
        "5,Evan,25,54000,Sales,USA\n"
        "6,Frank,58,250000,Engineering,USA\n"
        "1,Alice,29,75000,Engineering,USA\n"  # Exact duplicate
    )
    file_bytes = csv_content.encode("utf-8")
    resp = client.post(
        "/api/datasets/upload",
        files={"file": ("staff_data.csv", io.BytesIO(file_bytes), "text/csv")}
    )
    assert resp.status_code == 200
    data = resp.json()
    return data["dataset_id"]


def test_stage_2_profiling_engine(uploaded_dataset_id):
    """Test that Stage 2 profiling returns dataset summary, column statistics, and detected issues."""
    resp = client.get(f"/api/datasets/{uploaded_dataset_id}/profile")
    assert resp.status_code == 200
    data = resp.json()

    # Summary
    summary = data["dataset_summary"]
    assert summary["row_count"] == 7
    assert summary["column_count"] == 6
    assert summary["missing_cells"] == 2
    assert summary["duplicate_rows"] == 1
    assert summary["constant_column_count"] == 1  # 'country' is all 'USA'

    # Check issues detected and flagged for Stage 3
    issues = data["issues"]
    assert len(issues) >= 3

    issue_types = [i["issue_type"] for i in issues]
    assert "missing_values" in issue_types
    assert "duplicate_rows" in issue_types
    assert "constant_column" in issue_types

    # Verify that cleanable issues have stage_target: 'cleaning'
    for issue in issues:
        if issue["issue_type"] in ("missing_values", "duplicate_rows", "constant_column"):
            assert issue.get("actionable_in_stage_3") is True
            assert issue.get("stage_target") == "cleaning"


def test_stage_3_cleaning_preview(uploaded_dataset_id):
    """Test previewing a median imputation on salary without mutating storage."""
    payload = {
        "action": "impute_missing",
        "column": "salary",
        "strategy": "median"
    }
    resp = client.post(f"/api/datasets/{uploaded_dataset_id}/clean/preview", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    # Verify 7 explainability pillars
    explanation = data["explanation"]
    assert explanation["module_name"] == "Cleaning & Missing-Value Handling"
    assert "Median Imputation" in explanation["technique_used"]
    assert len(explanation["what_happened"]) > 0
    assert len(explanation["why_it_happened"]) > 0
    assert len(explanation["selection_rationale"]) > 0
    assert len(explanation["impact_summary"]) > 0
    assert len(explanation["alternatives"]) >= 2
    assert len(explanation["when_to_use"]) > 0

    # Verify metrics before/after
    assert data["metrics_before"]["column_missing_count"] == 1
    assert data["metrics_after"]["column_missing_count"] == 0

    # Ensure storage was NOT mutated
    profile_resp = client.get(f"/api/datasets/{uploaded_dataset_id}/profile")
    assert profile_resp.json()["dataset_summary"]["missing_cells"] == 2


def test_stage_3_cleaning_apply_and_reprofiling_connection(uploaded_dataset_id):
    """
    Test connecting Stage 2 and Stage 3:
    1. Detect duplicate rows and missing salary in Stage 2.
    2. Apply deduplication in Stage 3.
    3. Apply median imputation to salary in Stage 3.
    4. Re-profile in Stage 2 to confirm issues are resolved.
    """
    # Step 1: Remove duplicates in Stage 3
    dedup_resp = client.post(
        f"/api/datasets/{uploaded_dataset_id}/clean/apply",
        json={"action": "drop_duplicates"}
    )
    assert dedup_resp.status_code == 200
    dedup_data = dedup_resp.json()
    assert dedup_data["duplicate_rows"] == 0
    assert dedup_data["row_count"] == 6

    # Step 2: Impute salary with median in Stage 3
    impute_resp = client.post(
        f"/api/datasets/{uploaded_dataset_id}/clean/apply",
        json={
            "action": "impute_missing",
            "column": "salary",
            "strategy": "median"
        }
    )
    assert impute_resp.status_code == 200
    impute_data = impute_resp.json()
    assert impute_data["metrics_after"]["column_missing_count"] == 0

    # Step 3: Connect back to Stage 2 Profiling to re-verify
    reprofile_resp = client.get(f"/api/datasets/{uploaded_dataset_id}/profile")
    assert reprofile_resp.status_code == 200
    new_profile = reprofile_resp.json()

    # Duplicate rows should now be 0
    assert new_profile["dataset_summary"]["duplicate_rows"] == 0
    # Missing cells should be reduced to 1 (only 'age' left)
    assert new_profile["dataset_summary"]["missing_cells"] == 1
    # Salary column profile should now have 0 missing
    salary_prof = new_profile["column_profiles"]["salary"]
    assert salary_prof["missing_count"] == 0
