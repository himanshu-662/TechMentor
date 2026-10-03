"""Integration and unit tests for Step 09: Feature Selection (SelectKBest, F-Score, Mutual Information)."""
import io
import pytest
import pandas as pd
from fastapi.testclient import TestClient

from app.main import app
from app.services.version_service import version_service
from app.engines.menti_ai.education.concept_registry import concept_registry

client = TestClient(app)


@pytest.fixture
def multi_feature_dataset():
    """Create a dataset with numerical features and both classification and continuous targets."""
    csv_data = (
        "age,income,credit_score,debt_ratio,loan_amount,risk_class,fraud_score\n"
        "25,45000,650,0.25,12000,Low,12.5\n"
        "38,82000,740,0.35,28000,Medium,45.2\n"
        "45,115000,810,0.18,45000,Low,15.8\n"
        "29,38000,590,0.48,8000,High,88.4\n"
        "52,95000,720,0.30,32000,Medium,38.1\n"
        "31,54000,680,0.22,15000,Low,22.0\n"
        "42,130000,830,0.15,55000,Low,10.2\n"
        "24,31000,570,0.55,6000,High,92.5\n"
        "36,78000,710,0.38,25000,Medium,51.0\n"
        "49,105000,790,0.20,40000,Low,18.7\n"
        "27,42000,610,0.42,10000,High,79.9\n"
        "55,140000,850,0.12,65000,Low,8.5\n"
    )
    files = {"file": ("credit_risk.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")}
    resp = client.post("/api/datasets/upload", files=files)
    assert resp.status_code == 200
    return resp.json()["dataset_id"]


def test_feature_selection_summary(multi_feature_dataset):
    """Test retrieving feature selection dataset summary."""
    resp = client.get(f"/api/datasets/{multi_feature_dataset}/feature-selection/summary")
    assert resp.status_code == 200
    data = resp.json()
    assert data["dataset_id"] == multi_feature_dataset
    assert data["total_rows"] == 12
    assert "income" in data["numeric_features"]
    assert "risk_class" in data["potential_target_columns"]
    assert data["can_execute"] is True
    assert data["recommended_k"] >= 1


def test_feature_selection_preview_f_classif(multi_feature_dataset):
    """Test previewing SelectKBest with ANOVA F-test (f_classif)."""
    resp = client.post(
        f"/api/datasets/{multi_feature_dataset}/feature-selection/preview",
        json={
            "target_column": "risk_class",
            "k": 3,
            "scoring_func": "f_classif"
        }
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["target_column"] == "risk_class"
    assert len(data["selected_features"]) == 3
    assert len(data["removed_features"]) > 0
    assert len(data["feature_scores"]) == 6  # 6 numeric candidate features
    assert data["feature_scores"][0]["rank"] == 1
    assert data["feature_scores"][0]["score"] >= data["feature_scores"][1]["score"]
    assert "Feature Selection" in data["explanation"]["title"]


def test_feature_selection_preview_f_regression(multi_feature_dataset):
    """Test previewing SelectKBest with f_regression for continuous target."""
    resp = client.post(
        f"/api/datasets/{multi_feature_dataset}/feature-selection/preview",
        json={
            "target_column": "fraud_score",
            "k": 2,
            "score_func": "f_regression"  # Using alias score_func
        }
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["target_column"] == "fraud_score"
    assert len(data["selected_features"]) == 2
    assert "fraud_score" not in data["selected_features"]  # Target column excluded from candidate features


def test_feature_selection_preview_mutual_info(multi_feature_dataset):
    """Test previewing SelectKBest with mutual information."""
    resp = client.post(
        f"/api/datasets/{multi_feature_dataset}/feature-selection/preview",
        json={
            "target_column": "risk_class",
            "k": 2,
            "scoring_func": "mutual_info_classif"
        }
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["target_column"] == "risk_class"
    assert len(data["selected_features"]) == 2


def test_feature_selection_apply_unconfirmed_fails(multi_feature_dataset):
    """Test applying selection without explicit confirmation returns 400."""
    resp = client.post(
        f"/api/datasets/{multi_feature_dataset}/feature-selection/apply",
        json={
            "target_column": "risk_class",
            "k": 2,
            "scoring_func": "f_classif",
            "confirmed": False
        }
    )
    assert resp.status_code == 400


def test_feature_selection_apply_success(multi_feature_dataset):
    """Test applying feature selection successfully creates an immutable snapshot."""
    resp = client.post(
        f"/api/datasets/{multi_feature_dataset}/feature-selection/apply",
        json={
            "target_column": "risk_class",
            "k": 2,
            "scoring_func": "f_classif",
            "confirmed": True
        }
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["new_version"] is not None
    assert len(data["selected_features"]) == 2
    assert data["shape"]["columns"] == 3  # 2 selected features + 1 target column

    # Verify updated current dataset
    current_df, _, _ = version_service.get_current_dataset(multi_feature_dataset)
    assert len(current_df.columns) == 3
    assert "risk_class" in current_df.columns


def test_feature_selection_concepts_in_registry():
    """Verify feature selection educational concepts exist in registry."""
    concept_names = ["feature_selection", "select_k_best", "f_score", "mutual_information"]
    for name in concept_names:
        c = concept_registry.get_concept(name)
        assert c is not None
        assert c.title != ""
        assert c.beginner_explanation != ""
        assert c.why_it_matters != ""
