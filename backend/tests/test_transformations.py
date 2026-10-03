"""Comprehensive Pytest test suite for Phase 7: Data Transformation Engine."""
import io
import hashlib
import numpy as np
import pandas as pd
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.version_service import version_service
from app.transformations.scalers.standard import fit_transform_standard
from app.transformations.scalers.minmax import fit_transform_minmax
from app.transformations.scalers.robust import fit_transform_robust
from app.transformations.distributions.log import fit_transform_log1p
from app.transformations.distributions.power import fit_transform_yeo_johnson, fit_transform_box_cox
from app.transformations.recommendations import recommend_transformation
from app.transformations.models import TransformationMethodEnum

client = TestClient(app)


def test_standard_scaler_math_and_constant_handling():
    """Test mathematical accuracy of StandardScaler and constant feature zero-division guard."""
    series = pd.Series([10.0, 20.0, 30.0, 40.0, 50.0])
    scaled, params, calc = fit_transform_standard(series)
    
    assert len(scaled) == 5
    assert pytest.approx(float(scaled.mean()), abs=1e-5) == 0.0
    assert pytest.approx(float(scaled.std(ddof=0)), abs=1e-5) == 1.0
    assert params["mean"] == 30.0
    assert len(calc.steps) > 0
    assert "Sample point" in calc.sample_calculation

    # Constant series test
    const_series = pd.Series([42.0, 42.0, 42.0, 42.0])
    scaled_c, params_c, calc_c = fit_transform_standard(const_series)
    assert (scaled_c == 0.0).all()
    assert params_c["std"] == 0.0
    assert "Constant safeguard applied" in calc_c.steps[2]


def test_minmax_scaler_math_and_custom_range():
    """Test MinMaxScaler default [0, 1] and custom [-1, 1] scaling with constant column safety."""
    series = pd.Series([100.0, 150.0, 200.0])
    scaled_default, params_d, _ = fit_transform_minmax(series, feature_range=(0.0, 1.0))
    
    assert scaled_default.min() == 0.0
    assert scaled_default.max() == 1.0
    assert scaled_default.iloc[1] == 0.5
    assert params_d["data_min"] == 100.0
    assert params_d["data_max"] == 200.0

    scaled_custom, params_c, _ = fit_transform_minmax(series, feature_range=(-1.0, 1.0))
    assert scaled_custom.min() == -1.0
    assert scaled_custom.max() == 1.0
    assert scaled_custom.iloc[1] == 0.0

    # Constant series test
    const_series = pd.Series([5.0, 5.0, 5.0])
    scaled_const, params_const, calc_const = fit_transform_minmax(const_series, feature_range=(0.0, 1.0))
    assert (scaled_const == 0.0).all()
    assert "Constant safeguard applied" in calc_const.steps[3]


def test_robust_scaler_math_and_zero_iqr():
    """Test RobustScaler median/IQR math and zero-IQR safety."""
    # Data with extreme outlier
    series = pd.Series([10.0, 12.0, 14.0, 15.0, 16.0, 18.0, 500.0])
    scaled, params, calc = fit_transform_robust(series)
    
    assert pytest.approx(float(scaled.median()), abs=1e-5) == 0.0
    assert params["median"] == 15.0
    assert params["iqr"] > 0
    assert "resistant to extreme outliers" in calc.steps[5]

    # Zero IQR series (e.g. repeated values in middle 50%)
    zero_iqr_series = pd.Series([10.0, 10.0, 10.0, 10.0, 10.0, 100.0])
    scaled_z, params_z, calc_z = fit_transform_robust(zero_iqr_series)
    assert pytest.approx(float(scaled_z.median()), abs=1e-5) == 0.0
    assert "Zero-IQR safeguard applied" in calc_z.steps[3]


