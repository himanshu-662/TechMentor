"""Unit and integration tests for Step 12: Prediction (ModelingEngine, batch inference, What-If single prediction, probabilities, residuals, educational concepts)."""
import io
import pytest
import pandas as pd
from fastapi.testclient import TestClient

from app.main import app
from app.engines.menti_ai.education.concept_registry import concept_registry

client = TestClient(app)


@pytest.fixture
def trained_classification_pipeline():
    """Create a dataset, split it, and train a Logistic Regression model."""
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
    files = {"file": ("credit_pred.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")}
    upload_resp = client.post("/api/datasets/upload", files=files)
    assert upload_resp.status_code == 200
    dataset_id = upload_resp.json()["dataset_id"]

    # Step 10: Split
    split_resp = client.post(
        f"/api/datasets/{dataset_id}/split",
        json={
            "target_column": "approved",
            "test_size": 0.25,
            "random_state": 42
        }
    )
    assert split_resp.status_code == 200

    # Step 11: Fit Logistic Regression
    fit_resp = client.post(
        f"/api/datasets/{dataset_id}/modeling/fit",
        json={"model_type": "logistic_regression"}
    )
    assert fit_resp.status_code == 200
    return dataset_id


@pytest.fixture
def trained_regression_pipeline():
    """Create a dataset, split it, and train a Linear Regression model."""
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
    files = {"file": ("salary_pred.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")}
    upload_resp = client.post("/api/datasets/upload", files=files)
    assert upload_resp.status_code == 200
    dataset_id = upload_resp.json()["dataset_id"]

    # Step 10: Split on salary
    split_resp = client.post(
        f"/api/datasets/{dataset_id}/split",
        json={
            "target_column": "salary",
            "test_size": 0.25,
            "random_state": 42
        }
    )
    assert split_resp.status_code == 200

    # Step 11: Fit Linear Regression
    fit_resp = client.post(
        f"/api/datasets/{dataset_id}/modeling/fit",
        json={"model_type": "linear_regression"}
    )
    assert fit_resp.status_code == 200
    return dataset_id


