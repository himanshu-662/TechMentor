"""Tests for RAG AI Mentor live prediction capability with trained models."""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.engines.menti_ai.rag.prediction_helper import PredictionHelper
from app.engines.menti_ai.rag.query_router import QueryRouter
from app.engines.menti_ai.rag.models.rag_models import QueryTypeEnum

client = TestClient(app)


def test_prediction_input_extraction_formats():
    """Test extracting input variables across various query formats."""
    # Format 1: Key=Value
    q1 = "predict for Age=25, Fare=50.5, Pclass=1, Sex='female'"
    res1 = PredictionHelper.extract_feature_inputs(q1)
    assert res1.get("Age") == 25
    assert res1.get("Fare") == 50.5
    assert res1.get("Pclass") == 1
    assert res1.get("Sex") == "female"

    # Format 2: Key: Value
    q2 = "what will the model predict with Age: 30, Fare: 100, Pclass: 2?"
    res2 = PredictionHelper.extract_feature_inputs(q2)
    assert res2.get("Age") == 30
    assert res2.get("Fare") == 100
    assert res2.get("Pclass") == 2

    # Format 3: JSON
    q3 = 'predict output for {"Age": 45, "Fare": 75.2, "Pclass": 3, "Sex": "male"}'
    res3 = PredictionHelper.extract_feature_inputs(q3)
    assert res3.get("Age") == 45
    assert res3.get("Fare") == 75.2
    assert res3.get("Pclass") == 3
    assert res3.get("Sex") == "male"

    # Format 4: Natural language 'key is val'
    q4 = "if Age is 22 and Fare is 7.25 and Pclass is 3, what is the prediction?"
    res4 = PredictionHelper.extract_feature_inputs(q4)
    assert res4.get("Age") == 22
    assert res4.get("Fare") == 7.25
    assert res4.get("Pclass") == 3


def test_query_router_prediction_classification():
    """Test that prediction queries are classified as QueryTypeEnum.PREDICTION."""
    assert QueryRouter.route_query("predict for Age=25, Fare=50") == QueryTypeEnum.PREDICTION
    assert QueryRouter.route_query("what would the model predict if age is 30?") == QueryTypeEnum.PREDICTION
    assert QueryRouter.route_query("what will my model predict for {'Fare': 100}?") == QueryTypeEnum.PREDICTION
    assert QueryRouter.route_query("predict output for Pclass=1, Age=40") == QueryTypeEnum.PREDICTION


def test_api_rag_ask_prediction_with_active_model():
    """Test end-to-end RAG query answering for a prediction request."""
    # 1. Upload a dataset and train a model
    csv_data = "Age,Fare,Pclass,Survived\n22.0,7.25,3,0\n38.0,71.28,1,1\n26.0,7.92,3,1\n35.0,53.1,1,1\n54.0,51.86,1,0\n2.0,21.07,3,0\n27.0,11.13,3,1\n14.0,30.07,2,1\n4.0,16.7,3,1\n58.0,26.55,1,1\n20.0,8.05,3,0\n39.0,31.27,3,0\n14.0,7.85,3,0\n55.0,16.0,2,1\n2.0,29.12,3,0\n"
    files = {"file": ("test_predict_rag.csv", csv_data, "text/csv")}
    upload_res = client.post("/api/v1/datasets/upload", files=files)
    assert upload_res.status_code == 200
    dataset_id = upload_res.json()["dataset_id"]

    # Split dataset (Step 10)
    split_res = client.post(f"/api/v1/datasets/{dataset_id}/split", json={
        "target_column": "Survived",
        "split_ratio": 0.3,
        "stratified": True,
        "random_state": 42
    })
    assert split_res.status_code == 200

    # Fit model (Step 11)
    fit_res = client.post(f"/api/v1/datasets/{dataset_id}/modeling/fit", json={
        "model_type": "logistic_regression",
        "task_type": "classification",
        "hyperparameters": {"C": 1.0}
    })
    assert fit_res.status_code == 200

    # 2. Ask AI Mentor to predict using query with input variables
    rag_payload = {
        "question": "predict for Age=25, Fare=50, Pclass=1",
        "dataset_id": dataset_id
    }
    rag_res = client.post("/api/v1/rag/ask", json=rag_payload)
    assert rag_res.status_code == 200
    data = rag_res.json()

    assert data["query_type"] == "PREDICTION"
    assert data["prediction_result"] is not None
    assert "predicted" in data["prediction_result"]
    assert "Logistic Regression" in data["prediction_result"]["model_type"] or "logistic" in data["prediction_result"]["model_type"].lower()
    assert data["prediction_result"]["raw_inputs"]["Age"] == 25
    assert data["prediction_result"]["raw_inputs"]["Fare"] == 50
    assert data["prediction_result"]["raw_inputs"]["Pclass"] == 1
    assert data["structured_output"] is not None
    assert "Direct Answer" in data["answer"] or "predicted" in data["answer"].lower()
