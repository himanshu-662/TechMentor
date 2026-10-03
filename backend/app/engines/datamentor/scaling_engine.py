"""Core orchestration engine for Phase 7 Data Transformations."""
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
import pandas as pd
from fastapi import HTTPException

from app.services.version_service import version_service
try:
    from app.engines.datamentor.transformations.models import (
        TransformationMethodEnum,
        HistogramBin,
        BoxPlotStats,
        ColumnDistributionMetrics,
        ColumnTransformationSummary,
        DatasetTransformationSummaryResponse,
        ColumnTransformationDetailResponse,
        TransformationPreviewRequest,
        TransformationPreviewResponse,
        TransformationApplyRequest,
        TransformationApplyResponse,
        SampleTransformedRow,
        TransformationHistoryItem,
        TransformationHistoryResponse,
        CalculationStepDetail
    )
    from app.engines.datamentor.transformations.scalers.standard import fit_transform_standard
    from app.engines.datamentor.transformations.scalers.minmax import fit_transform_minmax
    from app.engines.datamentor.transformations.scalers.robust import fit_transform_robust
    from app.engines.datamentor.transformations.distributions.log import fit_transform_log1p
    from app.engines.datamentor.transformations.distributions.power import fit_transform_yeo_johnson, fit_transform_box_cox
    from app.engines.datamentor.transformations.recommendations import recommend_transformation
    from app.engines.datamentor.transformations.validation import validate_numerical_column, validate_transformation_parameters
except ImportError:
    # pyrefly: ignore [missing-import]
    from app.transformations.models import (
        TransformationMethodEnum,
        HistogramBin,
        BoxPlotStats,
        ColumnDistributionMetrics,
        ColumnTransformationSummary,
        DatasetTransformationSummaryResponse,
        ColumnTransformationDetailResponse,
        TransformationPreviewRequest,
        TransformationPreviewResponse,
        TransformationApplyRequest,
        TransformationApplyResponse,
        SampleTransformedRow,
        TransformationHistoryItem,
        TransformationHistoryResponse,
        CalculationStepDetail
    )
    # pyrefly: ignore [missing-import]
    from app.transformations.scalers.standard import fit_transform_standard
    # pyrefly: ignore [missing-import]
    from app.transformations.scalers.minmax import fit_transform_minmax
    # pyrefly: ignore [missing-import]
    from app.transformations.scalers.robust import fit_transform_robust
    # pyrefly: ignore [missing-import]
    from app.transformations.distributions.log import fit_transform_log1p
    # pyrefly: ignore [missing-import]
    from app.transformations.distributions.power import fit_transform_yeo_johnson, fit_transform_box_cox
    # pyrefly: ignore [missing-import]
    from app.transformations.recommendations import recommend_transformation
    # pyrefly: ignore [missing-import]
    from app.transformations.validation import validate_numerical_column, validate_transformation_parameters


def clean_primitive(val: Any) -> Any:
    """Safely convert numpy or non-standard types to clean native Python primitives."""
    if val is None or (isinstance(val, float) and (np.isnan(val) or np.isinf(val))):
        return None
    if isinstance(val, (np.integer, int)):
        return int(val)
    if isinstance(val, (np.floating, float)):
        return float(val)
    if isinstance(val, (np.bool_, bool)):
        return bool(val)
    return str(val)


