"""Encoding Engine executing One-Hot, Label, Ordinal, and Frequency transformations."""
import uuid
from datetime import datetime
from typing import Dict, Any, List, Tuple, Optional
from fastapi import HTTPException
import numpy as np
import pandas as pd
from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder, LabelEncoder

from app.services.version_service import version_service
from app.engines.menti_ai.education.concept_registry import concept_registry
try:
    from app.engines.datamentor.encoding.models import (
        EncodingMethodEnum,
        ColumnCardinalityInfo,
        EncodingPreviewRequest,
        EncodingPreviewResponse,
        EncodingApplyRequest,
        EncodingApplyResponse,
        EncodingSummaryResponse,
        SampleEncodedRow,
    )
except ImportError:
    from app.encoding.models import (
        EncodingMethodEnum,
        ColumnCardinalityInfo,
        EncodingPreviewRequest,
        EncodingPreviewResponse,
        EncodingApplyRequest,
        EncodingApplyResponse,
        EncodingSummaryResponse,
        SampleEncodedRow,
    )

# Known common ordinal sequences for automatic hierarchy detection
KNOWN_ORDINAL_SEQUENCES: List[List[str]] = [
    # Size scales
    ["xs", "s", "m", "l", "xl", "xxl", "xxxl"],
    ["extra small", "small", "medium", "large", "extra large"],
    # Quality / Sentiment scales
    ["poor", "fair", "good", "very good", "excellent"],
    ["terrible", "bad", "okay", "neutral", "good", "great", "excellent"],
    ["low", "medium", "high", "very high"],
    ["low", "med", "high"],
    # Likert scale
    ["strongly disagree", "disagree", "neutral", "agree", "strongly agree"],
    # Education
    ["primary", "secondary", "highschool", "high school", "associate", "bachelor", "bachelors", "master", "masters", "doctorate", "phd"],
    # Frequency
    ["never", "rarely", "sometimes", "often", "always"],
    # Severity / Priority
    ["trivial", "minor", "major", "critical", "blocker"],
    ["low", "medium", "high", "urgent"],
    # Tiers
    ["bronze", "silver", "gold", "platinum", "diamond"],
]


