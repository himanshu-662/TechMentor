"""Train-Test Split Engine isolating training and testing partitions to prevent data leakage."""
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Tuple
from fastapi import HTTPException
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

from app.services.version_service import version_service
from app.engines.menti_ai.education.concept_registry import concept_registry
try:
    from app.engines.datamentor.split.models import (
        TrainTestSplitRequest,
        TrainTestSplitResponse,
        SampleSplitRow,
        SplitSummaryResponse
    )
except ImportError:
    from app.split.models import (
        TrainTestSplitRequest,
        TrainTestSplitResponse,
        SampleSplitRow,
        SplitSummaryResponse
    )


class SplitEngine:
    """Orchestrator for Step 10: Train-Test Split."""

    @classmethod
    def get_split_dir(cls, dataset_id: str) -> Path:
        """Retrieve dedicated session split storage directory."""
        session_dir = version_service.get_session_dir(dataset_id)
        split_dir = session_dir / "split"
        split_dir.mkdir(parents=True, exist_ok=True)
        return split_dir

    @classmethod
    def get_summary(cls, dataset_id: str) -> SplitSummaryResponse:
        """Inspect dataset and return split readiness summary and recommendations."""
        df, _, _ = version_service.get_current_dataset(dataset_id)
        total_rows = len(df)
        total_cols = len(df.columns)

        numeric_cols = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]

        # Identify candidate target columns
        potential_targets: List[str] = []
        for c in df.columns:
            u_count = df[c].nunique(dropna=True)
            # Classification-friendly categorical/discrete or realistic targets
            if not pd.api.types.is_numeric_dtype(df[c]) or (2 <= u_count <= 50):
                potential_targets.append(c)

        if not potential_targets and len(df.columns) > 0:
            potential_targets = [df.columns[-1]]

        recommended_target = potential_targets[0] if potential_targets else None

        # Check if already partitioned
        split_dir = cls.get_split_dir(dataset_id)
        already_split = (
            (split_dir / "X_train.csv").exists()
            and (split_dir / "X_test.csv").exists()
            and (split_dir / "y_train.csv").exists()
            and (split_dir / "y_test.csv").exists()
        )

        can_execute = total_rows >= 5 and total_cols >= 2

        # Recommended stratification
        rec_stratify = True
        if recommended_target and recommended_target in df.columns:
            target_series = df[recommended_target]
            if pd.api.types.is_numeric_dtype(target_series) and target_series.nunique() > 20:
                rec_stratify = False  # Continuous regression targets cannot be stratified without binning

        feature_cols = [c for c in df.columns if c != recommended_target]

        return SplitSummaryResponse(
            dataset_id=dataset_id,
            total_rows=total_rows,
            total_columns=total_cols,
            numeric_feature_count=len(numeric_cols),
            feature_columns=feature_cols,
            potential_target_columns=potential_targets,
            recommended_target=recommended_target,
            recommended_test_size=0.2,
            recommended_stratify=rec_stratify,
            can_execute=can_execute,
            split_already_performed=already_split,
            message="Ready for train-test split." if can_execute else "Dataset must have at least 5 rows and 2 columns for splitting."
        )

    @classmethod
    def execute_split(
        cls,
        dataset_id: str,
        request: TrainTestSplitRequest
    ) -> TrainTestSplitResponse:
        """
        Split dataset into strictly isolated training and testing partitions.
        Persists X_train, X_test, y_train, y_test for Steps 11, 12, 13.
        """
        df, _, _ = version_service.get_current_dataset(dataset_id)
        target_col = request.target_column

        if not target_col or target_col not in df.columns:
            raise HTTPException(status_code=400, detail=f"Target column '{target_col}' not found in dataset.")

        clean_df = df.dropna(subset=[target_col]).copy()
        if len(clean_df) < 5:
            raise HTTPException(status_code=400, detail="Dataset has fewer than 5 rows with non-null target values.")

        feature_cols = [c for c in clean_df.columns if c != target_col]
        X = clean_df[feature_cols]
        y = clean_df[target_col]

        # Determine target type
        is_classification = (not pd.api.types.is_numeric_dtype(y)) or (y.nunique() <= 10)
        target_type = "classification" if is_classification else "regression"

        stratify_param = y if (request.stratify and is_classification and (y.value_counts().min() >= 2)) else None

        X_train, X_test, y_train, y_test = train_test_split(
            X, y,
            test_size=request.test_size,
            random_state=request.random_state,
            stratify=stratify_param
        )

        # Persist partitions to avoid data leakage
        split_dir = cls.get_split_dir(dataset_id)
        X_train.to_csv(split_dir / "X_train.csv", index=False)
        X_test.to_csv(split_dir / "X_test.csv", index=False)
        pd.DataFrame({target_col: y_train}).to_csv(split_dir / "y_train.csv", index=False)
        pd.DataFrame({target_col: y_test}).to_csv(split_dir / "y_test.csv", index=False)

        # Compute target distribution
        target_dist: Dict[str, Any] = {}
        if is_classification:
            target_dist = {
                "train_counts": {str(k): int(v) for k, v in y_train.value_counts().items()},
                "test_counts": {str(k): int(v) for k, v in y_test.value_counts().items()}
            }
        else:
            target_dist = {
                "train_mean": round(float(y_train.mean()), 4),
                "test_mean": round(float(y_test.mean()), 4),
                "train_std": round(float(y_train.std()), 4) if len(y_train) > 1 else 0.0,
                "test_std": round(float(y_test.std()), 4) if len(y_test) > 1 else 0.0
            }

        def _safe_val(val):
            if pd.isna(val):
                return None
            if isinstance(val, (np.integer, int)):
                return int(val)
            if isinstance(val, (np.floating, float)):
                return float(val)
            return str(val)

        sample_rows: List[SampleSplitRow] = []
        for idx in X_train.head(5).index:
            sample_rows.append(
                SampleSplitRow(
                    index=int(idx),
                    split_type="train",
                    features={c: _safe_val(X_train.loc[idx, c]) for c in feature_cols[:6]},
                    target_value=_safe_val(y_train.loc[idx])
                )
            )
        for idx in X_test.head(5).index:
            sample_rows.append(
                SampleSplitRow(
                    index=int(idx),
                    split_type="test",
                    features={c: _safe_val(X_test.loc[idx, c]) for c in feature_cols[:6]},
                    target_value=_safe_val(y_test.loc[idx])
                )
            )

        total_count = len(clean_df)
        train_count = len(X_train)
        test_count = len(X_test)

        concept = concept_registry.get_concept("train_test_split")
        edu_dict = {
            "title": concept.title if concept else "Train-Test Split & Data Leakage Prevention",
            "short_definition": concept.short_definition if concept else "Partitions features and target into training and evaluation sets.",
            "beginner_explanation": concept.beginner_explanation if concept else "",
            "why_it_matters": concept.why_it_matters if concept else "",
            "interview_tip": concept.interview_tip if concept else "",
            "common_mistakes": concept.common_mistakes if concept else []
        }

        safeguards = [
            "Test partition isolated to session storage and locked from training routines.",
            "Preprocessing scalers, encoders, and imputers must only be fitted on X_train.",
            "Stratified sampling active" if stratify_param is not None else "Uniform random sampling applied without stratification.",
            f"Deterministic partition enforced via random_state={request.random_state}."
        ]

        return TrainTestSplitResponse(
            success=True,
            dataset_id=dataset_id,
            target_column=target_col,
            total_rows=total_count,
            train_rows=train_count,
            test_rows=test_count,
            train_percentage=round(train_count / total_count * 100, 1),
            test_percentage=round(test_count / total_count * 100, 1),
            feature_columns=feature_cols,
            target_type=target_type,
            target_distribution=target_dist,
            sample_rows=sample_rows,
            explanation=edu_dict,
            leakage_safeguards=safeguards,
            message=f"Successfully partitioned {total_count} records into {train_count} training rows ({round(train_count / total_count * 100)}%) and {test_count} testing rows ({round(test_count / total_count * 100)}%).",
            timestamp=datetime.utcnow().isoformat()
        )

    @classmethod
    def load_split(cls, dataset_id: str) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series, str]:
        """Loads cached train/test partitions for modeling."""
        split_dir = cls.get_split_dir(dataset_id)
        x_train_path = split_dir / "X_train.csv"
        x_test_path = split_dir / "X_test.csv"
        y_train_path = split_dir / "y_train.csv"
        y_test_path = split_dir / "y_test.csv"

        if not (x_train_path.exists() and x_test_path.exists() and y_train_path.exists() and y_test_path.exists()):
            raise HTTPException(
                status_code=400,
                detail="Train/Test split has not been performed for this dataset. Please execute Step 10 first."
            )

        X_train = pd.read_csv(x_train_path)
        X_test = pd.read_csv(x_test_path)
        y_train_df = pd.read_csv(y_train_path)
        y_test_df = pd.read_csv(y_test_path)

        target_col = y_train_df.columns[0]
        y_train = y_train_df[target_col]
        y_test = y_test_df[target_col]

        return X_train, X_test, y_train, y_test, target_col
