from typing import Dict, Any, List, Optional, Tuple
import pandas as pd
import numpy as np
from fastapi import HTTPException, status
try:
    from app.engines.datamentor.outliers.models import (
        DetectionMethodEnum,
        TreatmentTypeEnum,
        ColumnOutlierSummary,
        DatasetOutlierSummaryResponse,
        ColumnOutlierDetailResponse,
        DistributionStats,
        HistogramBin,
        OutlierRecord,
        MetricsComparison,
        OutlierPreviewResponse,
        OutlierApplyResponse,
        SampleChangedRecord,
        CalculationDetail
    )
    from app.engines.datamentor.outliers.detectors import (
        detect_outliers_iqr,
        detect_outliers_zscore,
        detect_outliers_modified_zscore
    )
    from app.engines.datamentor.outliers.treatments import treat_keep, treat_remove, treat_cap, treat_flag
    from app.engines.datamentor.outliers.recommendations import generate_outlier_recommendation
    from app.engines.datamentor.outliers.validation import (
        validate_numerical_column,
        validate_outlier_parameters,
        validate_treatment_request
    )
except ImportError:
    from app.outliers.models import (
        DetectionMethodEnum,
        TreatmentTypeEnum,
        ColumnOutlierSummary,
        DatasetOutlierSummaryResponse,
        ColumnOutlierDetailResponse,
        DistributionStats,
        HistogramBin,
        OutlierRecord,
        MetricsComparison,
        OutlierPreviewResponse,
        OutlierApplyResponse,
        SampleChangedRecord,
        CalculationDetail
    )
    from app.outliers.detectors import (
        detect_outliers_iqr,
        detect_outliers_zscore,
        detect_outliers_modified_zscore
    )
    from app.outliers.treatments import treat_keep, treat_remove, treat_cap, treat_flag
    from app.outliers.recommendations import generate_outlier_recommendation
    from app.outliers.validation import (
        validate_numerical_column,
        validate_outlier_parameters,
        validate_treatment_request
    )
from app.services.version_service import version_service


def clean_primitive(val: Any) -> Any:
    """Safely convert NumPy/Pandas scalar types into standard Python primitives for Pydantic/JSON."""
    if pd.isna(val) or val is None:
        return None
    if isinstance(val, (np.floating, float)):
        if np.isneginf(val) or np.isposinf(val) or np.isnan(val):
            return None
        return float(val)
    if isinstance(val, (np.integer, int)):
        return int(val)
    if isinstance(val, (np.bool_, bool)):
        return bool(val)
    if isinstance(val, (pd.Timestamp, np.datetime64)):
        return str(val)
    return str(val) if not isinstance(val, (str, int, float, bool)) else val


