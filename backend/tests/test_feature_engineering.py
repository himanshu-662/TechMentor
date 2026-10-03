"""Comprehensive test suite for Phase 8 Feature Engineering Engine."""
import io
import pytest
import pandas as pd
import numpy as np
from fastapi.testclient import TestClient

from app.main import app
from app.services.version_service import version_service

client = TestClient(app)


@pytest.fixture
def sample_fe_dataset():
    """Create a multi-column dataset with datetime, text, categoricals, and numerics."""
    csv_data = (
        "id,user_id,order_date,delivery_date,product_category,unit_price,quantity,discount,review_text\n"
        "1,user_10,2026-01-01 10:00:00,2026-01-03 14:00:00,Electronics,120.0,2,0.0,Great gadget! Fast delivery.\n"
        "2,user_10,2026-01-05 15:30:00,2026-01-07 16:30:00,Electronics,45.0,1,5.0,Works okay but noisy.\n"
        "3,user_20,2026-01-10 09:15:00,2026-01-12 11:15:00,Books,15.0,4,2.0,AMAZING BOOK! A MUST READ!!!\n"
        "4,user_20,2026-01-15 18:45:00,2026-01-18 20:00:00,Books,22.5,2,0.0,Very informative text.\n"
        "5,user_30,2026-01-20 08:00:00,2026-01-21 08:30:00,Home,300.0,1,50.0,High quality furniture.\n"
        "6,user_30,2026-01-22 12:00:00,2026-01-23 13:00:00,Home,80.0,0,0.0,Zero quantity item.\n"
    )
    files = {"file": ("orders.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")}
    response = client.post("/api/datasets/upload", files=files)
    assert response.status_code == 200
    return response.json()["dataset_id"]


def test_feature_opportunities_scan(sample_fe_dataset):
    """Test automated feature opportunity scanning."""
    resp = client.get(f"/api/datasets/{sample_fe_dataset}/feature-engineering/opportunities")
    assert resp.status_code == 200
    data = resp.json()
    assert data["dataset_id"] == sample_fe_dataset
    assert data["total_opportunities"] > 0
    opp_types = [opp["feature_type"] for opp in data["opportunities"]]
    # Should detect temporal, frequency/aggregations, text, etc.
    assert "datetime_parts" in opp_types or "cyclical" in opp_types
    assert "text_statistics" in opp_types


def test_mathematical_feature_preview_and_apply(sample_fe_dataset):
    """Test mathematical arithmetic feature generation and immutability."""
    # 1. Preview: unit_price - discount
    preview_payload = {
        "feature_type": "mathematical",
        "new_feature_name": "net_price",
        "params": {
            "operation": "subtract",
            "column_a": "unit_price",
            "column_b": "discount"
        }
    }
    prev_resp = client.post(
        f"/api/datasets/{sample_fe_dataset}/feature-engineering/preview",
        json=preview_payload
    )
    assert prev_resp.status_code == 200
    prev_data = prev_resp.json()
    assert prev_data["feature_name"] == "net_price"
    assert prev_data["formula_human_readable"] == "unit_price - discount"
    assert prev_data["validation"]["valid"] is True
    assert len(prev_data["preview_rows"]) == 6
    # Row 1: 120.0 - 0.0 = 120.0
    assert prev_data["preview_rows"][0]["generated_value"] == 120.0

    # Verify dataset not mutated
    df_current, _, _ = version_service.get_current_dataset(sample_fe_dataset)
    assert "net_price" not in df_current.columns

    # 2. Apply
    apply_payload = {
        "feature_type": "mathematical",
        "new_feature_name": "net_price",
        "params": {
            "operation": "subtract",
            "column_a": "unit_price",
            "column_b": "discount"
        },
        "confirmed": True
    }
    apply_resp = client.post(
        f"/api/datasets/{sample_fe_dataset}/feature-engineering/apply",
        json=apply_payload
    )
    assert apply_resp.status_code == 200
    apply_data = apply_resp.json()
    assert apply_data["new_version"] >= 1
    assert apply_data["feature_name"] == "net_price"

    # Verify column now exists in current version
    df_updated, _, _ = version_service.get_current_dataset(sample_fe_dataset)
    assert "net_price" in df_updated.columns
    assert float(df_updated.iloc[0]["net_price"]) == 120.0


