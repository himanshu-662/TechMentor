"""Feature Selection Engine executing SelectKBest scoring and feature filtering."""
import uuid
from datetime import datetime
from typing import Dict, Any, List, Tuple, Optional
from fastapi import HTTPException
import numpy as np
import pandas as pd
from sklearn.feature_selection import (
    SelectKBest,
    f_classif,
    f_regression,
    mutual_info_classif,
    mutual_info_regression
)

from app.services.version_service import version_service
from app.engines.menti_ai.education.concept_registry import concept_registry
try:
    from app.engines.datamentor.feature_selection.models import (
        FeatureScorerEnum,
        FeatureSelectionPreviewRequest,
        FeatureSelectionPreviewResponse,
        FeatureSelectionApplyRequest,
        FeatureSelectionApplyResponse,
        FeatureScoreDetail,
        FeatureSelectionSummaryResponse
    )
except ImportError:
    from app.feature_selection.models import (
        FeatureScorerEnum,
        FeatureSelectionPreviewRequest,
        FeatureSelectionPreviewResponse,
        FeatureSelectionApplyRequest,
        FeatureSelectionApplyResponse,
        FeatureScoreDetail,
        FeatureSelectionSummaryResponse
    )

SCORER_MAP = {
    FeatureScorerEnum.F_CLASSIF: f_classif,
    FeatureScorerEnum.F_REGRESSION: f_regression,
    FeatureScorerEnum.MUTUAL_INFO_CLASSIF: mutual_info_classif,
    FeatureScorerEnum.MUTUAL_INFO_REGRESSION: mutual_info_regression
}