class EncodingEngine:
    """Orchestrator for Step 06: Data Encoding."""

    @staticmethod
    def _detect_ordinal_pattern(categories: List[str]) -> Optional[List[str]]:
        """Check if unique categories match a known domain hierarchy."""
        if not categories or len(categories) < 2:
            return None

        cat_lookup = {str(c).strip().lower(): str(c) for c in categories}
        cat_lower_set = set(cat_lookup.keys())

        for seq in KNOWN_ORDINAL_SEQUENCES:
            # Check how many items in this sequence exist in cat_lower_set
            matched_indices = []
            for item in seq:
                if item in cat_lower_set:
                    matched_indices.append(item)
            
            # If at least 70% of categories match this sequence and in sequence order
            if len(matched_indices) >= max(2, int(len(cat_lower_set) * 0.7)):
                ordered_original = [cat_lookup[k] for k in matched_indices if k in cat_lookup]
                # Append any remaining categories at the end
                for k, orig in cat_lookup.items():
                    if orig not in ordered_original:
                        ordered_original.append(orig)
                return ordered_original

        return None

    @classmethod
    def get_summary(cls, dataset_id: str) -> EncodingSummaryResponse:
        """Inspect all categorical/object columns and compute cardinality metrics."""
        df, _, _ = version_service.get_current_dataset(dataset_id)
        
        cat_cols_info: List[ColumnCardinalityInfo] = []
        for col in df.columns:
            series = df[col]
            # Consider non-numeric dtypes or boolean or low-cardinality object columns
            if not pd.api.types.is_numeric_dtype(series) or pd.api.types.is_bool_dtype(series):
                u_count = int(series.nunique(dropna=True))
                null_count = int(series.isna().sum())
                has_nulls = bool(null_count > 0)
                
                vc = series.value_counts(dropna=True)
                top_cats = [str(x) for x in vc.head(5).index]
                all_cats = [str(x) for x in series.dropna().unique()][:50]
                counts_dict = {str(k): int(v) for k, v in vc.head(10).items()}

                # Ordinal pattern check
                detected_order = cls._detect_ordinal_pattern(all_cats)

                # Pedagogical recommendation logic
                if detected_order:
                    rec = "ordinal"
                    order_preview = " < ".join(detected_order[:3]) + ("..." if len(detected_order) > 3 else "")
                    rationale = f"Detected natural semantic hierarchy ({order_preview}). Ordinal encoding preserves rank order without increasing dimensionality."
                elif u_count == 2:
                    rec = "label"
                    rationale = "Binary categorical feature (2 distinct levels). Label encoding efficiently maps directly to [0, 1]."
                elif u_count <= 15:
                    rec = "one_hot"
                    rationale = f"Low cardinality ({u_count} levels). One-Hot Encoding prevents introducing false numerical distance."
                else:
                    rec = "frequency"
                    rationale = f"High cardinality ({u_count} levels). Frequency Encoding captures category popularity without expanding feature dimensionality."

                cat_cols_info.append(
                    ColumnCardinalityInfo(
                        column=col,
                        unique_count=u_count,
                        top_categories=top_cats,
                        all_categories=all_cats,
                        category_counts=counts_dict,
                        has_nulls=has_nulls,
                        null_count=null_count,
                        recommended_method=rec,
                        rationale=rationale,
                        detected_ordinal_order=detected_order
                    )
                )

        return EncodingSummaryResponse(
            dataset_id=dataset_id,
            total_categorical_columns=len(cat_cols_info),
            columns=cat_cols_info
        )

    @classmethod
    def execute_encoding(
        cls,
        df: pd.DataFrame,
        columns: List[str],
        method: EncodingMethodEnum,
        handle_unknown: str = "ignore",
        drop_first: bool = False,
        ordinal_mappings: Optional[Dict[str, List[str]]] = None,
        frequency_metric: Optional[str] = "frequency",
        rare_category_threshold: Optional[float] = None
    ) -> Tuple[pd.DataFrame, List[str], Dict[str, Any], List[str], float, float]:
        """
        Execute encoding transformation on DataFrame copy.
        
        Returns:
            (encoded_df, new_column_names, category_mappings, warnings, sparsity_percentage, memory_impact_kb)
        """
        for col in columns:
            if col not in df.columns:
                raise ValueError(f"Column '{col}' not found in dataset.")

        modified_df = df.copy()
        new_cols_created: List[str] = []
        mappings: Dict[str, Any] = {}
        warnings: List[str] = []
        initial_mem_kb = modified_df.memory_usage(deep=True).sum() / 1024.0

        # Optional rare category grouping prior to encoding
        if rare_category_threshold and rare_category_threshold > 0.0:
            for col in columns:
                series = modified_df[col]
                freqs = series.value_counts(normalize=True, dropna=True)
                rare_cats = freqs[freqs < rare_category_threshold].index.tolist()
                if rare_cats:
                    modified_df[col] = modified_df[col].apply(lambda x: "Other" if x in rare_cats else x)
                    warnings.append(
                        f"Grouped {len(rare_cats)} rare categories (< {rare_category_threshold*100:.1f}%) in '{col}' into 'Other'."
                    )

        if method == EncodingMethodEnum.ONE_HOT:
            for col in columns:
                series = modified_df[col].fillna("Missing").astype(str)
                u_count = series.nunique()
                if u_count > 50:
                    warnings.append(
                        f"Column '{col}' has high cardinality ({u_count} categories). "
                        f"One-Hot Encoding will expand feature space significantly. Consider Frequency or Target encoding."
                    )
                
                encoder = OneHotEncoder(
                    sparse_output=False,
                    handle_unknown="ignore",
                    drop="first" if drop_first else None
                )
                encoded_arr = encoder.fit_transform(np.asarray(series).reshape(-1, 1))
                categories = encoder.categories_[0]
                if drop_first:
                    categories = categories[1:]
                
                col_names = [f"{col}_{str(cat).replace(' ', '_')}" for cat in categories]
                encoded_df_part = pd.DataFrame(encoded_arr, columns=col_names, index=modified_df.index)
                
                # Replace original column in-place
                col_idx = modified_df.columns.get_loc(col)
                modified_df = modified_df.drop(columns=[col])
                for idx, c_name in enumerate(col_names):
                    modified_df.insert(col_idx + idx, c_name, encoded_df_part[c_name])
                    new_cols_created.append(c_name)
                    
                mappings[col] = [str(c) for c in categories]

                if not drop_first:
                    warnings.append(
                        f"One-Hot Encoding '{col}' with drop_first=False creates {len(categories)} dummy columns. "
                        f"If training unregularized linear models, this causes the Dummy Variable Trap (exact multicollinearity)."
                    )

        elif method == EncodingMethodEnum.LABEL:
            for col in columns:
                series = modified_df[col].fillna("Missing").astype(str)
                u_count = series.nunique()
                if u_count > 2:
                    warnings.append(
                        f"Column '{col}' has {u_count} levels. Label encoding introduces an artificial linear ordering (0, 1, 2...); "
                        f"ensure downstream models are tree-based (Random Forest, XGBoost) or that values represent an inherent hierarchy."
                    )
                
                encoder = LabelEncoder()
                encoded_vals = encoder.fit_transform(np.asarray(series))
                modified_df[col] = encoded_vals
                mappings[col] = {str(cat): int(idx) for idx, cat in enumerate(encoder.classes_)}
                new_cols_created.append(col)

        elif method == EncodingMethodEnum.ORDINAL:
            for col in columns:
                series = modified_df[col].fillna("Missing").astype(str)
                u_cats = series.unique().tolist()
                
                specified_order = None
                if ordinal_mappings and col in ordinal_mappings and ordinal_mappings[col]:
                    specified_order = ordinal_mappings[col]
                else:
                    detected = cls._detect_ordinal_pattern(u_cats)
                    if detected:
                        specified_order = detected
                        warnings.append(f"Auto-applied detected natural hierarchy for '{col}': {' < '.join(detected[:4])}...")
                    else:
                        specified_order = sorted(u_cats)
                        warnings.append(
                            f"No explicit order supplied for '{col}'. Applied alphabetical order. "
                            f"For true ordinal data (e.g. Low < Med < High), specify explicit order to preserve semantic hierarchy."
                        )

                encoder = OrdinalEncoder(
                    categories=[specified_order],
                    handle_unknown="use_encoded_value",
                    unknown_value=-1
                )
                
                encoded_vals = encoder.fit_transform(np.asarray(series).reshape(-1, 1)).ravel()
                modified_df[col] = encoded_vals
                mappings[col] = {str(cat): int(idx) for idx, cat in enumerate(specified_order)}
                new_cols_created.append(col)

        elif method == EncodingMethodEnum.FREQUENCY:
            for col in columns:
                series = modified_df[col].fillna("Missing").astype(str)
                total_rows = float(len(series))
                counts = series.value_counts(dropna=False)
                
                if frequency_metric == "count":
                    freq_map = counts.to_dict()
                else:
                    freq_map = (counts / total_rows).round(4).to_dict()

                modified_df[col] = series.map(freq_map).astype(float)
                mappings[col] = {str(k): float(v) for k, v in freq_map.items()}
                new_cols_created.append(col)

        else:
            raise ValueError(f"Unsupported encoding method: '{method}'")

        # Compute sparsity percentage on created columns
        total_elements = 0
        total_zeros = 0
        for col in new_cols_created:
            if col in modified_df.columns:
                c_series = modified_df[col]
                total_elements += len(c_series)
                total_zeros += int((c_series == 0).sum())

        sparsity_pct = round((total_zeros / total_elements * 100.0), 2) if total_elements > 0 else 0.0
        final_mem_kb = modified_df.memory_usage(deep=True).sum() / 1024.0
        mem_impact_kb = round(final_mem_kb - initial_mem_kb, 2)

        return modified_df, new_cols_created, mappings, warnings, sparsity_pct, mem_impact_kb

    @classmethod
    def preview_encoding(
        cls,
        dataset_id: str,
        request: EncodingPreviewRequest
    ) -> EncodingPreviewResponse:
        """Non-destructive simulation of encoding operation."""
        df, _, _ = version_service.get_current_dataset(dataset_id)
        
        encoded_df, new_cols, mappings, warnings, sparsity_pct, mem_impact_kb = cls.execute_encoding(
            df=df,
            columns=request.columns,
            method=request.method,
            handle_unknown=request.handle_unknown,
            drop_first=request.drop_first,
            ordinal_mappings=request.ordinal_mappings,
            frequency_metric=request.frequency_metric,
            rare_category_threshold=request.rare_category_threshold
        )

        sample_indices = df.head(10).index
        sample_rows: List[SampleEncodedRow] = []
        for idx in sample_indices:
            orig_vals = {}
            for col in request.columns:
                if col in df.columns:
                    val = df.loc[idx, col]
                    if hasattr(val, "item"):
                        val = val.item()
                    elif pd.isna(val):
                        val = None
                    orig_vals[col] = val

            enc_vals = {}
            for col in new_cols[:15]:
                if col in encoded_df.columns:
                    val = encoded_df.loc[idx, col]
                    if hasattr(val, "item"):
                        val = val.item()
                    elif pd.isna(val):
                        val = None
                    enc_vals[col] = val

            sample_rows.append(
                SampleEncodedRow(
                    index=int(idx),
                    original_values=orig_vals,
                    encoded_values=enc_vals
                )
            )

        # Concept explainer
        concept_key = f"{request.method.value}_encoding"
        concept = concept_registry.get_concept(concept_key) or concept_registry.get_concept("one_hot_encoding")
        edu_dict = {
            "title": concept.title if concept else "Categorical Encoding",
            "short_definition": concept.short_definition if concept else "Encodes text into numbers for ML models.",
            "beginner_explanation": concept.beginner_explanation if concept else "",
            "intermediate_explanation": concept.intermediate_explanation if concept else "",
            "technical_explanation": concept.technical_explanation if concept else "",
            "why_it_matters": concept.why_it_matters if concept else "",
            "interview_tip": concept.interview_tip if concept else "",
            "common_mistakes": [m.dict() if hasattr(m, 'dict') else m for m in concept.common_mistakes] if concept else []
        }

        trap_risk = (request.method == EncodingMethodEnum.ONE_HOT and not request.drop_first)

        return EncodingPreviewResponse(
            dataset_id=dataset_id,
            method=request.method.value,
            columns_encoded=request.columns,
            new_columns_created=new_cols,
            before_columns_count=len(df.columns),
            after_columns_count=len(encoded_df.columns),
            before_shape={"rows": len(df), "columns": len(df.columns)},
            after_shape={"rows": len(encoded_df), "columns": len(encoded_df.columns)},
            sparsity_percentage=sparsity_pct,
            memory_impact_kb=mem_impact_kb,
            dummy_variable_trap_risk=trap_risk,
            sample_rows=sample_rows,
            category_mappings=mappings,
            warnings=warnings,
            explanation=edu_dict
        )

    @classmethod
    def apply_encoding(
        cls,
        dataset_id: str,
        request: EncodingApplyRequest
    ) -> EncodingApplyResponse:
        """Apply encoding transformation and persist new snapshot version."""
        if not request.confirmed:
            raise HTTPException(status_code=400, detail="Encoding requires explicit confirmation. Please set 'confirmed: true'.")

        df, _, _ = version_service.get_current_dataset(dataset_id)
        
        encoded_df, new_cols, mappings, warnings, sparsity_pct, mem_impact_kb = cls.execute_encoding(
            df=df,
            columns=request.columns,
            method=request.method,
            handle_unknown=request.handle_unknown,
            drop_first=request.drop_first,
            ordinal_mappings=request.ordinal_mappings,
            frequency_metric=request.frequency_metric,
            rare_category_threshold=request.rare_category_threshold
        )

        op_id = f"encode_{uuid.uuid4().hex[:8]}"
        timestamp_str = datetime.utcnow().isoformat()

        new_version_int, _ = version_service.save_new_version(
            dataset_id=dataset_id,
            df=encoded_df,
            operation_record={
                "operation_id": op_id,
                "action": "data_encoding",
                "operation": f"{request.method.value}_encoding",
                "columns_encoded": request.columns,
                "new_columns_created": new_cols,
                "method": request.method.value,
                "mappings": mappings,
                "sparsity_percentage": sparsity_pct,
                "memory_impact_kb": mem_impact_kb,
                "before_shape": {"rows": len(df), "columns": len(df.columns)},
                "after_shape": {"rows": len(encoded_df), "columns": len(encoded_df.columns)},
                "timestamp": timestamp_str
            }
        )

        return EncodingApplyResponse(
            dataset_id=dataset_id,
            operation_id=op_id,
            new_version=new_version_int,
            method=request.method.value,
            columns_encoded=request.columns,
            new_columns_created=new_cols,
            shape={"rows": len(encoded_df), "columns": len(encoded_df.columns)},
            sparsity_percentage=sparsity_pct,
            message=f"Successfully encoded {len(request.columns)} column(s) via {request.method.value} (Version {new_version_int}).",
            timestamp=timestamp_str
        )