def test_interaction_feature(sample_fe_dataset):
    """Test interaction cross-product feature: unit_price * quantity."""
    payload = {
        "feature_type": "interaction",
        "new_feature_name": "total_gross_value",
        "params": {
            "column_a": "unit_price",
            "column_b": "quantity"
        },
        "confirmed": True
    }
    resp = client.post(
        f"/api/datasets/{sample_fe_dataset}/feature-engineering/apply",
        json=payload
    )
    assert resp.status_code == 200
    df, _, _ = version_service.get_current_dataset(sample_fe_dataset)
    assert "total_gross_value" in df.columns
    # Row 1: 120.0 * 2 = 240.0
    assert float(df.iloc[0]["total_gross_value"]) == 240.0


def test_ratio_feature_with_zero_division_policies(sample_fe_dataset):
    """Test ratio feature with division by zero policy handling."""
    # Row 6 has quantity = 0. Test zero policy
    payload = {
        "feature_type": "ratio",
        "new_feature_name": "price_per_qty_zero_policy",
        "params": {
            "numerator_column": "unit_price",
            "denominator_column": "quantity",
            "division_by_zero_policy": "zero"
        },
        "confirmed": True
    }
    resp = client.post(
        f"/api/datasets/{sample_fe_dataset}/feature-engineering/apply",
        json=payload
    )
    assert resp.status_code == 200
    df, _, _ = version_service.get_current_dataset(sample_fe_dataset)
    assert "price_per_qty_zero_policy" in df.columns
    # Row 6 (quantity 0) should be 0.0, not inf or nan
    assert float(df.iloc[5]["price_per_qty_zero_policy"]) == 0.0


def test_datetime_parts_and_cyclical(sample_fe_dataset):
    """Test datetime part decomposition and cyclical sin/cos encoding."""
    # Date parts: Day of week
    payload_dt = {
        "feature_type": "datetime_parts",
        "new_feature_name": "order_day_of_week",
        "params": {
            "datetime_column": "order_date",
            "part": "weekday"
        },
        "confirmed": True
    }
    resp_dt = client.post(
        f"/api/datasets/{sample_fe_dataset}/feature-engineering/apply",
        json=payload_dt
    )
    assert resp_dt.status_code == 200
    
    # Cyclical sin for hour
    payload_cyc = {
        "feature_type": "cyclical",
        "new_feature_name": "order_hour_sin",
        "params": {
            "datetime_column": "order_date",
            "period_type": "hour_24",
            "harmonic": "sin"
        },
        "confirmed": True
    }
    resp_cyc = client.post(
        f"/api/datasets/{sample_fe_dataset}/feature-engineering/apply",
        json=payload_cyc
    )
    assert resp_cyc.status_code == 200
    
    df, _, _ = version_service.get_current_dataset(sample_fe_dataset)
    assert "order_day_of_week" in df.columns
    assert "order_hour_sin" in df.columns
    assert -1.0 <= float(df.iloc[0]["order_hour_sin"]) <= 1.0


def test_date_difference(sample_fe_dataset):
    """Test elapsed duration calculation in hours and days."""
    payload = {
        "feature_type": "date_difference",
        "new_feature_name": "fulfillment_hours",
        "params": {
            "start_datetime_column": "order_date",
            "end_datetime_column": "delivery_date",
            "unit": "hours"
        },
        "confirmed": True
    }
    resp = client.post(
        f"/api/datasets/{sample_fe_dataset}/feature-engineering/apply",
        json=payload
    )
    assert resp.status_code == 200
    df, _, _ = version_service.get_current_dataset(sample_fe_dataset)
    assert "fulfillment_hours" in df.columns
    # Row 1: 2026-01-01 10:00:00 to 2026-01-03 14:00:00 = 52 hours
    assert abs(float(df.iloc[0]["fulfillment_hours"]) - 52.0) < 0.01


