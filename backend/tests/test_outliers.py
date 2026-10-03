import io
import pytest
import pandas as pd
import numpy as np
from fastapi.testclient import TestClient
from app.main import app
from app.outliers.detectors import detect_outliers_iqr, detect_outliers_zscore, detect_outliers_modified_zscore
from app.outliers.recommendations import generate_outlier_recommendation
from app.services.version_service import version_service

client = TestClient(app)


@pytest.fixture
def sample_outlier_dataset():
    """Create and upload a dataset with known normal and outlier values."""
    # Column 'income': skewed with high outliers (100000, 250000)
    # Column 'exam_score': symmetric ~N(70, 10) with one outlier (15)
    # Column 'constant_val': 42 for all rows (zero variance)
    # Column 'category': text strings
    data = {
        "id": list(range(1, 21)),
        "income": [3000, 3200, 3100, 2900, 3050, 3300, 2800, 3150, 3250, 3000,
                   3100, 2950, 3050, 3150, 3200, 2900, 3100, 3300, 100000, 250000],
        "exam_score": [70.0, 72.0, 68.0, 71.0, 69.0, 73.0, 67.0, 70.0, 71.0, 69.0,
                       72.0, 68.0, 74.0, 66.0, 70.0, 71.0, 69.0, 72.0, 68.0, 15.0],
        "constant_val": [42.0] * 20,
        "category": ["A", "B", "A", "B", "C", "A", "B", "C", "A", "B",
                     "C", "A", "B", "C", "A", "B", "C", "A", "B", "C"]
    }
    df = pd.DataFrame(data)
    csv_bytes = df.to_csv(index=False).encode("utf-8")

    res = client.post(
        "/api/datasets/upload",
        files={"file": ("outlier_test.csv", io.BytesIO(csv_bytes), "text/csv")}
    )
    assert res.status_code == 200
    dataset_id = res.json()["dataset_id"]
    return dataset_id, df


def test_iqr_detector_math():
    """Verify IQR calculation, boundaries, and detection accuracy."""
    series = pd.Series([10, 12, 11, 13, 12, 10, 14, 11, 12, 100])
    mask, lower, upper, calc, stats = detect_outliers_iqr(series, multiplier=1.5)

    assert lower is not None
    assert upper is not None
    assert mask.sum() == 1  # only 100 is flagged
    assert mask.iloc[-1] == True
    assert stats["q1"] <= stats["q3"]
    assert len(calc.steps) >= 5


def test_zscore_detector_math_and_zero_variance():
    """Verify standard Z-score calculation and safe zero variance handling."""
    series = pd.Series([10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 100.0])
    mask, lower, upper, calc, stats = detect_outliers_zscore(series, threshold=2.0)
    assert mask.iloc[-1] == True

    # Zero variance series
    const_series = pd.Series([5.0] * 20)
    c_mask, c_lower, c_upper, c_calc, c_stats = detect_outliers_zscore(const_series, threshold=3.0)
    assert c_mask.sum() == 0
    assert c_stats["std"] == 0.0
    assert "Standard Deviation (σ) = 0.0" in c_calc.steps[1]


def test_modified_zscore_detector_and_mad_zero():
    """Verify Modified Z-Score with MAD and fallback for MAD=0."""
    series = pd.Series([20, 21, 19, 20, 22, 20, 19, 21, 20, 500])
    mask, lower, upper, calc, stats = detect_outliers_modified_zscore(series, threshold=3.5)
    assert mask.iloc[-1] == True
    assert stats["mad"] is not None

    # Series where >50% values are identical
    repeated_series = pd.Series([10, 10, 10, 10, 10, 10, 10, 15, 20, 1000])
    r_mask, r_lower, r_upper, r_calc, r_stats = detect_outliers_modified_zscore(repeated_series, threshold=3.5)
    assert r_mask.iloc[-1] == True


def test_recommendation_skewed_vs_symmetric():
    """Verify deterministic recommendation logic based on distribution skewness."""
    # Heavily skewed
    skewed = pd.Series([1, 2, 1, 3, 2, 1, 2, 1, 1000, 5000])
    rec_skewed = generate_outlier_recommendation(skewed, "skewed_col")
    assert rec_skewed.recommended_method == "iqr"
    assert "skewed" in rec_skewed.reason.lower()

    # Symmetric Gaussian
    np.random.seed(42)
    symmetric = pd.Series(np.random.normal(loc=100, scale=10, size=500))
    rec_sym = generate_outlier_recommendation(symmetric, "symmetric_col")
    assert rec_sym.recommended_method == "zscore"
    assert "symmetric" in rec_sym.reason.lower()


def test_api_get_dataset_outlier_summary(sample_outlier_dataset):
    """Test GET /api/datasets/{dataset_id}/outliers returns all numerical columns."""
    dataset_id, _ = sample_outlier_dataset
    res = client.get(f"/api/datasets/{dataset_id}/outliers")
    assert res.status_code == 200
    data = res.json()

    assert data["dataset_id"] == dataset_id
    assert data["numerical_columns_count"] >= 3
    col_names = [c["column"] for c in data["columns"]]
    assert "income" in col_names
    assert "exam_score" in col_names


def test_api_get_column_outlier_detail(sample_outlier_dataset):
    """Test GET /api/datasets/{dataset_id}/outliers/{column} returns calculation and records."""
    dataset_id, _ = sample_outlier_dataset
    res = client.get(f"/api/datasets/{dataset_id}/outliers/income?method=iqr&multiplier=1.5")
    assert res.status_code == 200
    data = res.json()

    assert data["column"] == "income"
    assert data["method"] == "iqr"
    assert data["outlier_count"] == 2  # 100000 and 250000
    assert len(data["calculation"]["steps"]) >= 5
    assert len(data["outlier_records_sample"]) == 2
    assert data["outlier_records_sample"][0]["direction"] == "high"


