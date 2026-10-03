"""Comprehensive tests for Step 06: Data Encoding."""
import io
import pytest
import pandas as pd
from fastapi.testclient import TestClient

from app.main import app
from app.services.version_service import version_service
from app.engines.menti_ai.education.concept_registry import concept_registry

client = TestClient(app)


@pytest.fixture
def encoding_dataset():
    """Create a dataset with varied categorical features for encoding validation."""
    csv_data = (
        "id,education,tier,country,binary_flag\n"
        "1,High School,Bronze,USA,Yes\n"
        "2,Bachelor,Silver,USA,No\n"
        "3,Master,Gold,Canada,Yes\n"
        "4,PhD,Platinum,UK,No\n"
        "5,Bachelor,Silver,Germany,Yes\n"
        "6,High School,Bronze,France,No\n"
        "7,Master,Gold,USA,Yes\n"
        "8,PhD,Platinum,USA,No\n"
        "9,Bachelor,Silver,Canada,Yes\n"
        "10,Bachelor,Bronze,UK,No\n"
    )
    files = {"file": ("encoding_test.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")}
    resp = client.post("/api/datasets/upload", files=files)
    assert resp.status_code == 200
    return resp.json()["dataset_id"]


def test_encoding_summary_and_detection(encoding_dataset):
    """Test get_encoding_summary returns cardinality, top categories, and detects tier hierarchy."""
    resp = client.get(f"/api/datasets/{encoding_dataset}/encoding")
    assert resp.status_code == 200
    data = resp.json()
    assert data["dataset_id"] == encoding_dataset
    assert data["total_categorical_columns"] == 4

    cols_by_name = {c["column"]: c for c in data["columns"]}
    assert "binary_flag" in cols_by_name
    assert cols_by_name["binary_flag"]["unique_count"] == 2
    assert cols_by_name["binary_flag"]["recommended_method"] == "label"

    # Tier should match bronze < silver < gold < platinum
    assert "tier" in cols_by_name
    assert cols_by_name["tier"]["detected_ordinal_order"] is not None
    detected = [t.lower() for t in cols_by_name["tier"]["detected_ordinal_order"]]
    assert detected.index("bronze") < detected.index("silver") < detected.index("gold") < detected.index("platinum")


def test_one_hot_encoding_with_and_without_drop_first(encoding_dataset):
    """Test OHE preview and apply, checking column expansion and dummy trap warnings."""
    # Preview with drop_first=False
    prev_resp = client.post(
        f"/api/datasets/{encoding_dataset}/encoding/preview",
        json={"columns": ["country"], "method": "one_hot", "drop_first": False}
    )
    assert prev_resp.status_code == 200
    prev_data = prev_resp.json()
    assert prev_data["dummy_variable_trap_risk"] is True
    assert prev_data["sparsity_percentage"] > 0
    assert len(prev_data["new_columns_created"]) == 5  # USA, Canada, UK, Germany, France

    # Preview with drop_first=True
    prev_drop = client.post(
        f"/api/datasets/{encoding_dataset}/encoding/preview",
        json={"columns": ["country"], "method": "one_hot", "drop_first": True}
    )
    assert prev_drop.status_code == 200
    prev_drop_data = prev_drop.json()
    assert prev_drop_data["dummy_variable_trap_risk"] is False
    assert len(prev_drop_data["new_columns_created"]) == 4  # 1 dropped

    # Apply with drop_first=True
    apply_resp = client.post(
        f"/api/datasets/{encoding_dataset}/encoding/apply",
        json={"columns": ["country"], "method": "one_hot", "drop_first": True, "confirmed": True}
    )
    assert apply_resp.status_code == 200
    assert apply_resp.json()["new_version"] == 1

    df, _, _ = version_service.get_current_dataset(encoding_dataset)
    assert "country" not in df.columns
    assert any(c.startswith("country_") for c in df.columns)


def test_ordinal_encoding_custom_mappings(encoding_dataset):
    """Test Ordinal Encoding with explicit user-defined category sequence."""
    custom_order = ["Bronze", "Silver", "Gold", "Platinum"]
    resp = client.post(
        f"/api/datasets/{encoding_dataset}/encoding/apply",
        json={
            "columns": ["tier"],
            "method": "ordinal",
            "ordinal_mappings": {"tier": custom_order},
            "confirmed": True
        }
    )
    assert resp.status_code == 200
    df, _, _ = version_service.get_current_dataset(encoding_dataset)
    assert pd.api.types.is_numeric_dtype(df["tier"])
    # Row 1 is Bronze -> 0
    assert df.loc[df["id"] == 1, "tier"].values[0] == 0
    # Row 4 is Platinum -> 3
    assert df.loc[df["id"] == 4, "tier"].values[0] == 3


def test_frequency_encoding(encoding_dataset):
    """Test frequency encoding replaces categories with their proportional frequency."""
    resp = client.post(
        f"/api/datasets/{encoding_dataset}/encoding/apply",
        json={
            "columns": ["education"],
            "method": "frequency",
            "frequency_metric": "frequency",
            "confirmed": True
        }
    )
    assert resp.status_code == 200
    df, _, _ = version_service.get_current_dataset(encoding_dataset)
    assert pd.api.types.is_numeric_dtype(df["education"])
    # "Bachelor" appears 4 times out of 10 -> 0.40
    assert abs(df.loc[df["id"] == 2, "education"].values[0] - 0.4) < 1e-3


def test_label_encoding_binary(encoding_dataset):
    """Test Label Encoding on binary column."""
    resp = client.post(
        f"/api/datasets/{encoding_dataset}/encoding/apply",
        json={
            "columns": ["binary_flag"],
            "method": "label",
            "confirmed": True
        }
    )
    assert resp.status_code == 200
    df, _, _ = version_service.get_current_dataset(encoding_dataset)
    assert pd.api.types.is_numeric_dtype(df["binary_flag"])
    unique_vals = set(df["binary_flag"].unique())
    assert unique_vals.issubset({0, 1})


def test_education_concepts_for_encoding():
    """Verify that encoding concepts are registered in concept registry."""
    ohe = concept_registry.get_concept("one_hot_encoding")
    assert ohe is not None
    assert "dummy_variable_trap" in ohe.related_concepts

    trap = concept_registry.get_concept("dummy_variable_trap")
    assert trap is not None
    assert "drop_first" in trap.intermediate_explanation

    ord_c = concept_registry.get_concept("ordinal_encoding")
    assert ord_c is not None

    freq_c = concept_registry.get_concept("frequency_encoding")
    assert freq_c is not None