def test_batch_predict_classification(trained_classification_pipeline):
    """Test Step 12 batch prediction on classification test partition."""
    resp = client.post(
        f"/api/datasets/{trained_classification_pipeline}/modeling/predict",
        json={}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["dataset_id"] == trained_classification_pipeline
    assert data["task_type"] == "classification"
    assert data["total_test_samples"] == 3
    assert len(data["sample_predictions"]) == 3
    assert data["inference_latency_ms"] is not None
    assert data["explanation"]["title"] != ""
    assert data["summary_stats"] is not None
    assert "class_distribution_predicted" in data["summary_stats"]
    
    # Check individual prediction item
    item = data["sample_predictions"][0]
    assert item["index"] == 1
    assert item["predicted"] is not None
    assert item["probabilities"] is not None
    assert "0" in item["probabilities"] or "1" in item["probabilities"]


def test_batch_predict_regression(trained_regression_pipeline):
    """Test Step 12 batch prediction on regression test partition with residuals."""
    resp = client.post(
        f"/api/datasets/{trained_regression_pipeline}/modeling/predict",
        json={}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["task_type"] == "regression"
    assert data["total_test_samples"] == 3
    assert len(data["sample_predictions"]) == 3
    assert data["summary_stats"] is not None
    assert "mae" in data["summary_stats"]
    assert "mean_residual" in data["summary_stats"]

    # Check residuals
    item = data["sample_predictions"][0]
    assert item["residual"] is not None
    assert isinstance(item["predicted"], (int, float))


def test_single_predict_what_if_simulator(trained_classification_pipeline):
    """Test Step 12 What-If single-instance prediction playground."""
    custom_input = {
        "age": 40,
        "income": 90000,
        "credit_score": 750,
        "debt_ratio": 0.28,
        "loan_amount": 30000
    }
    resp = client.post(
        f"/api/datasets/{trained_classification_pipeline}/modeling/predict-single",
        json={"features": custom_input}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["dataset_id"] == trained_classification_pipeline
    assert data["predicted"] in ["0", "1", 0, 1]
    assert data["confidence"] is not None
    assert 0.0 <= data["confidence"] <= 1.0
    assert data["probabilities"] is not None


def test_get_sample_instance_for_playground(trained_regression_pipeline):
    """Test retrieving sample instance features and defaults for the What-If playground."""
    resp = client.get(
        f"/api/datasets/{trained_regression_pipeline}/modeling/sample-instance"
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["dataset_id"] == trained_regression_pipeline
    assert data["target_column"] == "salary"
    assert data["task_type"] == "regression"
    assert len(data["features"]) == 3
    assert "experience" in [f["name"] for f in data["features"]]
    assert "sample_values" in data
    assert len(data["sample_values"]) == 3


def test_prediction_educational_concepts_registered():
    """Verify Step 12 educational concepts exist in registry."""
    concept_ids = ["prediction", "probability_calibration", "residuals", "decision_threshold"]
    for c_id in concept_ids:
        c = concept_registry.get_concept(c_id)
        assert c is not None
        assert c.title != ""
        assert c.beginner_explanation != ""
        assert c.interview_tip != ""
        assert c.knowledge_check is not None


def test_download_model_pickle_artifact(trained_classification_pipeline):
    """Verify downloading and deserializing the trained model pickle (.pkl) artifact."""
    import pickle
    import numpy as np

    # 1. Download active model
    resp = client.get(
        f"/api/datasets/{trained_classification_pipeline}/modeling/download"
    )
    assert resp.status_code == 200
    assert "application/octet-stream" in resp.headers.get("content-type", "")
    assert "attachment" in resp.headers.get("content-disposition", "")

    # 2. Deserialize pickle payload
    artifact = pickle.loads(resp.content)
    assert isinstance(artifact, dict)
    assert "model" in artifact
    assert "feature_names" in artifact
    assert "target_col" in artifact
    assert artifact["target_col"] == "approved"
    assert artifact["task_type"] == "classification"

    # 3. Test that deserialized scikit-learn model predicts correctly
    fitted_model = artifact["model"]
    feat_names = artifact["feature_names"]
    test_sample = np.array([[30, 50000, 700, 0.3, 15000]])
    sample_pred = fitted_model.predict(test_sample)
    assert len(sample_pred) == 1

    # 4. Download by specific model ID
    model_id = artifact["model_id"]
    spec_resp = client.get(
        f"/api/datasets/{trained_classification_pipeline}/modeling/models/{model_id}/download"
    )
    assert spec_resp.status_code == 200
    spec_artifact = pickle.loads(spec_resp.content)
    assert spec_artifact["model_id"] == model_id


def test_get_original_schema_and_sample_rows(trained_classification_pipeline):
    """Test retrieving untouched original feature schema and sample historical rows."""
    resp = client.get(
        f"/api/datasets/{trained_classification_pipeline}/modeling/original-schema"
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["dataset_id"] == trained_classification_pipeline
    assert data["target_column"] == "approved"
    assert data["task_type"] == "classification"
    assert len(data["features"]) > 0
    assert len(data["sample_rows"]) > 0
    assert "_row_index" in data["sample_rows"][0]
    assert "age" in [f["name"] for f in data["features"]]


def test_live_predict_with_original_human_inputs(trained_classification_pipeline):
    """Test executing real-time live prediction on raw human dictionary inputs."""
    raw_inputs = {
        "age": 42,
        "income": 125000,
        "credit_score": 820,
        "debt_ratio": 0.16,
        "loan_amount": 50000
    }
    resp = client.post(
        f"/api/datasets/{trained_classification_pipeline}/modeling/predict-live",
        json={"inputs": raw_inputs}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["dataset_id"] == trained_classification_pipeline
    assert data["target_column"] == "approved"
    assert data["predicted"] in ["0", "1", 0, 1]
    assert data["confidence"] is not None
    assert data["probabilities"] is not None
    assert "transformed_vector" in data
    assert len(data["transformed_vector"]) > 0
    assert "explanation" in data


def test_predict_batch_new_records(trained_classification_pipeline):
    """Test batch prediction on a list of unseen unlabelled records."""
    records = [
        {"age": 28, "income": 48000, "credit_score": 620, "debt_ratio": 0.35, "loan_amount": 11000},
        {"age": 45, "income": 110000, "credit_score": 790, "debt_ratio": 0.20, "loan_amount": 35000},
        {"age": 58, "income": 135000, "credit_score": 830, "debt_ratio": 0.14, "loan_amount": 40000}
    ]
    resp = client.post(
        f"/api/datasets/{trained_classification_pipeline}/modeling/predict-batch",
        json={"records": records}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["dataset_id"] == trained_classification_pipeline
    assert data["total_records"] == 3
    assert len(data["preview_rows"]) == 3
    assert data["target_column"] == "approved"
    assert "predicted_approved" in data["columns"]
    assert "prediction_confidence" in data["columns"]
    assert data["summary_stats"] is not None
    assert "class_distribution_predicted" in data["summary_stats"]
    assert data["csv_download_available"] is True


def test_predict_batch_file_upload(trained_classification_pipeline):
    """Test batch prediction by uploading a new unlabelled CSV dataset file."""
    unlabelled_csv = (
        "age,income,credit_score,debt_ratio,loan_amount\n"
        "22,30000,560,0.50,5000\n"
        "39,89000,760,0.28,30000\n"
        "47,120000,800,0.18,48000\n"
        "30,51000,660,0.32,14000\n"
    )
    files = {"file": ("new_unlabelled_applicants.csv", io.BytesIO(unlabelled_csv.encode("utf-8")), "text/csv")}
    resp = client.post(
        f"/api/datasets/{trained_classification_pipeline}/modeling/predict-file",
        files=files
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["dataset_id"] == trained_classification_pipeline
    assert data["total_records"] == 4
    assert len(data["preview_rows"]) == 4
    for row in data["preview_rows"]:
        assert row["predicted"] in ["0", "1", 0, 1]
        assert row["confidence"] is not None
        assert row["probabilities"] is not None


def test_predict_template_generation(trained_classification_pipeline):
    """Test retrieving prediction CSV template and unlabelled sample rows."""
    resp = client.get(
        f"/api/datasets/{trained_classification_pipeline}/modeling/predict-template"
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["dataset_id"] == trained_classification_pipeline
    assert data["target_column"] == "approved"
    assert "approved" not in data["expected_columns"]
    assert "income" in data["expected_columns"]
    assert "csv_template" in data
    assert "income" in data["csv_template"]
    assert len(data["sample_template_rows"]) > 0


def test_download_enriched_predictions_csv(trained_classification_pipeline):
    """Test downloading the enriched predictions CSV containing inputs + predictions + probabilities."""
    # 1. Run batch prediction to populate enriched file
    records = [
        {"age": 33, "income": 65000, "credit_score": 710, "debt_ratio": 0.25, "loan_amount": 18000}
    ]
    pred_resp = client.post(
        f"/api/datasets/{trained_classification_pipeline}/modeling/predict-batch",
        json={"records": records}
    )
    assert pred_resp.status_code == 200

    # 2. Download predictions CSV
    resp = client.get(
        f"/api/datasets/{trained_classification_pipeline}/modeling/download-predictions"
    )
    assert resp.status_code == 200
    assert "text/csv" in resp.headers.get("content-type", "")
    assert "attachment" in resp.headers.get("content-disposition", "")
    csv_text = resp.content.decode("utf-8")
    assert "predicted_approved" in csv_text
    assert "prediction_confidence" in csv_text


def test_predict_batch_regression_pipeline(trained_regression_pipeline):
    """Test batch prediction on new records for continuous regression target."""
    records = [
        {"experience": 5, "education_years": 16, "test_score": 80},
        {"experience": 10, "education_years": 18, "test_score": 92}
    ]
    resp = client.post(
        f"/api/datasets/{trained_regression_pipeline}/modeling/predict-batch",
        json={"records": records}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["task_type"] == "regression"
    assert data["target_column"] == "salary"
    assert data["total_records"] == 2
    assert "predicted_salary" in data["columns"]
    assert data["summary_stats"] is not None
    assert "mean_predicted" in data["summary_stats"]