def compute_column_distribution(series: pd.Series, num_bins: int = 12) -> ColumnDistributionMetrics:
    """Compute comprehensive distribution metrics, histogram bins, and box plot boundaries."""
    total_count = int(len(series))
    missing_count = int(series.isna().sum())
    valid_vals = series.dropna().astype(float)

    if len(valid_vals) == 0:
        return ColumnDistributionMetrics(
            count=total_count,
            missing_count=missing_count
        )

    min_val = float(valid_vals.min())
    max_val = float(valid_vals.max())
    mean_val = float(valid_vals.mean())
    median_val = float(valid_vals.median())
    std_val = float(valid_vals.std(ddof=0))
    q1_val = float(valid_vals.quantile(0.25))
    q3_val = float(valid_vals.quantile(0.75))
    iqr_val = float(q3_val - q1_val)

    # Skewness
    if len(valid_vals) > 2 and std_val > 0:
        skew_val = float(valid_vals.skew())
    else:
        skew_val = 0.0

    zero_count = int((valid_vals == 0.0).sum())
    negative_count = int((valid_vals < 0.0).sum())

    # Outlier detection via standard Tukey IQR
    lower_fence = q1_val - 1.5 * iqr_val
    upper_fence = q3_val + 1.5 * iqr_val
    outliers_mask = (valid_vals < lower_fence) | (valid_vals > upper_fence)
    outlier_count = int(outliers_mask.sum())
    outlier_pct = float(outlier_count / len(valid_vals) * 100.0) if len(valid_vals) > 0 else 0.0
    outlier_points = [round(float(x), 4) for x in valid_vals[outliers_mask].head(25).tolist()]

    # Box Plot Stats
    non_outliers = valid_vals[~outliers_mask]
    lower_whisker = float(non_outliers.min()) if len(non_outliers) > 0 else min_val
    upper_whisker = float(non_outliers.max()) if len(non_outliers) > 0 else max_val

    boxplot_stats = BoxPlotStats(
        min=round(min_val, 4),
        q1=round(q1_val, 4),
        median=round(median_val, 4),
        q3=round(q3_val, 4),
        max=round(max_val, 4),
        lower_whisker=round(lower_whisker, 4),
        upper_whisker=round(upper_whisker, 4),
        outlier_points=outlier_points
    )

    # Histogram Bins
    histogram_bins: List[HistogramBin] = []
    if min_val == max_val or np.isnan(min_val):
        histogram_bins.append(HistogramBin(
            bin_start=round(min_val, 4),
            bin_end=round(max_val, 4),
            count=len(valid_vals)
        ))
    else:
        counts, edges = np.histogram(valid_vals, bins=num_bins)
        for i in range(len(counts)):
            b_start = float(edges[i])
            b_end = float(edges[i + 1])
            histogram_bins.append(HistogramBin(
                bin_start=round(b_start, 4),
                bin_end=round(b_end, 4),
                count=int(counts[i])
            ))

    return ColumnDistributionMetrics(
        count=total_count,
        missing_count=missing_count,
        min=round(min_val, 4),
        max=round(max_val, 4),
        mean=round(mean_val, 4),
        median=round(median_val, 4),
        std=round(std_val, 4),
        q1=round(q1_val, 4),
        q3=round(q3_val, 4),
        iqr=round(iqr_val, 4),
        skewness=round(skew_val, 4),
        zero_count=zero_count,
        negative_count=negative_count,
        outlier_count=outlier_count,
        outlier_percentage=round(outlier_pct, 2),
        histogram_bins=histogram_bins,
        boxplot_stats=boxplot_stats
    )