def test_grouped_aggregations_with_leakage_warning(sample_fe_dataset):
    """Test grouped aggregations and ensure educational leakage warnings are emitted."""
    prev_payload = {
        "feature_type": "aggregation",
        "new_feature_name": "user_avg_unit_price",
        "params": {
            "group_by_column": "user_id",
            "target_column": "unit_price",
            "agg_func": "mean"
        }
    }
    resp = client.post(
        f"/api/datasets/{sample_fe_dataset}/feature-engineering/preview",
        json=prev_payload
    )
    assert resp.status_code == 200
    data = resp.json()
    assert any("LEAKAGE WARNING" in w for w in data["warnings"])
    assert data["educational_concept_id"] == "aggregation_features"


def test_binning_and_indicators(sample_fe_dataset):
    """Test binning and indicator boolean flags."""
    # Indicator: is_expensive (unit_price > 100)
    ind_payload = {
        "feature_type": "indicator",
        "new_feature_name": "is_expensive",
        "params": {
            "source_column": "unit_price",
            "operator": "gt",
            "threshold": 100.0,
            "output_format": "binary_int"
        },
        "confirmed": True
    }
    resp = client.post(
        f"/api/datasets/{sample_fe_dataset}/feature-engineering/apply",
        json=ind_payload
    )
    assert resp.status_code == 200
    df, _, _ = version_service.get_current_dataset(sample_fe_dataset)
    assert "is_expensive" in df.columns
    # Row 1 (120 > 100 -> 1), Row 2 (45 > 100 -> 0)
    assert int(df.iloc[0]["is_expensive"]) == 1
    assert int(df.iloc[1]["is_expensive"]) == 0


def test_frequency_and_text_features(sample_fe_dataset):
    """Test frequency count encoding and text length statistics."""
    # Frequency
    freq_payload = {
        "feature_type": "frequency",
        "new_feature_name": "category_popularity",
        "params": {
            "source_column": "product_category",
            "frequency_type": "count"
        },
        "confirmed": True
    }
    client.post(
        f"/api/datasets/{sample_fe_dataset}/feature-engineering/apply",
        json=freq_payload
    )

    # Text Word Count
    text_payload = {
        "feature_type": "text_statistics",
        "new_feature_name": "review_word_count",
        "params": {
            "text_column": "review_text",
            "statistic_type": "word_count"
        },
        "confirmed": True
    }
    client.post(
        f"/api/datasets/{sample_fe_dataset}/feature-engineering/apply",
        json=text_payload
    )

    df, _, _ = version_service.get_current_dataset(sample_fe_dataset)
    assert "category_popularity" in df.columns
    assert "review_word_count" in df.columns
    # Row 1 "Great gadget! Fast delivery." -> 4 words
    assert int(df.iloc[0]["review_word_count"]) == 4


def test_history_and_undo(sample_fe_dataset):
    """Test audit history log and undoing the last feature engineering operation."""
    # 1. Apply a feature
    payload = {
        "feature_type": "mathematical",
        "new_feature_name": "abs_discount",
        "params": {
            "operation": "abs",
            "column_a": "discount"
        },
        "confirmed": True
    }
    apply_resp = client.post(
        f"/api/datasets/{sample_fe_dataset}/feature-engineering/apply",
        json=payload
    )
    assert apply_resp.status_code == 200

    # Check history
    hist_resp = client.get(f"/api/datasets/{sample_fe_dataset}/feature-engineering/history")
    assert hist_resp.status_code == 200
    hist_data = hist_resp.json()
    assert hist_data["total_features_engineered"] >= 1
    assert any(h["feature_name"] == "abs_discount" for h in hist_data["history"])

    # Undo
    undo_resp = client.post(f"/api/datasets/{sample_fe_dataset}/feature-engineering/undo")
    assert undo_resp.status_code == 200
    df_reverted, _, _ = version_service.get_current_dataset(sample_fe_dataset)
    assert "abs_discount" not in df_reverted.columns
