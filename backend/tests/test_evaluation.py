"""Unit and integration tests for Step 13: Evaluation (Generalization metrics, confusion matrices, classification reports, regression errors, multi-model leaderboard)."""
import io
import pytest
import pandas as pd
from fastapi.testclient import TestClient

from app.main import app
from app.engines.menti_ai.education.concept_registry import concept_registry

client = TestClient(app)


@pytest.fixture
def evaluated_classification_dataset():
    """Create a dataset, split, fit Logistic Regression, and generate predictions ready for Step 13 evaluation."""
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
    files = {"file": ("credit_eval.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")}
    upload_resp = client.post("/api/datasets/upload", files=files)
    assert upload_resp.status_code == 200
    dataset_id = upload_resp.json()["dataset_id"]

    # Step 10: Split
    client.post(
        f"/api/datasets/{dataset_id}/split",
        json={"target_column": "approved", "test_size": 0.25, "random_state": 42}
    )

    # Step 11: Fit Logistic Regression
    client.post(
        f"/api/datasets/{dataset_id}/modeling/fit",
        json={"model_type": "logistic_regression"}
    )

    # Step 11b: Also Fit Decision Tree to test multi-model leaderboard!
    client.post(
        f"/api/datasets/{dataset_id}/modeling/fit",
        json={"model_type": "decision_tree_classifier"}
    )

    # Step 12: Predict
    client.post(f"/api/datasets/{dataset_id}/modeling/predict", json={})
    return dataset_id


@pytest.fixture
def evaluated_regression_dataset():
    """Create a dataset, split, fit Linear Regression, and predict ready for Step 13 evaluation."""
    csv_data = (
        "experience,education_years,test_score,salary\n"
        "1,12,60,35000\n"
        "3,14,70,45000\n"
        "5,16,80,62000\n"
        "8,18,85,85000\n"
        "10,18,90,98000\n"
        "2,12,65,38000\n"
        "6,16,82,69000\n"
        "12,20,95,115000\n"
        "4,14,75,52000\n"
        "7,16,88,77000\n"
        "9,18,92,92000\n"
        "11,18,94,104000\n"
    )
    files = {"file": ("salary_eval.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")}
    upload_resp = client.post("/api/datasets/upload", files=files)
    assert upload_resp.status_code == 200
    dataset_id = upload_resp.json()["dataset_id"]

    # Step 10: Split on salary
    client.post(
        f"/api/datasets/{dataset_id}/split",
        json={"target_column": "salary", "test_size": 0.25, "random_state": 42}
    )

    # Step 11: Fit Linear Regression
    client.post(
        f"/api/datasets/{dataset_id}/modeling/fit",
        json={"model_type": "linear_regression"}
    )

    # Step 11b: Also Fit Ridge Regression
    client.post(
        f"/api/datasets/{dataset_id}/modeling/fit",
        json={"model_type": "ridge"}
    )

    # Step 12: Predict
    client.post(f"/api/datasets/{dataset_id}/modeling/predict", json={})
    return dataset_id


def test_evaluate_classification_metrics(evaluated_classification_dataset):
    """Test Step 13 classification evaluation metrics, confusion matrix, and leaderboard."""
    resp = client.post(
        f"/api/datasets/{evaluated_classification_dataset}/modeling/evaluate",
        json={}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["dataset_id"] == evaluated_classification_dataset
    assert data["task_type"] == "classification"
    assert data["accuracy"] is not None
    assert 0.0 <= data["accuracy"] <= 1.0
    assert data["precision"] is not None
    assert data["recall"] is not None
    assert data["f1_score"] is not None

    # Confusion Matrix
    cm = data["confusion_matrix"]
    assert cm is not None
    assert len(cm["labels"]) >= 2
    assert len(cm["matrix"]) >= 2

    # Classification Report
    cr = data["classification_report"]
    assert cr is not None
    assert len(cr) >= 1

    # Leaderboard
    assert data["leaderboard"] is not None
    assert len(data["leaderboard"]) >= 2
    assert "F1-Score" in data["leaderboard"][0]["primary_metric"]


def test_evaluate_regression_metrics(evaluated_regression_dataset):
    """Test Step 13 regression evaluation metrics (RMSE, R², MAE, MSE) and leaderboard."""
    resp = client.post(
        f"/api/datasets/{evaluated_regression_dataset}/modeling/evaluate",
        json={}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["task_type"] == "regression"
    assert data["rmse"] is not None
    assert data["r2_score"] is not None
    assert data["mae"] is not None
    assert data["mse"] is not None
    assert "RMSE" in data["educational_explanations"]
    assert "R2" in data["educational_explanations"]

    # Leaderboard
    assert data["leaderboard"] is not None
    assert len(data["leaderboard"]) >= 2
    assert "R² Score" in data["leaderboard"][0]["primary_metric"]


def test_evaluation_educational_concepts_in_registry():
    """Verify Step 13 educational concepts are registered and queryable."""
    concepts = ["model_evaluation", "confusion_matrix", "regression_metrics"]
    for c_id in concepts:
        c = concept_registry.get_concept(c_id)
        assert c is not None
        assert c.title != ""
        assert c.beginner_explanation != ""
        assert c.interview_tip != ""
        assert c.knowledge_check is not None