def test_api_preview_treatment_does_not_mutate_dataset(sample_outlier_dataset):
    """Verify non-destructive preview does not alter the dataset."""
    dataset_id, _ = sample_outlier_dataset
    orig_hash = version_service.compute_file_hash(version_service.get_session_dir(dataset_id) / "current" / f"{dataset_id}.csv")

    preview_payload = {
        "column": "income",
        "detection_method": "iqr",
        "parameters": {"multiplier": 1.5},
        "treatment": "cap"
    }
    res = client.post(f"/api/datasets/{dataset_id}/outliers/preview", json=preview_payload)
    assert res.status_code == 200
    data = res.json()

    assert data["before"]["outlier_count"] == 2
    assert data["after"]["outlier_count"] == 0
    assert data["values_capped"] == 2
    assert len(data["sample_changed_records"]) == 2

    # Verify current file was NOT modified
    after_preview_hash = version_service.compute_file_hash(version_service.get_session_dir(dataset_id) / "current" / f"{dataset_id}.csv")
    assert orig_hash == after_preview_hash


def test_api_apply_treatment_cap_and_versioning(sample_outlier_dataset):
    """Verify applying capping creates new version and preserves original byte-for-byte."""
    dataset_id, _ = sample_outlier_dataset
    orig_file_path = version_service.get_session_dir(dataset_id) / "original" / f"{dataset_id}.csv"
    orig_hash = version_service.compute_file_hash(orig_file_path)

    apply_payload = {
        "column": "income",
        "detection_method": "iqr",
        "parameters": {"multiplier": 1.5},
        "treatment": "cap",
        "confirmed": True
    }
    res = client.post(f"/api/datasets/{dataset_id}/outliers/apply", json=apply_payload)
    assert res.status_code == 200
    data = res.json()

    assert data["new_version"] == 1
    assert data["treatment"] == "cap"
    assert data["affected_rows"] == 2

    # Verify original file remains strictly byte-for-byte identical
    current_orig_hash = version_service.compute_file_hash(orig_file_path)
    assert orig_hash == current_orig_hash

    # Verify history is recorded
    hist_res = client.get(f"/api/datasets/{dataset_id}/outliers/history")
    assert hist_res.status_code == 200
    assert hist_res.json()["outlier_operations_count"] == 1


def test_api_apply_treatment_remove_and_undo(sample_outlier_dataset):
    """Verify applying row removal and then testing rollback undo."""
    dataset_id, _ = sample_outlier_dataset
    apply_payload = {
        "column": "exam_score",
        "detection_method": "zscore",
        "parameters": {"threshold": 3.0},
        "treatment": "remove",
        "confirmed": True
    }
    res = client.post(f"/api/datasets/{dataset_id}/outliers/apply", json=apply_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["after"]["row_count"] == 19  # One outlier row (15.0) removed

    # Undo operation
    undo_res = client.post(f"/api/datasets/{dataset_id}/cleaning/undo")
    assert undo_res.status_code == 200
    undo_data = undo_res.json()
    assert undo_data["row_count"] == 20  # Restored to 20 rows


def test_validation_rejects_categorical_and_invalid_inputs(sample_outlier_dataset):
    """Verify validation rejects categorical column, negative thresholds, and missing confirmation."""
    dataset_id, _ = sample_outlier_dataset

    # Categorical column rejection
    res1 = client.get(f"/api/datasets/{dataset_id}/outliers/category")
    assert res1.status_code == 400
    assert "categorical" in res1.json()["detail"].lower()

    # Invalid negative multiplier
    res2 = client.get(f"/api/datasets/{dataset_id}/outliers/income?multiplier=-1.0")
    assert res2.status_code == 400

    # Unconfirmed apply
    res3 = client.post(f"/api/datasets/{dataset_id}/outliers/apply", json={
        "column": "income",
        "detection_method": "iqr",
        "treatment": "cap",
        "confirmed": False
    })
    assert res3.status_code == 400
    assert "confirmation" in res3.json()["detail"].lower()


def test_api_apply_treatment_flag(sample_outlier_dataset):
    """Verify applying flag treatment creates indicator column without altering original values."""
    dataset_id, _ = sample_outlier_dataset
    apply_payload = {
        "column": "income",
        "detection_method": "iqr",
        "parameters": {"multiplier": 1.5},
        "treatment": "flag",
        "confirmed": True
    }
    res = client.post(f"/api/datasets/{dataset_id}/outliers/apply", json=apply_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["treatment"] == "flag"
    assert data["affected_rows"] == 2

    # Verify new indicator column exists in current dataset and values are unchanged
    df, _, _ = version_service.get_current_dataset(dataset_id)
    assert "income_is_outlier" in df.columns
    assert df["income_is_outlier"].sum() == 2
    # Verify original extreme values are intact
    assert 100000 in df["income"].values
    assert 250000 in df["income"].values


def test_preview_histogram_and_educational_impact(sample_outlier_dataset):
    """Verify preview response contains histogram_bins, skewness, and educational_impact."""
    dataset_id, _ = sample_outlier_dataset
    prev_payload = {
        "column": "income",
        "detection_method": "iqr",
        "parameters": {"multiplier": 1.5},
        "treatment": "cap"
    }
    res = client.post(f"/api/datasets/{dataset_id}/outliers/preview", json=prev_payload)
    assert res.status_code == 200
    data = res.json()
    assert "histogram_bins" in data["before"]
    assert len(data["before"]["histogram_bins"]) > 0
    assert "histogram_bins" in data["after"]
    assert "skewness" in data["before"]
    assert "skewness" in data["after"]
    assert "educational_impact" in data
    assert "summary" in data["educational_impact"]
