"""Integration and unit tests for Step 08: Dimensionality Reduction (PCA, LDA, SVD, Scree Plot)."""
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
    """Create a rich multi-feature dataset for testing dimensionality reduction."""
    csv_data = (
        "age,income,credit_score,debt_ratio,loan_amount,risk_class\n"
        "25,45000,650,0.25,12000,Low\n"
        "38,82000,740,0.35,28000,Medium\n"
        "45,115000,810,0.18,45000,Low\n"
        "29,38000,590,0.48,8000,High\n"
        "52,95000,720,0.30,32000,Medium\n"
        "31,54000,680,0.22,15000,Low\n"
        "42,130000,830,0.15,55000,Low\n"
        "24,31000,570,0.55,6000,High\n"
        "36,78000,710,0.38,25000,Medium\n"
        "49,105000,790,0.20,40000,Low\n"
        "27,42000,610,0.42,10000,High\n"
        "55,140000,850,0.12,65000,Low\n"
    )
    files = {"file": ("credit_risk.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")}
    resp = client.post("/api/datasets/upload", files=files)
    assert resp.status_code == 200
    return resp.json()["dataset_id"]


def test_dimensionality_summary(multi_feature_dataset):
    """Test retrieving dataset dimensionality summary."""
    resp = client.get(f"/api/datasets/{multi_feature_dataset}/dimensionality/summary")
    assert resp.status_code == 200
    data = resp.json()
    assert data["dataset_id"] == multi_feature_dataset
    assert data["numeric_feature_count"] == 5
    assert "income" in data["numeric_features"]
    assert "risk_class" in data["potential_target_columns"]
    assert data["can_execute"] is True
    assert data["recommended_components"] >= 2


def test_pca_preview_and_scree_plot(multi_feature_dataset):
    """Test PCA preview produces valid scree plot data and loadings."""
    resp = client.post(
        f"/api/datasets/{multi_feature_dataset}/dimensionality/preview",
        json={
            "method": "pca",
            "n_components": 3,
            "scale_first": True
        }
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["method"] == "pca"
    assert data["n_components"] == 3
    assert len(data["new_component_names"]) == 3
    assert data["new_component_names"] == ["PC_1", "PC_2", "PC_3"]
    assert len(data["scree_plot_data"]) == 3
    
    # Scree plot points validation
    for pt in data["scree_plot_data"]:
        assert pt["component"] >= 1
        assert pt["explained_variance_ratio"] > 0
        assert pt["cumulative_variance_ratio"] >= pt["explained_variance_ratio"]

    # Total variance must be <= 1.0 and > 0.5 for 3 comps
    assert 0.5 <= data["total_variance_explained"] <= 1.0

    # Component loadings validation
    assert "PC_1" in data["component_loadings"]
    assert "income" in data["component_loadings"]["PC_1"]

    # Sample rows validation
    assert len(data["sample_rows"]) > 0
    assert "PC_1" in data["sample_rows"][0]["components"]


def test_lda_supervised_preview(multi_feature_dataset):
    """Test supervised Linear Discriminant Analysis preview."""
    resp = client.post(
        f"/api/datasets/{multi_feature_dataset}/dimensionality/preview",
        json={
            "method": "lda",
            "n_components": 2,
            "target_column": "risk_class",
            "scale_first": True
        }
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["method"] == "lda"
    assert len(data["new_component_names"]) <= 2  # Max C - 1 = 3 - 1 = 2
    assert "LD_1" in data["new_component_names"]


def test_svd_preview(multi_feature_dataset):
    """Test Truncated SVD subspace preview."""
    resp = client.post(
        f"/api/datasets/{multi_feature_dataset}/dimensionality/preview",
        json={
            "method": "svd",
            "n_components": 2,
            "scale_first": True
        }
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["method"] == "svd"
    assert data["new_component_names"] == ["SVD_1", "SVD_2"]
    assert len(data["scree_plot_data"]) == 2


def test_apply_pca_creates_new_version(multi_feature_dataset):
    """Test applying PCA reduction stores immutable snapshot and updates shape."""
    # Unconfirmed must fail
    fail_resp = client.post(
        f"/api/datasets/{multi_feature_dataset}/dimensionality/apply",
        json={
            "method": "pca",
            "n_components": 2,
            "confirmed": False
        }
    )
    assert fail_resp.status_code == 400

    # Confirmed must succeed
    apply_resp = client.post(
        f"/api/datasets/{multi_feature_dataset}/dimensionality/apply",
        json={
            "method": "pca",
            "n_components": 2,
            "confirmed": True
        }
    )
    assert apply_resp.status_code == 200
    apply_data = apply_resp.json()
    assert apply_data["new_version"] >= 1
    assert apply_data["n_components"] == 2

    # Verify dataset in version_service
    df, meta, history = version_service.get_current_dataset(multi_feature_dataset)
    assert "PC_1" in df.columns
    assert "PC_2" in df.columns
    assert len(df.columns) == 2


def test_dimensionality_education_concepts():
    """Verify registered educational concepts for dimensionality reduction."""
    pca_concept = concept_registry.get_concept("pca")
    assert pca_concept is not None
    assert "Principal Component Analysis" in pca_concept.title

    lda_concept = concept_registry.get_concept("lda")
    assert lda_concept is not None
    assert "Linear Discriminant" in lda_concept.title

    svd_concept = concept_registry.get_concept("svd")
    assert svd_concept is not None
    assert "Singular Value Decomposition" in svd_concept.title

    curse_concept = concept_registry.get_concept("curse_of_dimensionality")
    assert curse_concept is not None
    assert "Curse of Dimensionality" in curse_concept.title

    scree_concept = concept_registry.get_concept("scree_plot")
    assert scree_concept is not None
    assert "Scree Plot" in scree_concept.title
