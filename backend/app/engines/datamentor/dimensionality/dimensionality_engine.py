"""Dimensionality Reduction Engine executing PCA, LDA, and SVD transformations."""
import uuid
from datetime import datetime
from typing import Dict, Any, List, Tuple, Optional
from fastapi import HTTPException
import numpy as np
import pandas as pd
from sklearn.decomposition import PCA, TruncatedSVD
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.preprocessing import StandardScaler

from app.services.version_service import version_service
from app.engines.menti_ai.education.concept_registry import concept_registry
from app.dimensionality.models import (
    DimensionalityMethodEnum,
    DimensionalityPreviewRequest,
    DimensionalityPreviewResponse,
    DimensionalityApplyRequest,
    DimensionalityApplyResponse,
    ScreePlotPoint,
    SampleComponentRow,
    DimensionalitySummaryResponse
)


class DimensionalityEngine:
    """Orchestrator for Step 08: Dimensionality Reduction."""

    @classmethod
    def get_summary(cls, dataset_id: str) -> DimensionalitySummaryResponse:
        """Inspect dataset and return dimensionality reduction feasibility and metadata."""
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

        can_execute = len(numeric_features) >= 2
        rec_comps = min(len(numeric_features), 2) if can_execute else 0
        
        if can_execute:
            msg = f"Ready for dimensionality reduction. Found {len(numeric_features)} numerical features across {total_rows} rows."
        else:
            msg = f"Dimensionality reduction requires at least 2 numerical features. Currently found {len(numeric_features)}."

        return DimensionalitySummaryResponse(
            dataset_id=dataset_id,
            total_rows=total_rows,
            total_columns=total_cols,
            numeric_feature_count=len(numeric_features),
            numeric_features=numeric_features,
            potential_target_columns=potential_targets,
            recommended_method="pca",
            recommended_components=rec_comps,
            can_execute=can_execute,
            message=msg
        )

    @classmethod
    def execute_reduction(
        cls,
        df: pd.DataFrame,
        method: DimensionalityMethodEnum,
        n_components: int,
        target_column: Optional[str] = None,
        feature_columns: Optional[List[str]] = None,
        scale_first: bool = True
    ) -> Tuple[pd.DataFrame, List[str], List[float], List[float], Dict[str, Dict[str, float]], List[ScreePlotPoint], List[str]]:
        """
        Execute PCA / LDA / SVD on numerical feature space.
        
        Returns:
            (reduced_df, new_component_names, explained_variance_ratios, cumulative_ratios, loadings, scree_data, warnings)
        """
        # Determine numerical feature columns
        if feature_columns:
            features = [c for c in feature_columns if c in df.columns and pd.api.types.is_numeric_dtype(df[c])]
        else:
            features = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c]) and c != target_column]

        if len(features) < 2:
            raise ValueError(f"Dimensionality reduction requires at least 2 numerical features. Found {len(features)}.")

        warnings: List[str] = []
        X = df[features].fillna(df[features].median()).values
        
        if scale_first:
            scaler = StandardScaler()
            X = scaler.fit_transform(X)

        n_feats = len(features)
        target_k = min(n_components, n_feats)

        loadings: Dict[str, Dict[str, float]] = {}
        scree_data: List[ScreePlotPoint] = []

        if method == DimensionalityMethodEnum.PCA:
            pca = PCA(n_components=target_k)
            transformed = pca.fit_transform(X)
            var_ratios = [float(v) for v in pca.explained_variance_ratio_]
            cum_ratios = list(np.cumsum(var_ratios))
            comp_names = [f"PC_{i+1}" for i in range(target_k)]

            # Loadings
            for i, c_name in enumerate(comp_names):
                loadings[c_name] = {feat: round(float(pca.components_[i, j]), 4) for j, feat in enumerate(features)}
                scree_data.append(
                    ScreePlotPoint(
                        component=i + 1,
                        component_name=c_name,
                        explained_variance_ratio=round(var_ratios[i], 4),
                        cumulative_variance_ratio=round(cum_ratios[i], 4),
                        singular_value=round(float(pca.singular_values_[i]), 4) if hasattr(pca, "singular_values_") else None
                    )
                )

        elif method == DimensionalityMethodEnum.LDA:
            if not target_column or target_column not in df.columns:
                raise ValueError("Supervised Linear Discriminant Analysis (LDA) requires a valid 'target_column'.")
            
            y = df[target_column].astype(str).values
            n_classes = len(np.unique(y))
            if n_classes < 2:
                raise ValueError("LDA requires a target column with at least 2 distinct classes.")

            max_lda_components = min(n_feats, n_classes - 1)
            target_k = min(target_k, max_lda_components)
            if target_k < 1:
                target_k = 1

            lda = LinearDiscriminantAnalysis(n_components=target_k)
            transformed = lda.fit_transform(X, y)
            
            if hasattr(lda, "explained_variance_ratio_") and lda.explained_variance_ratio_ is not None:
                var_ratios = [float(v) for v in lda.explained_variance_ratio_]
            else:
                var_ratios = [1.0 / target_k] * target_k

            cum_ratios = list(np.cumsum(var_ratios))
            comp_names = [f"LD_{i+1}" for i in range(target_k)]

            for i, c_name in enumerate(comp_names):
                scree_data.append(
                    ScreePlotPoint(
                        component=i + 1,
                        component_name=c_name,
                        explained_variance_ratio=round(var_ratios[i], 4),
                        cumulative_variance_ratio=round(cum_ratios[i], 4)
                    )
                )

        elif method == DimensionalityMethodEnum.SVD:
            svd = TruncatedSVD(n_components=target_k)
            transformed = svd.fit_transform(X)
            var_ratios = [float(v) for v in svd.explained_variance_ratio_]
            cum_ratios = list(np.cumsum(var_ratios))
            comp_names = [f"SVD_{i+1}" for i in range(target_k)]

            for i, c_name in enumerate(comp_names):
                loadings[c_name] = {feat: round(float(svd.components_[i, j]), 4) for j, feat in enumerate(features)}
                scree_data.append(
                    ScreePlotPoint(
                        component=i + 1,
                        component_name=c_name,
                        explained_variance_ratio=round(var_ratios[i], 4),
                        cumulative_variance_ratio=round(cum_ratios[i], 4),
                        singular_value=round(float(svd.singular_values_[i]), 4)
                    )
                )
        else:
            raise ValueError(f"Unsupported dimensionality reduction method: '{method}'")

        # Build reduced DataFrame preserving target if exists
        reduced_df = pd.DataFrame(transformed, columns=comp_names, index=df.index)
        if target_column and target_column in df.columns:
            reduced_df[target_column] = df[target_column]

        return reduced_df, comp_names, var_ratios, cum_ratios, loadings, scree_data, warnings

    @classmethod
    def preview_reduction(
        cls,
        dataset_id: str,
        request: DimensionalityPreviewRequest
    ) -> DimensionalityPreviewResponse:
        """Non-destructive simulation preview for dimensionality reduction."""
        df, _, _ = version_service.get_current_dataset(dataset_id)
        
        reduced_df, comp_names, var_ratios, cum_ratios, loadings, scree_data, warnings = cls.execute_reduction(
            df=df,
            method=request.method,
            n_components=request.n_components,
            target_column=request.target_column,
            feature_columns=request.feature_columns,
            scale_first=request.scale_first
        )

        sample_rows: List[SampleComponentRow] = []
        for idx in df.head(10).index:
            comp_dict = {c: round(float(reduced_df.loc[idx, c]), 4) for c in comp_names}
            sample_rows.append(SampleComponentRow(index=int(idx), components=comp_dict))

        concept = concept_registry.get_concept(request.method.value) or concept_registry.get_concept("pca")
        edu_dict = {
            "title": concept.title if concept else "Dimensionality Reduction",
            "short_definition": concept.short_definition if concept else "Projects high-dimensional feature space onto orthogonal components.",
            "beginner_explanation": concept.beginner_explanation if concept else "",
            "why_it_matters": concept.why_it_matters if concept else "",
            "interview_tip": concept.interview_tip if concept else "",
            "common_mistakes": concept.common_mistakes if concept else []
        }

        features = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c]) and c != request.target_column]
        total_var = float(np.sum(var_ratios))

        return DimensionalityPreviewResponse(
            dataset_id=dataset_id,
            method=request.method.value,
            n_original_features=len(features),
            n_components=len(comp_names),
            original_feature_names=features,
            new_component_names=comp_names,
            explained_variance_ratio=var_ratios,
            cumulative_variance_ratio=cum_ratios,
            total_variance_explained=round(total_var, 4),
            scree_plot_data=scree_data,
            component_loadings=loadings,
            sample_rows=sample_rows,
            warnings=warnings,
            explanation=edu_dict
        )

    @classmethod
    def apply_reduction(
        cls,
        dataset_id: str,
        request: DimensionalityApplyRequest
    ) -> DimensionalityApplyResponse:
        """Apply dimensionality reduction and store immutable snapshot version."""
        if not request.confirmed:
            raise HTTPException(status_code=400, detail="Dimensionality reduction requires explicit confirmation. Please set 'confirmed: true'.")

        df, _, _ = version_service.get_current_dataset(dataset_id)
        
        reduced_df, comp_names, var_ratios, _, _, _, _ = cls.execute_reduction(
            df=df,
            method=request.method,
            n_components=request.n_components,
            target_column=request.target_column,
            feature_columns=request.feature_columns,
            scale_first=request.scale_first
        )

        op_id = f"dim_{uuid.uuid4().hex[:8]}"
        timestamp_str = datetime.utcnow().isoformat()
        total_var = float(np.sum(var_ratios))

        new_version_int, _ = version_service.save_new_version(
            dataset_id=dataset_id,
            df=reduced_df,
            operation_record={
                "operation_id": op_id,
                "action": "dimensionality_reduction",
                "operation": request.method.value,
                "n_components": len(comp_names),
                "component_names": comp_names,
                "total_variance_explained": total_var,
                "before_shape": {"rows": len(df), "columns": len(df.columns)},
                "after_shape": {"rows": len(reduced_df), "columns": len(reduced_df.columns)},
                "timestamp": timestamp_str
            }
        )

        return DimensionalityApplyResponse(
            dataset_id=dataset_id,
            operation_id=op_id,
            new_version=new_version_int,
            method=request.method.value,
            n_components=len(comp_names),
            new_component_names=comp_names,
            shape={"rows": len(reduced_df), "columns": len(reduced_df.columns)},
            total_variance_explained=round(total_var, 4),
            message=f"Successfully reduced dimensions into {len(comp_names)} component(s) via {request.method.value.upper()} (Version {new_version_int}).",
            timestamp=timestamp_str
        )
