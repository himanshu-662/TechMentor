"""Unit and integration tests for Step 10: Train-Test Split (SplitEngine, Stratification, Leakage Prevention)."""
import io
import pytest
import pandas as pd
from fastapi.testclient import TestClient

from app.main import app
from app.split.split_engine import SplitEngine
from app.engines.menti_ai.education.concept_registry import concept_registry

client = TestClient(app)


@pytest.fixture
def split_test_dataset():
    """Create a dataset for train-test split testing with both balanced and imbalanced targets."""
    csv_data = (
        "age,income,credit_score,debt_ratio,loan_amount,approved,house_price\n"
        "25,45000,650,0.25,12000,0,250000\n"
        "38,82000,740,0.35,28000,1,420000\n"
        "45,115000,810,0.18,45000,1,580000\n"
        "29,38000,590,0.48,8000,0,190000\n"
        "52,95000,720,0.30,32000,1,490000\n"
        "31,54000,680,0.22,15000,0,310000\n"
        "42,130000,830,0.15,55000,1,650000\n"
        "24,31000,570,0.55,6000,0,150000\n"
        "36,78000,710,0.38,25000,1,390000\n"
        "49,105000,790,0.20,40000,1,510000\n"
        "27,42000,610,0.42,10000,0,220000\n"
        "55,140000,850,0.12,65000,1,720000\n"
    )
    files = {"file": ("credit_split.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")}
    resp = client.post("/api/datasets/upload", files=files)
    assert resp.status_code == 200
    return resp.json()["dataset_id"]


def test_split_summary_endpoint(split_test_dataset):
    """Test retrieving train-test split readiness summary."""
    resp = client.get(f"/api/datasets/{split_test_dataset}/split/summary")
    assert resp.status_code == 200
    data = resp.json()
    assert data["dataset_id"] == split_test_dataset
    assert data["total_rows"] == 12
    assert data["total_columns"] == 7
    assert data["can_execute"] is True
    assert "approved" in data["potential_target_columns"]
    assert data["recommended_target"] is not None


def test_split_execution_classification_stratified(split_test_dataset):
    """Test executing stratified train-test split on binary target."""
    resp = client.post(
        f"/api/datasets/{split_test_dataset}/split",
        json={
            "target_column": "approved",
            "test_size": 0.25,
            "random_state": 42,
            "stratify": True
        }
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["target_column"] == "approved"
    assert data["target_type"] == "classification"
    assert data["total_rows"] == 12
    assert data["train_rows"] == 9
    assert data["test_rows"] == 3
    assert len(data["sample_rows"]) > 0
    assert "train_counts" in data["target_distribution"]
    assert "test_counts" in data["target_distribution"]
    assert len(data["leakage_safeguards"]) > 0
    assert "Train-Test Split" in data["explanation"]["title"]

    # Verify partitions were saved to disk and can be loaded
    X_train, X_test, y_train, y_test, target_col = SplitEngine.load_split(split_test_dataset)
    assert len(X_train) == 9
    assert len(X_test) == 3
    assert target_col == "approved"
    assert "approved" not in X_train.columns


def test_split_execution_regression(split_test_dataset):
    """Test executing train-test split on continuous regression target."""
    resp = client.post(
        f"/api/datasets/{split_test_dataset}/split",
        json={
            "target_column": "house_price",
            "test_size": 0.3,
            "random_state": 42,
            "stratify": False
        }
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["target_column"] == "house_price"
    assert data["target_type"] == "regression"
    assert "train_mean" in data["target_distribution"]
    assert "test_mean" in data["target_distribution"]


def test_split_legacy_route_compatibility(split_test_dataset):
    """Test legacy /api/split/{dataset_id} route compatibility."""
    resp = client.post(
        f"/api/split/{split_test_dataset}",
        json={
            "target_column": "approved",
            "test_size": 0.2,
            "random_state": 42
        }
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True


def test_split_invalid_target_fails(split_test_dataset):
    """Test splitting with a non-existent target column raises 400 error."""
    resp = client.post(
        f"/api/datasets/{split_test_dataset}/split",
        json={
            "target_column": "non_existent_target_col",
            "test_size": 0.2
        }
    )
    assert resp.status_code == 400


def test_train_test_split_concepts_in_registry():
    """Verify train-test split educational concepts exist in registry."""
    concept_names = ["train_test_split", "stratified_sampling", "data_leakage", "cross_validation"]
    for name in concept_names:
        concept = concept_registry.get_concept(name)
        assert concept is not None
        assert concept.title != ""
        assert concept.beginner_explanation != ""
        assert concept.why_it_matters != ""
