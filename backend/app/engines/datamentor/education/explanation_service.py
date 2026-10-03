"""Explanation Service combining deterministic educational concepts with real dataset evidence."""
import glob
from pathlib import Path
from typing import Dict, Any, Optional
from fastapi import HTTPException, status

from app.core.config import settings
try:
    from app.engines.menti_ai.education.concept_registry import concept_registry
    from app.engines.menti_ai.education.models import (
        ContextualExplanationRequest,
        ContextualExplanationResponse,
        DatasetEvidence,
    )
except ImportError:
    from app.engines.menti_ai.education.concept_registry import concept_registry
    from app.engines.menti_ai.education.models import (
        ContextualExplanationRequest,
        ContextualExplanationResponse,
        DatasetEvidence,
    )
from app.services.ingestion_service import IngestionService
from app.services.profiling_service import profile_dataset, _PROFILE_CACHE


class ExplanationService:
    """Service generating contextual educational explanations grounded in real dataset evidence."""

    def explain(self, request: ContextualExplanationRequest) -> ContextualExplanationResponse:
        """
        Merge general concept knowledge with actual profiling evidence.
        Strictly deterministic. Zero fabrication rule.
        """
        concept = concept_registry.get_concept(request.concept_id)
        if not concept:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Educational concept '{request.concept_id}' not found in registry."
            )

        # Select level explanation
        level_norm = (request.level or "beginner").lower().strip()
        if level_norm == "intermediate":
            selected_explanation = concept.intermediate_explanation
        elif level_norm == "technical":
            selected_explanation = concept.technical_explanation
        else:
            selected_explanation = concept.beginner_explanation
            level_norm = "beginner"

        # Determine title
        if request.column:
            title = f"{concept.title} in '{request.column}'"
        else:
            title = concept.title

        # Grounded dataset evidence (Zero fabrication)
        dataset_evidence = None
        if request.dataset_id:
            profile = self._get_dataset_profile(request.dataset_id)
            if profile:
                dataset_evidence = self._extract_evidence(
                    concept_id=concept.concept_id,
                    profile=profile,
                    column=request.column
                )

        # Next step pipeline recommendation
        next_step = self._generate_next_step(concept.concept_id, request.column)

        return ContextualExplanationResponse(
            concept_id=concept.concept_id,
            title=title,
            level=level_norm,
            selected_explanation=selected_explanation,
            dataset_evidence=dataset_evidence,
            why_it_matters=concept.why_it_matters,
            next_step=next_step,
            related_concepts=concept.related_concepts,
            knowledge_check=concept.knowledge_check
        )

    def _get_dataset_profile(self, dataset_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve dataset profile from cache or disk storage without modifying raw files."""
        if dataset_id in _PROFILE_CACHE:
            return _PROFILE_CACHE[dataset_id]

        pattern = str(settings.STORAGE_DIR / f"{dataset_id}.*")
        matches = glob.glob(pattern)
        if not matches:
            return None

        file_path = Path(matches[0])
        extension = file_path.suffix.lstrip(".").lower()

        try:
            df = IngestionService.read_dataset_to_dataframe(file_path, extension)
            return profile_dataset(df, dataset_id=dataset_id)
        except Exception:
            return None

    def _extract_evidence(
        self,
        concept_id: str,
        profile: Dict[str, Any],
        column: Optional[str]
    ) -> Optional[DatasetEvidence]:
        """Extract exact, non-fabricated metrics from profile dictionary."""
        dataset_summary = profile.get("dataset_summary", {})
        column_profiles = profile.get("column_profiles", {})

        metrics: Dict[str, Any] = {}
        summary_statement = ""

        # Column-specific evidence
        if column and column in column_profiles:
            col_prof = column_profiles[column]
            num_prof = col_prof.get("numerical_profile") or {}
            total_rows = col_prof.get("total_count", dataset_summary.get("row_count", 0))

            if concept_id == "missing_values":
                miss_cnt = col_prof.get("missing_count", 0)
                miss_pct = round(col_prof.get("missing_percentage", 0.0), 2)
                metrics = {
                    "column": column,
                    "missing_count": miss_cnt,
                    "missing_percentage": miss_pct,
                    "total_rows": total_rows
                }
                summary_statement = (
                    f"In your actual dataset, the column '{column}' has {miss_cnt} missing values "
                    f"out of {total_rows} total rows ({miss_pct}%)."
                )

            elif concept_id == "skewness":
                skew = num_prof.get("skewness")
                metrics = {
                    "column": column,
                    "skewness": skew,
                    "mean": num_prof.get("mean"),
                    "median": num_prof.get("median")
                }
                skew_desc = "strongly skewed" if skew and abs(skew) > 1.0 else "moderately/symmetrically distributed"
                summary_statement = (
                    f"In your actual dataset, column '{column}' exhibits a skewness coefficient of "
                    f"{round(skew, 2) if skew is not None else 'N/A'}, indicating it is {skew_desc}."
                )

            elif concept_id in ("mean", "median", "standard_deviation", "variance", "minimum", "maximum", "quartiles", "iqr"):
                metrics = {
                    "column": column,
                    "mean": num_prof.get("mean"),
                    "median": num_prof.get("median"),
                    "standard_deviation": num_prof.get("standard_deviation"),
                    "minimum": num_prof.get("minimum"),
                    "maximum": num_prof.get("maximum"),
                    "Q1": num_prof.get("Q1"),
                    "Q3": num_prof.get("Q3"),
                    "IQR": num_prof.get("IQR"),
                    "skewness": num_prof.get("skewness")
                }
                if concept_id == "mean":
                    summary_statement = f"In your actual dataset, column '{column}' has an arithmetic mean of {num_prof.get('mean')}."
                elif concept_id == "median":
                    summary_statement = f"In your actual dataset, column '{column}' has a median (50th percentile) of {num_prof.get('median')}."
                elif concept_id == "standard_deviation":
                    summary_statement = f"In your actual dataset, column '{column}' has a standard deviation of {num_prof.get('standard_deviation')}."
                elif concept_id == "variance":
                    std_val = num_prof.get("standard_deviation")
                    var_val = round(std_val ** 2, 4) if std_val is not None else None
                    metrics["variance"] = var_val
                    summary_statement = f"In your actual dataset, column '{column}' has a calculated variance of {var_val}."
                elif concept_id == "minimum":
                    summary_statement = f"In your actual dataset, column '{column}' has an observed minimum of {num_prof.get('minimum')}."
                elif concept_id == "maximum":
                    summary_statement = f"In your actual dataset, column '{column}' has an observed maximum of {num_prof.get('maximum')}."
                elif concept_id == "quartiles":
                    summary_statement = f"In your actual dataset, column '{column}' has quartiles Q1={num_prof.get('Q1')}, Median={num_prof.get('median')}, Q3={num_prof.get('Q3')}."
                elif concept_id == "iqr":
                    summary_statement = f"In your actual dataset, column '{column}' has an Interquartile Range (IQR) of {num_prof.get('IQR')}."

            elif concept_id in ("cardinality", "identifier"):
                uniq_cnt = col_prof.get("unique_count", 0)
                uniq_pct = round(col_prof.get("unique_percentage", 0.0), 2)
                metrics = {
                    "column": column,
                    "unique_count": uniq_cnt,
                    "unique_percentage": uniq_pct,
                    "total_rows": total_rows
                }
                summary_statement = (
                    f"In your actual dataset, column '{column}' has {uniq_cnt} unique values out of {total_rows} rows "
                    f"({uniq_pct}% uniqueness)."
                )

            elif concept_id in ("constant_features", "near_constant_features"):
                uniq_cnt = col_prof.get("unique_count", 0)
                metrics = {"column": column, "unique_count": uniq_cnt, "total_rows": total_rows}
                summary_statement = (
                    f"In your actual dataset, column '{column}' has {uniq_cnt} unique value(s) across {total_rows} rows."
                )

            else:
                metrics = {
                    "column": column,
                    "pandas_dtype": col_prof.get("pandas_dtype"),
                    "semantic_type": col_prof.get("semantic_type"),
                    "missing_count": col_prof.get("missing_count", 0),
                    "unique_count": col_prof.get("unique_count", 0)
                }
                summary_statement = (
                    f"In your actual dataset, column '{column}' is identified as {col_prof.get('semantic_type')} "
                    f"({col_prof.get('pandas_dtype')}) with {col_prof.get('missing_count', 0)} missing values."
                )

            return DatasetEvidence(
                column=column,
                metrics=metrics,
                summary_statement=summary_statement
            )

        # Dataset-level evidence
        if concept_id in ("duplicate_records", "duplicate"):
            dup_rows = dataset_summary.get("duplicate_rows", 0)
            dup_pct = dataset_summary.get("duplicate_percentage", 0.0)
            metrics = {
                "duplicate_rows": dup_rows,
                "duplicate_percentage": dup_pct,
                "total_rows": dataset_summary.get("row_count", 0)
            }
            summary_statement = (
                f"In your actual dataset, {dup_rows} exact duplicate rows were detected "
                f"({dup_pct}% of {dataset_summary.get('row_count', 0)} total rows)."
            )
            return DatasetEvidence(
                column=None,
                metrics=metrics,
                summary_statement=summary_statement
            )

        elif concept_id in ("dataset", "row", "column", "observation"):
            metrics = {
                "row_count": dataset_summary.get("row_count", 0),
                "column_count": dataset_summary.get("column_count", 0),
                "missing_cells": dataset_summary.get("missing_cells", 0),
                "missing_cells_percentage": dataset_summary.get("missing_cells_percentage", 0.0)
            }
            summary_statement = (
                f"Your active dataset contains {dataset_summary.get('row_count', 0)} rows and "
                f"{dataset_summary.get('column_count', 0)} columns, with {dataset_summary.get('missing_cells', 0)} "
                f"missing cells ({dataset_summary.get('missing_cells_percentage', 0.0)}% overall)."
            )
            return DatasetEvidence(
                column=None,
                metrics=metrics,
                summary_statement=summary_statement
            )

        # General dataset fallback evidence
        metrics = {
            "row_count": dataset_summary.get("row_count", 0),
            "column_count": dataset_summary.get("column_count", 0)
        }
        summary_statement = (
            f"Active dataset: {dataset_summary.get('row_count', 0)} rows and "
            f"{dataset_summary.get('column_count', 0)} columns."
        )
        return DatasetEvidence(column=column, metrics=metrics, summary_statement=summary_statement)

    def _generate_next_step(self, concept_id: str, column: Optional[str]) -> str:
        """Provide concrete pipeline guidance connected to DataMentor AI stages."""
        col_ref = f"'{column}'" if column else "this feature"

        if concept_id == "missing_values":
            return f"In Stage 3 (Data Cleaning), apply median/mean imputation or drop {col_ref} if missingness exceeds acceptable thresholds."
        elif concept_id == "duplicate_records":
            return "In Stage 3 (Data Cleaning), use one-click deduplication to remove duplicate rows before model training."
        elif concept_id in ("constant_features", "near_constant_features"):
            return f"In Stage 3 (Data Cleaning) or Stage 7 (Feature Selection), drop {col_ref} to eliminate uninformative zero-variance inputs."
        elif concept_id == "skewness":
            return f"In Stage 5 (Transformation), consider applying a logarithmic (log1p) or Yeo-Johnson power transformation to normalize {col_ref}."
        elif concept_id in ("identifier", "cardinality"):
            return f"In Stage 3 & Stage 7, exclude {col_ref} from feature inputs to prevent model memorization and overfitting."
        elif concept_id == "outlier":
            return f"In Stage 3 or Stage 5, inspect anomalies in {col_ref} and consider RobustScaler or percentile clipping (winsorization)."
        elif concept_id == "numerical_data":
            return f"In Stage 5 (Transformation), scale {col_ref} using StandardScaler or RobustScaler to ensure equal gradient step sizes."
        elif concept_id == "categorical_data":
            return f"In Stage 5 (Transformation), apply One-Hot Encoding for low cardinality or Target Encoding if {col_ref} has high cardinality."
        elif concept_id == "datetime_data":
            return f"In Stage 6 (Feature Engineering), decompose {col_ref} into day-of-week, hour, month, and elapsed time features."
        else:
            return "Proceed to Stage 3 (Data Cleaning) to address identified issues, then advance to Stage 4 (Understanding)."


explanation_service = ExplanationService()