class TransformationEngine:
    """Orchestration engine coordinating transformation analysis, simulation, and execution."""

    @classmethod
    def get_dataset_summary(cls, dataset_id: str) -> DatasetTransformationSummaryResponse:
        """Scan all numerical columns and provide dataset transformation overview with recommendations."""
        df, _, _ = version_service.get_current_dataset(dataset_id)
        history = version_service.get_history(dataset_id)
        current_version = len(history)

        numerical_cols = [
            col for col in df.columns
            if pd.api.types.is_numeric_dtype(df[col]) and not pd.api.types.is_bool_dtype(df[col])
        ]

        columns_summary: List[ColumnTransformationSummary] = []
        for col in numerical_cols:
            series = df[col]
            metrics = compute_column_distribution(series, num_bins=10)
            
            stats_dict = {
                "skewness": metrics.skewness,
                "outlier_percentage": metrics.outlier_percentage,
                "min": metrics.min,
                "max": metrics.max
            }
            rec = recommend_transformation(col, stats_dict)

            columns_summary.append(ColumnTransformationSummary(
                column=col,
                data_type=str(series.dtype),
                recommended_method=rec.recommended_method,
                selected_method="none",
                count=metrics.count,
                mean=metrics.mean,
                median=metrics.median,
                std=metrics.std,
                min=metrics.min,
                max=metrics.max,
                skewness=metrics.skewness,
                outlier_percentage=metrics.outlier_percentage,
                has_negatives=metrics.negative_count > 0,
                has_zeros=metrics.zero_count > 0,
                recommendation=rec
            ))

        return DatasetTransformationSummaryResponse(
            dataset_id=dataset_id,
            current_version=current_version,
            total_rows=len(df),
            total_columns=len(df.columns),
            numerical_columns_count=len(numerical_cols),
            columns=columns_summary
        )

    @classmethod
    def get_column_detail(cls, dataset_id: str, column: str) -> ColumnTransformationDetailResponse:
        """Deep-dive distribution analysis and calculation breakdown for a specific column."""
        df, _, _ = version_service.get_current_dataset(dataset_id)
        validate_numerical_column(df, column)

        series = df[column]
        metrics = compute_column_distribution(series, num_bins=12)

        stats_dict = {
            "skewness": metrics.skewness,
            "outlier_percentage": metrics.outlier_percentage,
            "min": metrics.min,
            "max": metrics.max
        }
        rec = recommend_transformation(column, stats_dict)

        # Default breakdown based on recommended method
        if rec.recommended_method == "standard":
            _, _, calc = fit_transform_standard(series)
        elif rec.recommended_method == "minmax":
            _, _, calc = fit_transform_minmax(series)
        elif rec.recommended_method == "robust":
            _, _, calc = fit_transform_robust(series)
        elif rec.recommended_method == "log1p":
            try:
                _, _, calc = fit_transform_log1p(series)
            except ValueError:
                _, _, calc = fit_transform_standard(series)
        elif rec.recommended_method == "yeo_johnson":
            _, _, calc = fit_transform_yeo_johnson(series)
        elif rec.recommended_method == "box_cox":
            try:
                _, _, calc = fit_transform_box_cox(series)
            except ValueError:
                _, _, calc = fit_transform_yeo_johnson(series)
        else:
            _, _, calc = fit_transform_standard(series)

        supported_methods = ["standard", "minmax", "robust", "yeo_johnson"]
        if metrics.negative_count == 0:
            supported_methods.append("log1p")
        if metrics.min is not None and metrics.min > 0:
            supported_methods.append("box_cox")

        return ColumnTransformationDetailResponse(
            dataset_id=dataset_id,
            column=column,
            data_type=str(series.dtype),
            current_distribution=metrics,
            recommendation=rec,
            calculation_breakdown=calc,
            supported_methods=supported_methods
        )

    @classmethod
    def execute_transform(
        cls,
        series: pd.Series,
        method: TransformationMethodEnum,
        feature_range: Tuple[float, float] = (0.0, 1.0)
    ) -> Tuple[pd.Series, Dict[str, Any], CalculationStepDetail]:
        """Dispatch series transformation to appropriate scaling or power function."""
        if method == TransformationMethodEnum.STANDARD:
            return fit_transform_standard(series)
        elif method == TransformationMethodEnum.MINMAX:
            return fit_transform_minmax(series, feature_range=feature_range)
        elif method == TransformationMethodEnum.ROBUST:
            return fit_transform_robust(series)
        elif method == TransformationMethodEnum.LOG1P:
            return fit_transform_log1p(series)
        elif method == TransformationMethodEnum.YEO_JOHNSON:
            return fit_transform_yeo_johnson(series)
        elif method == TransformationMethodEnum.BOX_COX:
            return fit_transform_box_cox(series)
        elif method == TransformationMethodEnum.NONE:
            calc = CalculationStepDetail(
                method="none",
                formula="x' = x",
                steps=["No transformation applied. Original values preserved."],
                parameters={},
                sample_calculation="x' = x"
            )
            return series.copy(), {}, calc
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported transformation method: {method}")

    @classmethod
    def preview_transformation(
        cls,
        dataset_id: str,
        request: TransformationPreviewRequest
    ) -> TransformationPreviewResponse:
        """Simulate transformation on in-memory dataframe copy without mutating storage."""
        df, _, _ = version_service.get_current_dataset(dataset_id)
        column = request.column
        method = request.method
        feature_range = (request.feature_range_min, request.feature_range_max)

        validate_transformation_parameters(df, column, method, feature_range)

        original_series = df[column]
        before_metrics = compute_column_distribution(original_series, num_bins=12)

        transformed_series, params, calculation = cls.execute_transform(
            original_series, method, feature_range
        )
        after_metrics = compute_column_distribution(transformed_series, num_bins=12)

        # Sample transformed rows
        sample_indices = original_series.dropna().head(10).index
        sample_rows = [
            SampleTransformedRow(
                index=int(idx),
                original_value=round(float(original_series.loc[idx]), 4),
                transformed_value=round(float(transformed_series.loc[idx]), 4)
            )
            for idx in sample_indices
        ]

        warnings: List[str] = []
        if method == TransformationMethodEnum.MINMAX and before_metrics.outlier_count > 0:
            warnings.append(
                f"MinMaxScaler is sensitive to outliers. {before_metrics.outlier_count} outliers exist, which may squash non-outlier data."
            )
        if method == TransformationMethodEnum.STANDARD and abs(before_metrics.skewness or 0.0) > 1.5:
            warnings.append(
                f"Feature is heavily skewed (skew = {before_metrics.skewness:.2f}). StandardScaler will not reshape skewness; consider Power Transforms or Log1p."
            )

        explanation = {
            "technique": method.value,
            "why_selected": f"Evaluated {method.value} on '{column}' to transform scale and distribution.",
            "skewness_shift": f"Skewness shifted from {before_metrics.skewness:.2f} to {after_metrics.skewness:.2f}.",
            "mean_shift": f"Mean shifted from {before_metrics.mean:.2f} to {after_metrics.mean:.2f}."
        }

        return TransformationPreviewResponse(
            dataset_id=dataset_id,
            column=column,
            method=method.value,
            parameters=params,
            before=before_metrics,
            after=after_metrics,
            sample_rows=sample_rows,
            calculation=calculation,
            warnings=warnings,
            explanation=explanation
        )

    @classmethod
    def apply_transformation(
        cls,
        dataset_id: str,
        request: TransformationApplyRequest
    ) -> TransformationApplyResponse:
        """Apply confirmed transformation, create snapshot version, and persist audit record."""
        if not request.confirmed:
            raise HTTPException(
                status_code=400,
                detail="Transformation requires explicit confirmation. Please set 'confirmed: true'."
            )

        df, _, _ = version_service.get_current_dataset(dataset_id)
        column = request.column
        method = request.method
        feature_range = (request.feature_range_min, request.feature_range_max)

        validate_transformation_parameters(df, column, method, feature_range)

        original_series = df[column]
        before_metrics = compute_column_distribution(original_series, num_bins=12)

        transformed_series, params, _ = cls.execute_transform(
            original_series, method, feature_range
        )
        after_metrics = compute_column_distribution(transformed_series, num_bins=12)

        # Mutate copy
        modified_df = df.copy()
        modified_df[column] = transformed_series

        operation_id = f"transform_{uuid.uuid4().hex[:8]}"
        timestamp_str = datetime.utcnow().isoformat()

        # Save new immutable snapshot version
        new_version_int, _ = version_service.save_new_version(
            dataset_id=dataset_id,
            df=modified_df,
            operation_record={
                "operation_id": operation_id,
                "action": "data_transformation",
                "operation": "data_transformation",
                "column": column,
                "method": method.value,
                "fitted_parameters": params,
                "before": {
                    "mean": before_metrics.mean,
                    "std": before_metrics.std,
                    "skewness": before_metrics.skewness,
                    "min": before_metrics.min,
                    "max": before_metrics.max
                },
                "after": {
                    "mean": after_metrics.mean,
                    "std": after_metrics.std,
                    "skewness": after_metrics.skewness,
                    "min": after_metrics.min,
                    "max": after_metrics.max
                },
                "reason": f"Transformed feature distribution via {method.value}."
            }
        )

        return TransformationApplyResponse(
            dataset_id=dataset_id,
            operation_id=operation_id,
            new_version=new_version_int,
            column=column,
            method=method.value,
            parameters=params,
            before=before_metrics,
            after=after_metrics,
            message=f"Successfully applied {method.value.upper()} to column '{column}' and created Version #{new_version_int}.",
            timestamp=timestamp_str
        )

    @classmethod
    def get_history(cls, dataset_id: str) -> TransformationHistoryResponse:
        """Fetch audit log history of transformation operations."""
        raw_history = version_service.get_history(dataset_id)
        current_version = len(raw_history)

        history_items: List[TransformationHistoryItem] = []
        for entry in raw_history:
            if entry.get("operation") == "data_transformation" or entry.get("action") == "data_transformation" or entry.get("operation_id", "").startswith("transform_"):
                history_items.append(TransformationHistoryItem(
                    operation_id=entry.get("operation_id", f"transform_{entry.get('version', 0)}"),
                    operation="data_transformation",
                    column=entry.get("column", "Unknown"),
                    method=entry.get("method", "standard"),
                    parameters=entry.get("fitted_parameters", {}),
                    before=entry.get("before", {}),
                    after=entry.get("after", {}),
                    reason=entry.get("reason", f"Data transformation {entry.get('method', '')} applied"),
                    source_version=f"v{max(0, entry.get('version', 1) - 1)}",
                    new_version=f"v{entry.get('version', 1)}",
                    timestamp=entry.get("timestamp", "")
                ))

        return TransformationHistoryResponse(
            dataset_id=dataset_id,
            current_version=current_version,
            history=history_items
        )


ScalingEngine = TransformationEngine
