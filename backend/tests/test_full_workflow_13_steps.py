"""Comprehensive integration test suite covering the 13-step ML Preprocessing & Modeling pipeline."""
import io
import pytest
import numpy as np
import pandas as pd
from fastapi.testclient import TestClient

from app.main import app
from app.services.version_service import version_service

client = TestClient(app)


@pytest.fixture
def workflow_dataset():
    """Create a multi-feature dataset for end-to-end 13-step validation."""
    csv_data = (
        "id,gender,education_level,income,credit_score,loan_amount,approved\n"
        "1,Male,Bachelor,65000,720,20000,Yes\n"
        "2,Female,Master,95000,780,35000,Yes\n"
        "3,Male,HighSchool,32000,590,8000,No\n"
        "4,Female,Bachelor,58000,640,15000,Yes\n"
        "5,Male,Doctorate,120000,820,50000,Yes\n"
        "6,Female,HighSchool,28000,540,5000,No\n"
        "7,Male,Master,88000,710,28000,Yes\n"
        "8,Female,Bachelor,54000,620,12000,No\n"
        "9,Male,Bachelor,62000,680,18000,Yes\n"
        "10,Female,Doctorate,135000,840,60000,Yes\n"
        "11,Male,HighSchool,31000,580,7000,No\n"
        "12,Female,Master,92000,760,32000,Yes\n"
    )
    files = {"file": ("loan_data.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")}
    resp = client.post("/api/datasets/upload", files=files)
    assert resp.status_code == 200
    return resp.json()["dataset_id"]


# --- Step 06: Data Encoding ---
def test_step_06_encoding_one_hot_and_label(workflow_dataset):
    """Test Step 06: One-Hot and Label Encoding."""
    # 1. Summary
    sum_resp = client.get(f"/api/datasets/{workflow_dataset}/encoding")
    assert sum_resp.status_code == 200
    sum_data = sum_resp.json()
    assert sum_data["total_categorical_columns"] >= 2

    # 2. Preview One-Hot on gender
    prev_resp = client.post(
        f"/api/datasets/{workflow_dataset}/encoding/preview",
        json={
            "columns": ["gender"],
            "method": "one_hot",
            "handle_unknown": "ignore"
        }
    )
    assert prev_resp.status_code == 200
    prev_data = prev_resp.json()
    assert "gender_Female" in prev_data["new_columns_created"] or "gender_Male" in prev_data["new_columns_created"]

    # 3. Apply One-Hot
    apply_resp = client.post(
        f"/api/datasets/{workflow_dataset}/encoding/apply",
        json={
            "columns": ["gender"],
            "method": "one_hot",
            "confirmed": True
        }
    )
    assert apply_resp.status_code == 200
    df, _, _ = version_service.get_current_dataset(workflow_dataset)
    assert "gender_Male" in df.columns or "gender_Female" in df.columns

    # 4. Apply Label encoding on education_level
    lbl_resp = client.post(
        f"/api/datasets/{workflow_dataset}/encoding/apply",
        json={
            "columns": ["education_level"],
            "method": "label",
            "confirmed": True
        }
    )
    assert lbl_resp.status_code == 200
    df_lbl, _, _ = version_service.get_current_dataset(workflow_dataset)
    assert pd.api.types.is_numeric_dtype(df_lbl["education_level"])


# --- Step 08: Dimensionality Reduction ---
def test_step_08_dimensionality_reduction_pca_and_svd(workflow_dataset):
    """Test Step 08: PCA & SVD subspace reduction."""
    # PCA preview
    pca_prev = client.post(
        f"/api/datasets/{workflow_dataset}/dimensionality/preview",
        json={
            "method": "pca",
            "n_components": 2,
            "scale_first": True
        }
    )
    assert pca_prev.status_code == 200
    pca_data = pca_prev.json()
    assert len(pca_data["new_component_names"]) == 2
    assert len(pca_data["explained_variance_ratio"]) == 2
    assert 0.0 <= pca_data["total_variance_explained"] <= 1.0


# --- Step 09: Feature Selection ---
def test_step_09_feature_selection_select_k_best(workflow_dataset):
    """Test Step 09: SelectKBest (k=3 default)."""
    sel_prev = client.post(
        f"/api/datasets/{workflow_dataset}/feature-selection/preview",
        json={
            "target_column": "loan_amount",
            "k": 2,
            "scoring_func": "f_regression"
        }
    )
    assert sel_prev.status_code == 200
    sel_data = sel_prev.json()
    assert len(sel_data["selected_features"]) == 2
    assert len(sel_data["feature_scores"]) >= 2
    assert sel_data["feature_scores"][0]["rank"] == 1


# --- Step 10: Train-Test Split ---
def test_step_10_train_test_split(workflow_dataset):
    """Test Step 10: Partitioning into X_train, X_test, y_train, y_test."""
    split_resp = client.post(
        f"/api/datasets/{workflow_dataset}/split",
        json={
            "target_column": "approved",
            "test_size": 0.25,
            "random_state": 42
        }
    )
    assert split_resp.status_code == 200
    split_data = split_resp.json()
    assert split_data["train_rows"] + split_data["test_rows"] == split_data["total_rows"]
    assert split_data["train_rows"] == 9
    assert split_data["test_rows"] == 3


# --- Steps 11, 12, 13: Model Fitting, Prediction, Evaluation ---
def test_step_11_12_13_modeling_pipeline(workflow_dataset):
    """Test Steps 11, 12, 13 end-to-end model workflow."""
    # First encode education and gender so features are numeric
    client.post(
        f"/api/datasets/{workflow_dataset}/encoding/apply",
        json={"columns": ["gender"], "method": "one_hot", "confirmed": True}
    )
    client.post(
        f"/api/datasets/{workflow_dataset}/encoding/apply",
        json={"columns": ["education_level"], "method": "label", "confirmed": True}
    )

    # Step 10: Split on loan_amount (regression)
    client.post(
        f"/api/datasets/{workflow_dataset}/split",
        json={"target_column": "loan_amount", "test_size": 0.25, "random_state": 42}
    )

    # Step 11: Fit Linear Regression
    fit_resp = client.post(
        f"/api/datasets/{workflow_dataset}/modeling/fit",
        json={"model_type": "linear_regression"}
    )
    assert fit_resp.status_code == 200
    fit_data = fit_resp.json()
    assert fit_data["task_type"] == "regression"
    assert fit_data["train_rows"] == 9

    # Step 12: Predict on X_test
    pred_resp = client.post(
        f"/api/datasets/{workflow_dataset}/modeling/predict",
        json={}
    )
    assert pred_resp.status_code == 200
    pred_data = pred_resp.json()
    assert pred_data["total_test_samples"] == 3
    assert len(pred_data["sample_predictions"]) == 3

    # Step 13: Evaluate (RMSE, R2, MAE, MSE)
    eval_resp = client.post(
        f"/api/datasets/{workflow_dataset}/modeling/evaluate",
        json={}
    )
    assert eval_resp.status_code == 200
    eval_data = eval_resp.json()
    assert eval_data["task_type"] == "regression"
    assert eval_data["rmse"] is not None
    assert eval_data["r2_score"] is not None
    assert eval_data["mae"] is not None
    assert "RMSE" in eval_data["educational_explanations"]