class OutlierEngine:
    """Core domain engine for outlier detection, recommendation, visualization data, and treatments."""

    @classmethod
    def get_numerical_columns(cls, df: pd.DataFrame) -> List[str]:
        """Identify all numerical columns suitable for outlier analysis."""
        num_cols = []
        for col in df.columns:
            if pd.api.types.is_numeric_dtype(df[col]):
                num_cols.append(str(col))
            else:
                converted = pd.to_numeric(df[col], errors='coerce')
                if converted.dropna().count() > 0 and (converted.dropna().count() / len(df) >= 0.7):
                    num_cols.append(str(col))
        return num_cols

    @classmethod
    def run_detection(
        cls,
        series: pd.Series,
        method: str,
        parameters: Optional[Dict[str, Any]] = None
    ) -> Tuple[pd.Series, Optional[float], Optional[float], CalculationDetail, Dict[str, Any]]:
        """Run the specified detection algorithm on a Pandas Series."""
        params = validate_outlier_parameters(method, parameters)

        if method == "iqr" or method == DetectionMethodEnum.IQR:
            return detect_outliers_iqr(series, multiplier=params.get("multiplier", 1.5))
        elif method == "zscore" or method == DetectionMethodEnum.ZSCORE:
            return detect_outliers_zscore(series, threshold=params.get("threshold", 3.0))
        elif method == "modified_zscore" or method == DetectionMethodEnum.MODIFIED_ZSCORE:
            return detect_outliers_modified_zscore(series, threshold=params.get("threshold", 3.5))
        else:
            raise ValueError(f"Unknown detection method: {method}")

    @classmethod
    def compute_distribution_stats(
        cls,
        series: pd.Series,
        lower_bound: Optional[float] = None,
        upper_bound: Optional[float] = None
    ) -> DistributionStats:
        """Compute comprehensive statistical metrics and histogram bins."""
        clean = pd.to_numeric(series, errors='coerce').dropna()
        clean = clean[~np.isinf(clean)]

        count = int(len(clean))
        missing_count = int(series.isna().sum())

        if count == 0:
            return DistributionStats(count=0, missing_count=missing_count)

        min_val = float(clean.min())
        max_val = float(clean.max())
        mean_val = float(clean.mean())
        median_val = float(clean.median())
        std_val = float(clean.std(ddof=1)) if count > 1 else 0.0
        abs_dev = (clean - median_val).abs()
        mad_val = float(abs_dev.median())
        q1_val = float(clean.quantile(0.25))
        q3_val = float(clean.quantile(0.75))
        iqr_val = float(q3_val - q1_val)
        skew_val = float(clean.skew()) if count > 2 else 0.0
        if np.isnan(skew_val):
            skew_val = 0.0

        # Build histogram bins (10 bins)
        bins = []
        if min_val < max_val and count > 0:
            num_bins = min(12, max(5, int(np.sqrt(count))))
            counts, bin_edges = np.histogram(clean, bins=num_bins)
            for i in range(len(counts)):
                b_start = float(bin_edges[i])
                b_end = float(bin_edges[i+1])
                b_count = int(counts[i])
                
                # Check if this bin falls in outlier territory
                is_outlier_bin = False
                if lower_bound is not None and b_start < lower_bound:
                    is_outlier_bin = True
                if upper_bound is not None and b_end > upper_bound:
                    is_outlier_bin = True

                bins.append(HistogramBin(
                    bin_start=round(b_start, 4),
                    bin_end=round(b_end, 4),
                    count=b_count,
                    has_outlier=is_outlier_bin
                ))
        elif count > 0:
            bins.append(HistogramBin(
                bin_start=min_val,
                bin_end=max_val,
                count=count,
                has_outlier=False
            ))

        return DistributionStats(
            count=count,
            missing_count=missing_count,
            min=round(min_val, 4),
            max=round(max_val, 4),
            mean=round(mean_val, 4),
            median=round(median_val, 4),
            std=round(std_val, 4),
            mad=round(mad_val, 4),
            q1=round(q1_val, 4),
            q3=round(q3_val, 4),
            iqr=round(iqr_val, 4),
            skewness=round(skew_val, 4),
            histogram_bins=bins
        )

    @classmethod
    def get_dataset_summary(cls, dataset_id: str) -> DatasetOutlierSummaryResponse:
        """Generate dataset-level outlier overview across all numerical columns."""
        df, _, _ = version_service.get_current_dataset(dataset_id)
        history = version_service.get_history(dataset_id)
        num_cols = cls.get_numerical_columns(df)

        summaries: List[ColumnOutlierSummary] = []
        total_outliers_detected = 0
        cols_with_outliers = 0

        for col in num_cols:
            recommendation = generate_outlier_recommendation(df[col], col)
            method = recommendation.recommended_method

            mask, lower, upper, _, _ = cls.run_detection(df[col], method)
            outlier_count = int(mask.sum())
            total_count = len(df)
            pct = round((outlier_count / total_count * 100), 2) if total_count > 0 else 0.0

            clean = pd.to_numeric(df[col], errors='coerce').dropna()
            skew_val = float(clean.skew()) if len(clean) > 2 else 0.0

            if outlier_count > 0:
                cols_with_outliers += 1
                total_outliers_detected += outlier_count

            summaries.append(ColumnOutlierSummary(
                column=col,
                recommended_method=recommendation.recommended_method,
                selected_method=method,
                outlier_count=outlier_count,
                outlier_percentage=pct,
                lower_bound=round(lower, 4) if lower is not None else None,
                upper_bound=round(upper, 4) if upper is not None else None,
                skewness=round(skew_val, 4) if not np.isnan(skew_val) else 0.0,
                recommendation=recommendation
            ))

        return DatasetOutlierSummaryResponse(
            dataset_id=dataset_id,
            current_version=len(history),
            total_rows=len(df),
            total_columns=len(df.columns),
            numerical_columns_count=len(num_cols),
            columns_with_outliers_count=cols_with_outliers,
            total_outliers_detected=total_outliers_detected,
            columns=summaries
        )

    @classmethod
    def get_column_detail(
        cls,
        dataset_id: str,
        column: str,
        method: Optional[str] = None,
        parameters: Optional[Dict[str, Any]] = None
    ) -> ColumnOutlierDetailResponse:
        """Deep-dive outlier inspection for a single column with real calculation and records sample."""
        df, _, _ = version_service.get_current_dataset(dataset_id)
        validate_numerical_column(df, column)

        recommendation = generate_outlier_recommendation(df[column], column)
        active_method = method or recommendation.recommended_method
        params = validate_outlier_parameters(active_method, parameters)

        mask, lower, upper, calc_detail, stats_dict = cls.run_detection(df[column], active_method, params)
        dist_stats = cls.compute_distribution_stats(df[column], lower, upper)

        outlier_count = int(mask.sum())
        total_rows = len(df)
        pct = round((outlier_count / total_rows * 100), 2) if total_rows > 0 else 0.0

        # Extract flagged outlier records (up to 20 samples)
        flagged_df = df[mask]
        records: List[OutlierRecord] = []
        for idx in flagged_df.index[:20]:
            val = float(df.loc[idx, column])
            direction = "low" if (lower is not None and val < lower) else "high"
            
            # Context sample columns (other non-target features)
            row_dict = {}
            for other_col in df.columns[:8]:
                if other_col != column:
                    other_val = df.loc[idx, other_col]
                    row_dict[str(other_col)] = clean_primitive(other_val)

            # Calculate individual score (distance or zscore)
            score = None
            if active_method == "zscore" and dist_stats.std and dist_stats.std > 0:
                score = round((val - dist_stats.mean) / dist_stats.std, 2)
            elif active_method == "modified_zscore" and dist_stats.mad and dist_stats.mad > 0:
                score = round(0.6745 * (val - dist_stats.median) / dist_stats.mad, 2)
            elif lower is not None and upper is not None:
                if direction == "low":
                    score = round(val - lower, 2)
                else:
                    score = round(val - upper, 2)

            records.append(OutlierRecord(
                index=int(idx),
                value=val,
                direction=direction,
                score=score,
                row_data=row_dict
            ))

        return ColumnOutlierDetailResponse(
            dataset_id=dataset_id,
            column=column,
            data_type=str(df[column].dtype),
            method=active_method,
            parameters=params,
            outlier_count=outlier_count,
            outlier_percentage=pct,
            lower_bound=round(lower, 4) if lower is not None else None,
            upper_bound=round(upper, 4) if upper is not None else None,
            distribution=dist_stats,
            calculation=calc_detail,
            recommendation=recommendation,
            outlier_records_sample=records,
            total_flagged_records=outlier_count
        )

    @classmethod
    def preview_treatment(
        cls,
        dataset_id: str,
        column: str,
        detection_method: str,
        parameters: Optional[Dict[str, Any]],
        treatment: str,
        custom_lower: Optional[float] = None,
        custom_upper: Optional[float] = None
    ) -> OutlierPreviewResponse:
        """Generate non-destructive before/after metrics for an outlier treatment."""
        df, _, _ = version_service.get_current_dataset(dataset_id)
        validate_numerical_column(df, column)
        validate_treatment_request(treatment, custom_lower, custom_upper)
        params = validate_outlier_parameters(detection_method, parameters)

        # 1. Detection
        mask, auto_lower, auto_upper, _, _ = cls.run_detection(df[column], detection_method, params)
        eff_lower = custom_lower if treatment == "custom_bounds" else auto_lower
        eff_upper = custom_upper if treatment == "custom_bounds" else auto_upper

        if treatment == "custom_bounds":
            num_col = pd.to_numeric(df[column], errors='coerce')
            mask = pd.Series(False, index=df.index)
            if eff_lower is not None:
                mask = mask | (num_col < eff_lower)
            if eff_upper is not None:
                mask = mask | (num_col > eff_upper)

        # 2. Before metrics
        # 2. Before metrics
        clean_before = pd.to_numeric(df[column], errors='coerce').dropna()
        before_dist = cls.compute_distribution_stats(df[column], auto_lower, auto_upper)
        before_metrics = MetricsComparison(
            row_count=len(df),
            column_count=len(df.columns),
            outlier_count=int(mask.sum()),
            min=round(float(clean_before.min()), 4) if len(clean_before) > 0 else None,
            max=round(float(clean_before.max()), 4) if len(clean_before) > 0 else None,
            mean=round(float(clean_before.mean()), 4) if len(clean_before) > 0 else None,
            median=round(float(clean_before.median()), 4) if len(clean_before) > 0 else None,
            std=round(float(clean_before.std(ddof=1)), 4) if len(clean_before) > 1 else 0.0,
            skewness=round(before_dist.skewness, 4) if before_dist.skewness is not None else 0.0,
            histogram_bins=before_dist.histogram_bins
        )

        # 3. Simulate treatment
        if treatment == "keep":
            treated_df, affected_count, removed, capped, sample_changed = treat_keep(df, column)
        elif treatment == "remove":
            treated_df, affected_count, removed, capped, sample_changed = treat_remove(df, column, mask)
        elif treatment in ("cap", "custom_bounds"):
            treated_df, affected_count, removed, capped, sample_changed = treat_cap(df, column, eff_lower, eff_upper)
        elif treatment == "flag":
            treated_df, affected_count, removed, capped, sample_changed = treat_flag(df, column, mask)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported treatment: {treatment}")

        # 4. After metrics
        clean_after = pd.to_numeric(treated_df[column], errors='coerce').dropna() if len(treated_df) > 0 else pd.Series([])
        after_dist = cls.compute_distribution_stats(treated_df[column], eff_lower, eff_upper)
        
        # Check remaining outliers with same bounds
        after_outliers = 0
        if treatment == "flag":
            after_outliers = int(mask.sum())
        elif len(clean_after) > 0 and (eff_lower is not None or eff_upper is not None):
            low_check = (clean_after < eff_lower) if eff_lower is not None else False
            high_check = (clean_after > eff_upper) if eff_upper is not None else False
            after_outliers = int((low_check | high_check).sum())

        after_metrics = MetricsComparison(
            row_count=len(treated_df),
            column_count=len(treated_df.columns),
            outlier_count=after_outliers,
            min=round(float(clean_after.min()), 4) if len(clean_after) > 0 else None,
            max=round(float(clean_after.max()), 4) if len(clean_after) > 0 else None,
            mean=round(float(clean_after.mean()), 4) if len(clean_after) > 0 else None,
            median=round(float(clean_after.median()), 4) if len(clean_after) > 0 else None,
            std=round(float(clean_after.std(ddof=1)), 4) if len(clean_after) > 1 else 0.0,
            skewness=round(after_dist.skewness, 4) if after_dist.skewness is not None else 0.0,
            histogram_bins=after_dist.histogram_bins
        )

        # 5. Warnings
        warnings = []
        if treatment == "remove" and removed > 0.1 * len(df):
            warnings.append(
                f"Removing {removed} rows ({round(removed/len(df)*100, 1)}%) reduces sample size substantially. "
                "Consider capping (Winsorization) to avoid loss of data."
            )
        if len(treated_df) == 0:
            warnings.append("Treatment removes 100% of rows in the dataset!")

        samples = [SampleChangedRecord(**s) for s in sample_changed]

        # 6. Educational Impact Insight
        std_before = before_metrics.std or 1.0
        std_after = after_metrics.std or 1.0
        var_reduction = round((1.0 - (std_after / std_before)) * 100.0, 1) if std_before > 0 else 0.0

        if treatment in ("cap", "custom_bounds"):
            summary_text = (
                f"Winsorization clamped {capped} extreme outlier(s) to boundary [{eff_lower}, {eff_upper}]. "
                f"Variance reduced by {max(0.0, var_reduction)}% while preserving all {before_metrics.row_count} rows. "
                f"Protects linear and distance-based models from extreme parameter distortion."
            )
        elif treatment == "remove":
            summary_text = (
                f"Trimming deleted {removed} outlier row(s) ({round(removed/len(df)*100, 1)}% of dataset). "
                f"Standard deviation dropped from {before_metrics.std} to {after_metrics.std}. "
                f"Eliminates corrupt sensor data, but reduces statistical sample power."
            )
        elif treatment == "flag":
            summary_text = (
                f"Added indicator column '{column}_is_outlier' marking {affected_count} anomaly row(s). "
                f"Original continuous values are 100% preserved, allowing downstream tree models to learn non-linear anomaly penalties."
            )
        else:
            summary_text = "Kept all observations intact. Ideal for tree-based algorithms (XGBoost, Random Forest) that naturally partition thresholds."

        educational_impact = {
            "treatment": treatment,
            "variance_reduction_pct": var_reduction,
            "skewness_before": before_metrics.skewness,
            "skewness_after": after_metrics.skewness,
            "summary": summary_text
        }

        return OutlierPreviewResponse(
            dataset_id=dataset_id,
            column=column,
            treatment=treatment,
            detection_method=detection_method,
            parameters=params,
            before=before_metrics,
            after=after_metrics,
            affected_rows=affected_count,
            rows_removed=removed,
            values_capped=capped,
            lower_bound=round(eff_lower, 4) if eff_lower is not None else None,
            upper_bound=round(eff_upper, 4) if eff_upper is not None else None,
            sample_changed_records=samples,
            warnings=warnings,
            educational_impact=educational_impact
        )

    @classmethod
    def apply_treatment(
        cls,
        dataset_id: str,
        column: str,
        detection_method: str,
        parameters: Optional[Dict[str, Any]],
        treatment: str,
        custom_lower: Optional[float] = None,
        custom_upper: Optional[float] = None,
        confirmed: bool = False
    ) -> OutlierApplyResponse:
        """Apply outlier treatment, create immutable snapshot version, and log history."""
        if not confirmed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Operation rejected. Outlier treatments require explicit user confirmation (confirmed: true)."
            )

        # First run preview to obtain treated DataFrame and verified metrics
        preview = cls.preview_treatment(
            dataset_id=dataset_id,
            column=column,
            detection_method=detection_method,
            parameters=parameters,
            treatment=treatment,
            custom_lower=custom_lower,
            custom_upper=custom_upper
        )

        df, _, _ = version_service.get_current_dataset(dataset_id)
        params = validate_outlier_parameters(detection_method, parameters)
        mask, auto_lower, auto_upper, _, _ = cls.run_detection(df[column], detection_method, params)
        eff_lower = custom_lower if treatment == "custom_bounds" else auto_lower
        eff_upper = custom_upper if treatment == "custom_bounds" else auto_upper

        if treatment == "custom_bounds":
            num_col = pd.to_numeric(df[column], errors='coerce')
            mask = pd.Series(False, index=df.index)
            if eff_lower is not None:
                mask = mask | (num_col < eff_lower)
            if eff_upper is not None:
                mask = mask | (num_col > eff_upper)

        if treatment == "keep":
            treated_df, affected_count, _, _, _ = treat_keep(df, column)
        elif treatment == "remove":
            treated_df, affected_count, _, _, _ = treat_remove(df, column, mask)
        elif treatment in ("cap", "custom_bounds"):
            treated_df, affected_count, _, _, _ = treat_cap(df, column, eff_lower, eff_upper)
        elif treatment == "flag":
            treated_df, affected_count, _, _, _ = treat_flag(df, column, mask)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported treatment: {treatment}")

        # Record history item
        history = version_service.get_history(dataset_id)
        op_id = f"outlier_op_{len(history) + 1:03d}"
        operation_record = {
            "operation_id": op_id,
            "operation": "outlier_treatment",
            "action": f"outlier_{treatment}",
            "column": column,
            "detection_method": detection_method,
            "treatment": treatment,
            "parameters": params,
            "bounds": {
                "lower": preview.lower_bound,
                "upper": preview.upper_bound
            },
            "before": {
                "rows": preview.before.row_count,
                "outliers": preview.before.outlier_count,
                "mean": preview.before.mean,
                "std": preview.before.std
            },
            "after": {
                "rows": preview.after.row_count,
                "outliers": preview.after.outlier_count,
                "mean": preview.after.mean,
                "std": preview.after.std
            },
            "affected_rows": preview.affected_rows,
            "rows_removed": preview.rows_removed,
            "values_capped": preview.values_capped,
            "reason": f"Applied {treatment.upper()} outlier treatment to column '{column}' using {detection_method.upper()} detection."
        }

        # Save new immutable version
        new_version_num, _ = version_service.save_new_version(
            dataset_id=dataset_id,
            df=treated_df,
            operation_record=operation_record
        )

        return OutlierApplyResponse(
            dataset_id=dataset_id,
            operation_id=op_id,
            new_version=new_version_num,
            treatment=treatment,
            column=column,
            before=preview.before,
            after=preview.after,
            affected_rows=preview.affected_rows,
            message=f"Successfully applied {treatment.upper()} treatment to column '{column}'. Created version {new_version_num}.",
            timestamp=operation_record.get("timestamp", "")
        )


outlier_engine = OutlierEngine()