def test_log1p_math_and_negative_rejection():
    """Test Log1p transformation and domain protection against negative values."""
    series = pd.Series([0.0, 10.0, 100.0, 1000.0])
    transformed, params, calc = fit_transform_log1p(series)
    
    assert transformed.iloc[0] == 0.0
    assert pytest.approx(transformed.iloc[1], abs=1e-4) == float(np.log(11.0))
    assert params["function"] == "log1p"

    # Negative values test must raise ValueError with educational hint
    neg_series = pd.Series([-5.0, 10.0, 20.0])
    with pytest.raises(ValueError) as exc_info:
        fit_transform_log1p(neg_series)
    assert "negative values" in str(exc_info.value)
    assert "Yeo-Johnson" in str(exc_info.value)


def test_power_transforms_yeo_johnson_and_box_cox():
    """Test Yeo-Johnson (all reals) and Box-Cox (strictly positive) power transformations."""
    # Yeo-Johnson on dataset containing negative, zero, and positive
    mixed_series = pd.Series([-15.0, -5.0, 0.0, 10.0, 50.0, 200.0])
    transformed_yj, params_yj, calc_yj = fit_transform_yeo_johnson(mixed_series)
    
    assert len(transformed_yj) == len(mixed_series)
    assert "lambda" in params_yj
    assert calc_yj.method == "yeo_johnson"

    # Box-Cox on strictly positive series
    pos_series = pd.Series([1.0, 5.0, 15.0, 50.0, 250.0])
    transformed_bc, params_bc, calc_bc = fit_transform_box_cox(pos_series)
    assert len(transformed_bc) == len(pos_series)
    assert "lambda" in params_bc
    assert calc_bc.method == "box_cox"

    # Box-Cox on series with zero or negatives must raise ValueError
    invalid_bc_series = pd.Series([0.0, 10.0, 20.0])
    with pytest.raises(ValueError) as exc_info:
        fit_transform_box_cox(invalid_bc_series)
    assert "strictly positive" in str(exc_info.value)
    assert "Yeo-Johnson" in str(exc_info.value)


def test_recommendation_rules():
    """Test deterministic recommendation heuristics on diverse distributions."""
    # 1. Heavily skewed positive data -> log1p
    rec_skew = recommend_transformation("income", {
        "skewness": 3.5,
        "outlier_percentage": 1.0,
        "min": 0.0,
        "max": 500000.0
    })
    assert rec_skew.recommended_method == "log1p"

    # 2. Outliers present -> robust
    rec_outliers = recommend_transformation("prices", {
        "skewness": 0.8,
        "outlier_percentage": 5.2,
        "min": 10.0,
        "max": 10000.0
    })
    assert rec_outliers.recommended_method == "robust"

    # 3. Symmetric data -> standard
    rec_sym = recommend_transformation("height", {
        "skewness": 0.1,
        "outlier_percentage": 0.5,
        "min": 150.0,
        "max": 195.0
    })
    assert rec_sym.recommended_method == "standard"

    # 4. Skewed with negative numbers -> yeo_johnson
    rec_neg = recommend_transformation("returns", {
        "skewness": 2.2,
        "outlier_percentage": 1.0,
        "min": -50.0,
        "max": 200.0
    })
    assert rec_neg.recommended_method == "yeo_johnson"