class FeatureSelectionEngine:
    """Orchestrator for Step 09: Feature Selection (SelectKBest)."""

    @classmethod
    def get_summary(cls, dataset_id: str) -> FeatureSelectionSummaryResponse:
        """Inspect dataset and return candidate targets, numeric features, and recommendation metadata."""
        df, _, _ = version_service.get_current_dataset(dataset_id)
        total_rows = len(df)
        total_cols = len(df.columns)

        numeric_features = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]
        
        # Potential target columns: object, category, or low-cardinality discrete integers (e.g. classification classes)
        potential_targets = []
        for c in df.columns:
            u_count = df[c].nunique(dropna=True)
            if not pd.api.types.is_numeric_dtype(df[c]) or (u_count <= 20 and u_count >= 2):
                potential_targets.append(c)

        # Fallback to last column if no potential targets found
        if not potential_targets and len(df.columns) > 0:
            potential_targets = [df.columns[-1]]

        recommended_target = potential_targets[0] if potential_targets else None
        
        # Determine recommended scoring based on target dtype
        recommended_scoring = "f_classif"
        if recommended_target and recommended_target in df.columns:
            target_series = df[recommended_target]
            if pd.api.types.is_numeric_dtype(target_series) and target_series.nunique() > 10:
                recommended_scoring = "f_regression"

        can_execute = len(numeric_features) >= 1 and len(potential_targets) >= 1
        rec_k = min(max(1, len(numeric_features) - 1), 5) if can_execute else 1

        if can_execute:
            msg = f"Ready for feature selection. Detected {len(numeric_features)} numerical features across {total_rows} rows."
        else:
            msg = f"Feature selection requires at least 1 numerical feature and a valid target column."

        return FeatureSelectionSummaryResponse(
            dataset_id=dataset_id,
            total_rows=total_rows,
            total_columns=total_cols,
            numeric_feature_count=len(numeric_features),
            numeric_features=numeric_features,
            potential_target_columns=potential_targets,
            recommended_target=recommended_target,
            recommended_scoring=recommended_scoring,
            recommended_k=rec_k,
            can_execute=can_execute,
            message=msg
        )

    @classmethod
    def execute_selection(
        cls,
        df: pd.DataFrame,
        target_column: str,
        k: int = 3,
        scoring_func: FeatureScorerEnum = FeatureScorerEnum.F_CLASSIF,
        feature_columns: Optional[List[str]] = None
    ) -> Tuple[pd.DataFrame, List[str], List[str], List[FeatureScoreDetail], List[str]]:
        """
        Execute SelectKBest feature scoring and ranking.
        
        Returns:
            (selected_df, selected_feature_names, removed_feature_names, feature_scores_list, warnings)
        """
        if not target_column or target_column not in df.columns:
            raise ValueError(f"Target column '{target_column}' does not exist in dataset.")

        # Determine numerical candidate features
        if feature_columns:
            features = [c for c in feature_columns if c in df.columns and c != target_column and pd.api.types.is_numeric_dtype(df[c])]
        else:
            features = [c for c in df.columns if c != target_column and pd.api.types.is_numeric_dtype(df[c])]

        if len(features) < 1:
            raise ValueError("Feature selection requires at least 1 numerical feature.")

        warnings: List[str] = []
        clean_df = df[features + [target_column]].dropna()
        if len(clean_df) == 0:
            raise ValueError("No complete rows found without nulls for feature scoring.")

        X = clean_df[features].values
        y = clean_df[target_column].values

        target_k = min(k, len(features))
        scorer_callable = SCORER_MAP.get(scoring_func, f_classif)

        try:
            selector = SelectKBest(score_func=scorer_callable, k=target_k)
            selector.fit(X, y)
        except Exception as e:
            # Fallback to f_regression if classification fails on continuous target
            if "continuous" in str(e).lower() and scoring_func == FeatureScorerEnum.F_CLASSIF:
                selector = SelectKBest(score_func=f_regression, k=target_k)
                selector.fit(X, y)
                warnings.append("Target appears continuous; switched to ANOVA f_regression scorer.")
            else:
                raise ValueError(f"Feature scoring failed: {str(e)}")

        scores = selector.scores_
        p_values = selector.pvalues_ if hasattr(selector, "pvalues_") and selector.pvalues_ is not None else None

        # Sort features by score descending
        ranked_indices = np.argsort(scores)[::-1]
        
        selected_mask = selector.get_support()
        selected_features = [features[i] for i in range(len(features)) if selected_mask[i]]
        removed_features = [features[i] for i in range(len(features)) if not selected_mask[i]]

        score_details: List[FeatureScoreDetail] = []
        for rank_pos, idx in enumerate(ranked_indices):
            feat_name = features[idx]
            sc = float(scores[idx]) if not np.isnan(scores[idx]) else 0.0
            pv = float(p_values[idx]) if (p_values is not None and not np.isnan(p_values[idx])) else None
            
            score_details.append(
                FeatureScoreDetail(
                    feature=feat_name,
                    score=round(sc, 4),
                    p_value=round(pv, 6) if pv is not None else None,
                    rank=rank_pos + 1,
                    selected=bool(selected_mask[idx])
                )
            )

        # Build filtered dataset: Selected Features + Target Column (+ any non-numerical metadata columns if user keeps them)
        cols_to_keep = selected_features + [target_column]
        filtered_df = df[cols_to_keep].copy()

        return filtered_df, selected_features, removed_features, score_details, warnings

    @classmethod
    def preview_selection(
        cls,
        dataset_id: str,
        request: FeatureSelectionPreviewRequest
    ) -> FeatureSelectionPreviewResponse:
        """Non-destructive simulation preview for feature selection."""
        df, _, _ = version_service.get_current_dataset(dataset_id)
        
        filtered_df, selected_feats, removed_feats, score_details, warnings = cls.execute_selection(
            df=df,
            target_column=request.target_column,
            k=request.k,
            scoring_func=request.scoring_func,
            feature_columns=request.feature_columns
        )

        concept = concept_registry.get_concept("feature_selection")
        edu_dict = {
            "title": concept.title if concept else "Feature Selection",
            "short_definition": concept.short_definition if concept else "Selects top informative original features based on statistical association with target.",
            "beginner_explanation": concept.beginner_explanation if concept else "",
            "why_it_matters": concept.why_it_matters if concept else "",
            "interview_tip": concept.interview_tip if concept else "",
            "common_mistakes": concept.common_mistakes if concept else []
        }

        return FeatureSelectionPreviewResponse(
            dataset_id=dataset_id,
            target_column=request.target_column,
            k=len(selected_feats),
            scoring_func=request.scoring_func.value,
            selected_features=selected_feats,
            removed_features=removed_feats,
            feature_scores=score_details,
            before_columns_count=len(df.columns),
            after_columns_count=len(filtered_df.columns),
            warnings=warnings,
            explanation=edu_dict
        )

    @classmethod
    def apply_selection(
        cls,
        dataset_id: str,
        request: FeatureSelectionApplyRequest
    ) -> FeatureSelectionApplyResponse:
        """Apply SelectKBest filtering and persist new snapshot version."""
        if not request.confirmed:
            raise HTTPException(status_code=400, detail="Feature selection requires explicit confirmation. Please set 'confirmed: true'.")

        df, _, _ = version_service.get_current_dataset(dataset_id)
        
        filtered_df, selected_feats, removed_feats, score_details, warnings = cls.execute_selection(
            df=df,
            target_column=request.target_column,
            k=request.k,
            scoring_func=request.scoring_func,
            feature_columns=request.feature_columns
        )

        op_id = f"select_{uuid.uuid4().hex[:8]}"
        timestamp_str = datetime.utcnow().isoformat()

        new_version_int, _ = version_service.save_new_version(
            dataset_id=dataset_id,
            df=filtered_df,
            operation_record={
                "operation_id": op_id,
                "action": "feature_selection",
                "operation": "select_k_best",
                "k": len(selected_feats),
                "scoring_func": request.scoring_func.value,
                "target_column": request.target_column,
                "selected_features": selected_feats,
                "removed_features": removed_feats,
                "before_shape": {"rows": len(df), "columns": len(df.columns)},
                "after_shape": {"rows": len(filtered_df), "columns": len(filtered_df.columns)},
                "timestamp": timestamp_str
            }
        )

        return FeatureSelectionApplyResponse(
            dataset_id=dataset_id,
            operation_id=op_id,
            new_version=new_version_int,
            target_column=request.target_column,
            k=len(selected_feats),
            selected_features=selected_feats,
            removed_features=removed_feats,
            shape={"rows": len(filtered_df), "columns": len(filtered_df.columns)},
            message=f"Successfully selected top {len(selected_feats)} features (Version {new_version_int}).",
            timestamp=timestamp_str
        )


SelectionEngine = FeatureSelectionEngine
