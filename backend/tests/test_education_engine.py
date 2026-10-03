"""Unit and integration tests for Stage 4 Education and Explanation Engine."""
import io
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.engines.menti_ai.education.concept_registry import concept_registry
from app.engines.menti_ai.education.models import EducationalConcept

client = TestClient(app)


def test_concept_registry_loading_and_counts():
    """Verify all 26 core concepts are properly indexed across all 5 categories."""
    total = concept_registry.total_count()
    assert total >= 25, f"Expected at least 25 concepts, got {total}"

    categories = concept_registry.get_categories()
    assert "data_fundamentals" in categories
    assert "data_quality" in categories
    assert "data_types" in categories
    assert "statistics" in categories
    assert "advanced" in categories


def test_concept_retrieval_and_schema_completeness():
    """Test retrieving core concepts and verifying every required field is populated."""
    sample_ids = ["missing_values", "mean", "median", "dataset", "outlier", "cardinality"]

    for cid in sample_ids:
        concept = concept_registry.get_concept(cid)
        assert concept is not None, f"Concept '{cid}' should exist in registry"
        assert isinstance(concept, EducationalConcept)
        assert concept.concept_id == cid
        assert len(concept.title) > 0
        assert len(concept.short_definition) > 0
        assert len(concept.beginner_explanation) > 0
        assert len(concept.intermediate_explanation) > 0
        assert len(concept.technical_explanation) > 0
        assert len(concept.why_it_matters) > 0
        assert len(concept.ml_impact) > 0
        assert len(concept.common_methods) > 0
        assert len(concept.when_to_use) > 0
        assert len(concept.when_not_to_use) > 0
        assert len(concept.common_mistakes) > 0
        assert len(concept.interview_tip) > 0
        assert len(concept.related_concepts) > 0

        # Verify real-world example
        assert concept.real_world_example is not None
        assert len(concept.real_world_example.title) > 0
        assert len(concept.real_world_example.takeaway) > 0

        # Verify knowledge check
        assert concept.knowledge_check is not None
        assert len(concept.knowledge_check.question) > 0
        assert len(concept.knowledge_check.options) >= 2
        assert 0 <= concept.knowledge_check.correct_option_index < len(concept.knowledge_check.options)
        assert len(concept.knowledge_check.explanation) > 0


def test_concept_aliases():
    """Verify common terminology aliases resolve to canonical concepts."""
    assert concept_registry.get_concept("nulls").concept_id == "missing_values"
    assert concept_registry.get_concept("duplicates").concept_id == "duplicate_records"
    assert concept_registry.get_concept("std").concept_id == "standard_deviation"
    assert concept_registry.get_concept("skew").concept_id == "skewness"
    assert concept_registry.get_concept("outliers").concept_id == "outlier"
    assert concept_registry.get_concept("id").concept_id == "identifier"


def test_category_filtering_and_search():
    """Test filtering concepts by category and full-text keyword search."""
    # Filter by category
    stats_concepts = concept_registry.list_concepts(category="statistics")
    assert len(stats_concepts) >= 9
    assert all(c.category == "statistics" for c in stats_concepts)

    quality_concepts = concept_registry.list_concepts(category="data_quality")
    assert len(quality_concepts) >= 4
    assert any(c.concept_id == "missing_values" for c in quality_concepts)

    # Search
    search_results = concept_registry.list_concepts(search="Tukey")
    assert len(search_results) > 0
    assert any(c.concept_id in ("iqr", "outlier") for c in search_results)


def test_api_get_concepts_list():
    """Test GET /api/education/concepts endpoint."""
    response = client.get("/api/education/concepts")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 25

    # With category filter
    resp_filtered = client.get("/api/education/concepts?category=data_fundamentals")
    assert resp_filtered.status_code == 200
    fundamentals = resp_filtered.json()
    assert len(fundamentals) >= 7
    assert all(c["category"] == "data_fundamentals" for c in fundamentals)