def test_api_transformation_workflow_preview_apply_undo():
    """Test full API lifecycle: Ingest -> Summary -> Detail -> Preview -> Apply -> History -> Undo."""
    csv_content = (
        "id,income,age,score,sentiment\n"
        "1,25000,22,50,positive\n"
        "2,30000,28,65,neutral\n"
        "3,35000,35,70,positive\n"
        "4,40000,42,75,negative\n"
        "5,45000,50,80,positive\n"
        "6,50000,58,85,neutral\n"
        "7,500000,65,90,positive\n"
    )
    upload_res = client.post(
        "/api/datasets/upload",
        files={"file": ("customers.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    )
    assert upload_res.status_code == 200
    dataset_id = upload_res.json()["dataset_id"]

    # 1. Get Transformation Summary
    summary_res = client.get(f"/api/datasets/{dataset_id}/transformations")
    assert summary_res.status_code == 200
    summary_data = summary_res.json()
    assert summary_data["numerical_columns_count"] >= 3
    col_names = [c["column"] for c in summary_data["columns"]]
    assert "income" in col_names
    assert "age" in col_names

    # 2. Get Column Detail
    detail_res = client.get(f"/api/datasets/{dataset_id}/transformations/income")
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["column"] == "income"
    assert "current_distribution" in detail_data
    assert len(detail_data["current_distribution"]["histogram_bins"]) > 0

    # 3. Preview Transformation (Non-destructive simulation)
    preview_payload = {
        "column": "income",
        "method": "log1p"
    }
    preview_res = client.post(f"/api/datasets/{dataset_id}/transformations/preview", json=preview_payload)
    assert preview_res.status_code == 200
    preview_data = preview_res.json()
    assert preview_data["before"]["mean"] > 10000.0
    assert preview_data["after"]["mean"] < 15.0  # Log scale mean
    assert len(preview_data["sample_rows"]) == 7

    # Ensure dataset on disk was NOT mutated by preview
    raw_df_after_preview, _, _ = version_service.get_current_dataset(dataset_id)
    assert raw_df_after_preview["income"].max() == 500000.0

    # 4. Apply without confirmation should fail
    unconfirmed_payload = {
        "column": "income",
        "method": "log1p",
        "confirmed": False
    }
    unconfirmed_res = client.post(f"/api/datasets/{dataset_id}/transformations/apply", json=unconfirmed_payload)
    assert unconfirmed_res.status_code == 400

    # 5. Apply with confirmation
    apply_payload = {
        "column": "income",
        "method": "log1p",
        "confirmed": True
    }
    apply_res = client.post(f"/api/datasets/{dataset_id}/transformations/apply", json=apply_payload)
    assert apply_res.status_code == 200
    apply_data = apply_res.json()
    assert apply_data["new_version"] == 1
    assert "Successfully applied" in apply_data["message"]

    # Verify working dataset was updated
    transformed_df, _, _ = version_service.get_current_dataset(dataset_id)
    assert transformed_df["income"].max() < 15.0

    # 6. Check Transformation History
    history_res = client.get(f"/api/datasets/{dataset_id}/transformations/history")
    assert history_res.status_code == 200
    history_data = history_res.json()
    assert len(history_data["history"]) >= 1
    assert history_data["history"][0]["method"] == "log1p"

    # 7. Undo Transformation
    undo_res = client.post(f"/api/datasets/{dataset_id}/transformations/undo")
    assert undo_res.status_code == 200
    assert undo_res.json()["restored_version"] == 0

    # Verify dataset restored
    restored_df, _, _ = version_service.get_current_dataset(dataset_id)
    assert restored_df["income"].max() == 500000.0


def test_critical_data_safety_original_dataset_immutability():
    """Verify cryptographic SHA-256 hash invariance of original dataset under transformation operations."""
    csv_content = (
        "feat_a,feat_b\n"
        "10.0,0.1\n"
        "20.0,0.2\n"
        "30.0,0.3\n"
        "40.0,0.4\n"
    )
    upload_res = client.post(
        "/api/datasets/upload",
        files={"file": ("safety_test.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    )
    dataset_id = upload_res.json()["dataset_id"]

    # Compute original file SHA-256 hash
    orig_path = version_service.get_session_dir(dataset_id) / "original" / f"{dataset_id}.csv"
    original_hash = version_service.compute_file_hash(orig_path)

    # Apply multiple sequential transformations
    client.post(f"/api/datasets/{dataset_id}/transformations/apply", json={
        "column": "feat_a",
        "method": "standard",
        "confirmed": True
    })
    client.post(f"/api/datasets/{dataset_id}/transformations/apply", json={
        "column": "feat_b",
        "method": "minmax",
        "feature_range_min": -1.0,
        "feature_range_max": 1.0,
        "confirmed": True
    })

    # Verify original file hash is 100% identical byte-for-byte
    with open(orig_path, "rb") as f:
        after_hash = hashlib.sha256(f.read()).hexdigest()

    assert original_hash == after_hash, "CRITICAL ERROR: Original dataset file was modified!"
