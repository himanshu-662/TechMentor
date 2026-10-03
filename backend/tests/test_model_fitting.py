"""Unit and integration tests for Step 11: Model Fitting (ModelingEngine, algorithms, hyperparameters, artifacts)."""
import io
import pytest
import pandas as pd
from fastapi.testclient import TestClient

from app.main import app
from app.split.split_engine import SplitEngine
from app.split.models import TrainTestSplitRequest
from app.modeling.modeling_engine import ModelingEngine
from app.engines.menti_ai.education.concept_registry import concept_registry

client = TestClient(app)


@pytest.fixture
def split_ready_dataset():
    """Create a dataset and partition it into train/test sets ready for Step 11 fitting."""
    csv_data = (
        "age,income,credit_score,debt_ratio,loan_amount,approved\n"
        "25,45000,650,0.25,12000,0\n"
        "38,82000,740,0.35,28000,1\n"
        "45,115000,810,0.18,45000,1\n"
        "29,38000,590,0.48,8000,0\n"
        "52,95000,720,0.30,32000,1\n"
        "31,54000,680,0.22,15000,0\n"
        "42,130000,830,0.15,55000,1\n"
        "24,31000,570,0.55,6000,0\n"
        "36,78000,710,0.38,25000,1\n"
        "49,105000,790,0.20,40000,1\n"
        "27,42000,610,0.42,10000,0\n"
        "55,140000,850,0.12,65000,1\n"
    )
    files = {"file": ("credit_model.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")}
    upload_resp = client.post("/api/datasets/upload", files=files)
    assert upload_resp.status_code == 200
    dataset_id = upload_resp.json()["dataset_id"]

    # Execute split
    split_resp = client.post(
        f"/api/datasets/{dataset_id}/split",
        json={
            "target_column": "approved",
            "test_size": 0.25,
            "random_state": 42,
            "stratify": True
        }
    )
    assert split_resp.status_code == 200
    return dataset_id


def test_modeling_summary_endpoint(split_ready_dataset):
    """Test retrieving Step 11 modeling readiness summary."""
    resp = client.get(f"/api/datasets/{split_ready_dataset}/modeling/summary")
    assert resp.status_code == 200
    data = resp.json()
    assert data["dataset_id"] == split_ready_dataset
    assert data["has_split"] is True
    assert data["train_rows"] == 9
    assert data["test_rows"] == 3
    assert data["target_column"] == "approved"
    assert data["target_type"] == "classification"
    assert data["feature_count"] == 5
    assert len(data["available_algorithms"]) > 0


def test_fit_logistic_regression(split_ready_dataset):
    """Test training logistic regression classifier."""
    resp = client.post(
        f"/api/datasets/{split_ready_dataset}/modeling/fit",
        json={
            "model_type": "logistic_regression",
            "hyperparameters": {"C": 1.0}
        }
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["model_type"] == "logistic_regression"
    assert data["task_type"] == "classification"
    assert data["train_rows"] == 9
    assert data["feature_count"] == 5
    assert len(data["feature_importances"]) == 5
    assert "income" in data["feature_importances"]
    assert "Model Fitting" in data["explanation"]["title"]


def test_fit_decision_tree_classifier(split_ready_dataset):
    """Test training decision tree classifier with max_depth."""
    resp = client.post(
        f"/api/datasets/{split_ready_dataset}/modeling/fit",
        json={
            "model_type": "decision_tree_classifier",
            "hyperparameters": {"max_depth": 3, "random_state": 42}
        }
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["model_type"] == "decision_tree_classifier"
    assert len(data["feature_importances"]) > 0


def test_fit_random_forest_classifier(split_ready_dataset):
    """Test training random forest ensemble classifier."""
    resp = client.post(
        f"/api/datasets/{split_ready_dataset}/modeling/fit",
        json={
            "model_type": "random_forest_classifier",
            "hyperparameters": {"n_estimators": 50, "max_depth": 4, "random_state": 42}
        }
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["model_type"] == "random_forest_classifier"


def test_fit_legacy_route_compatibility(split_ready_dataset):
    """Test legacy /api/modeling/{dataset_id}/fit route compatibility."""
    resp = client.post(
        f"/api/modeling/{split_ready_dataset}/fit",
        json={
            "model_type": "tree",  # Testing alias normalization
            "hyperparameters": {"max_depth": 2}
        }
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True


def test_model_fitting_concepts_in_registry():
    """Verify Step 11 educational concepts exist in registry."""
    concepts = ["model_fitting", "hyperparameters", "bias_variance_tradeoff"]
    for c_id in concepts:
        c = concept_registry.get_concept(c_id)
        assert c is not None
        assert c.title != ""
        assert c.beginner_explanation != ""
        assert c.interview_tip != ""


def test_fit_regression_and_unsupervised_models(split_ready_dataset):
    """Test training regression, ridge, lasso, and unsupervised models (KMeans, DBSCAN, Isolation Forest)."""
    # 1. Ridge Regression
    resp_ridge = client.post(
        f"/api/datasets/{split_ready_dataset}/modeling/fit",
        json={"model_type": "ridge", "hyperparameters": {"alpha": 1.0}}
    )
    assert resp_ridge.status_code == 200
    assert resp_ridge.json()["model_type"] == "ridge"

    # 2. Lasso Regression
    resp_lasso = client.post(
        f"/api/datasets/{split_ready_dataset}/modeling/fit",
        json={"model_type": "lasso", "hyperparameters": {"alpha": 0.5}}
    )
    assert resp_lasso.status_code == 200
    assert resp_lasso.json()["model_type"] == "lasso"

    # 3. KMeans (Unsupervised)
    resp_kmeans = client.post(
        f"/api/datasets/{split_ready_dataset}/modeling/fit",
        json={"model_type": "kmeans", "hyperparameters": {"n_clusters": 2}}
    )
    assert resp_kmeans.status_code == 200
    kmeans_data = resp_kmeans.json()
    assert kmeans_data["model_type"] == "kmeans"
    assert kmeans_data["task_type"] == "unsupervised"

    # 4. DBSCAN (Unsupervised)
    resp_dbscan = client.post(
        f"/api/datasets/{split_ready_dataset}/modeling/fit",
        json={"model_type": "dbscan", "hyperparameters": {"eps": 1.5, "min_samples": 2}}
    )
    assert resp_dbscan.status_code == 200
    assert resp_dbscan.json()["model_type"] == "dbscan"

    # 5. Isolation Forest (Unsupervised)
    resp_iforest = client.post(
        f"/api/datasets/{split_ready_dataset}/modeling/fit",
        json={"model_type": "isolation_forest", "hyperparameters": {"n_estimators": 25}}
    )
    assert resp_iforest.status_code == 200
    assert resp_iforest.json()["model_type"] == "isolation_forest"