def test_api_get_single_concept():
    """Test GET /api/education/concepts/{concept_id} and 404 on invalid ID."""
    response = client.get("/api/education/concepts/median")
    assert response.status_code == 200
    data = response.json()
    assert data["concept_id"] == "median"
    assert data["title"] == "Median (50th Percentile / Midpoint)"
    assert "50th percentile" in data["intermediate_explanation"]

    # 404 error case
    resp_404 = client.get("/api/education/concepts/non_existent_concept_xyz")
    assert resp_404.status_code == 404
    assert "not found" in resp_404.json()["detail"].lower()


def test_api_explain_multi_level():
    """Test POST /api/education/explain returning different explanation depths."""
    # Beginner level (default)
    payload_beg = {"concept_id": "median", "level": "beginner"}
    res_beg = client.post("/api/education/explain", json=payload_beg)
    assert res_beg.status_code == 200
    data_beg = res_beg.json()
    assert data_beg["level"] == "beginner"
    assert "middle" in data_beg["selected_explanation"].lower() or "line up" in data_beg["selected_explanation"].lower()

    # Technical level
    payload_tech = {"concept_id": "median", "level": "technical"}
    res_tech = client.post("/api/education/explain", json=payload_tech)
    assert res_tech.status_code == 200
    data_tech = res_tech.json()
    assert data_tech["level"] == "technical"
    assert data_tech["selected_explanation"] != data_beg["selected_explanation"]
    assert "breakdown point" in data_tech["selected_explanation"].lower() or "absolute deviations" in data_tech["selected_explanation"].lower()


def test_api_explain_with_real_dataset_evidence_zero_fabrication():
    """
    Test contextual explanation with real uploaded dataset.
    Uploads a controlled CSV, verifies that exact computed profiling numbers are returned,
    guaranteeing zero fabrication of metrics.
    """
    # Create controlled CSV with known stats
    # salary: 1 missing, values: [50000, 60000, 70000, None]
    csv_content = (
        "employee_id,name,salary,department\n"
        "E1,Alice,50000,Engineering\n"
        "E2,Bob,60000,Marketing\n"
        "E3,Charlie,70000,Engineering\n"
        "E4,Diana,,Finance\n"
    )

    upload_res = client.post(
        "/api/datasets/upload",
        files={"file": ("test_edu_staff.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    )
    assert upload_res.status_code == 200
    dataset_id = upload_res.json()["dataset_id"]

    # Request contextual explanation for missing_values on 'salary'
    explain_payload = {
        "concept_id": "missing_values",
        "dataset_id": dataset_id,
        "column": "salary",
        "level": "beginner"
    }
    explain_res = client.post("/api/education/explain", json=explain_payload)
    assert explain_res.status_code == 200
    data = explain_res.json()

    assert data["concept_id"] == "missing_values"
    assert "salary" in data["title"]
    assert data["dataset_evidence"] is not None

    evidence = data["dataset_evidence"]
    assert evidence["column"] == "salary"
    metrics = evidence["metrics"]
    # Exact verification: 1 missing out of 4 rows = 25%
    assert metrics["missing_count"] == 1
    assert metrics["total_rows"] == 4
    assert metrics["missing_percentage"] == 25.0
    assert "1 missing values out of 4 total rows" in evidence["summary_statement"]

    # Verify pipeline next step
    assert "Stage 3 (Data Cleaning)" in data["next_step"]


def test_api_explain_numeric_stats_evidence():
    """Test numerical statistics evidence injection for mean/median on real data."""
    csv_content = (
        "id,score\n"
        "1,10\n"
        "2,20\n"
        "3,30\n"
    )
    upload_res = client.post(
        "/api/datasets/upload",
        files={"file": ("test_scores.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    )
    assert upload_res.status_code == 200
    dataset_id = upload_res.json()["dataset_id"]

    # Test mean on 'score' (should be exactly 20.0)
    explain_res = client.post(
        "/api/education/explain",
        json={"concept_id": "mean", "dataset_id": dataset_id, "column": "score"}
    )
    assert explain_res.status_code == 200
    data = explain_res.json()
    assert data["dataset_evidence"] is not None
    assert data["dataset_evidence"]["metrics"]["mean"] == 20.0
    assert "20.0" in data["dataset_evidence"]["summary_statement"]
