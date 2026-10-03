"""Modeling Engine executing Step 11 (Fit), Step 12 (Predict), and Step 13 (Evaluate)."""
import sys
import time
import uuid
import json
import pickle
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Tuple, Optional
from fastapi import HTTPException
import numpy as np
import pandas as pd

# NumPy 1.x / 2.x pickle backward-compatibility shim
try:
    if hasattr(np, "core") and not hasattr(np, "_core"):
        sys.modules["numpy._core"] = np.core
        sys.modules["numpy._core.numeric"] = np.core.numeric
        sys.modules["numpy._core.multiarray"] = np.core.multiarray
except Exception:
    pass


class SafeUnpickler(pickle.Unpickler):
    def find_class(self, module, name):
        if module.startswith("numpy._core"):
            module = module.replace("numpy._core", "numpy.core")
        return super().find_class(module, name)


def safe_pickle_load(f):
    try:
        return SafeUnpickler(f).load()
    except Exception:
        try:
            f.seek(0)
            return pickle.load(f)
        except Exception:
            raise


from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet, LogisticRegression
from sklearn.tree import DecisionTreeRegressor, DecisionTreeClassifier
from sklearn.ensemble import (
    RandomForestRegressor, 
    RandomForestClassifier, 
    GradientBoostingRegressor, 
    GradientBoostingClassifier,
    IsolationForest
)
from sklearn.svm import SVR, SVC
from sklearn.neighbors import KNeighborsRegressor, KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.cluster import KMeans, DBSCAN
from sklearn.metrics import (
    mean_squared_error,
    r2_score,
    mean_absolute_error,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
    silhouette_score,
    davies_bouldin_score
)

from app.services.version_service import version_service
from app.split.split_engine import SplitEngine
from app.engines.menti_ai.education.concept_registry import concept_registry
from app.modeling.models import (
    ModelTypeEnum,
    ModelFitRequest,
    ModelFitResponse,
    ModelSummaryResponse,
    ModelPredictRequest,
    ModelPredictResponse,
    PredictionItem,
    SinglePredictRequest,
    SinglePredictResponse,
    FeatureStatItem,
    OriginalFeatureItem,
    OriginalSchemaResponse,
    LivePredictRequest,
    LivePredictResponse,
    SampleInstanceResponse,
    BatchNewPredictRequest,
    BatchNewPredictResponse,
    BatchPredictRowItem,
    PredictTemplateResponse,
    EvaluationRequest,
    EvaluationResponse,
    ConfusionMatrixData,
    ClassificationReportClassDetail
)
import io


class ModelingEngine:
    """Orchestrator for Steps 11, 12, 13 (Model Fitting, Prediction, Evaluation)."""

    @classmethod
    def get_models_dir(cls, dataset_id: str) -> Path:
        """Directory for saving serialized model artifacts."""
        session_dir = version_service.get_session_dir(dataset_id)
        m_dir = session_dir / "models"
        m_dir.mkdir(parents=True, exist_ok=True)
        return m_dir

    @classmethod
    def get_summary(cls, dataset_id: str) -> ModelSummaryResponse:
        """Inspect isolated partition files and provide task type and supported algorithms."""
        try:
            X_train, X_test, y_train, y_test, target_col = SplitEngine.load_split(dataset_id)
            has_split = True
            train_count = len(X_train)
            test_count = len(X_test)
            num_X_train = X_train.select_dtypes(include=[np.number]).fillna(0.0)
            feat_names = list(num_X_train.columns)
            feat_count = len(feat_names)

            # Determine task type
            # A target is classification if it's non-numeric (categorical strings)
            # OR if it's integer-typed with few unique values (encoded labels).
            # Float targets are always treated as regression, even with few unique values.
            is_numeric = pd.api.types.is_numeric_dtype(y_train)
            is_integer = pd.api.types.is_integer_dtype(y_train)
            is_classification = (not is_numeric) or (is_integer and y_train.nunique() <= 10)
            task_type = "classification" if is_classification else "regression"

            # Available algorithms categorized by task
            reg_algos = [
                {"id": "linear_regression", "name": "Linear Regression (OLS)", "type": "linear", "category": "regression", "desc": "Closed-form least squares hyperplane optimization with no regularization."},
                {"id": "ridge", "name": "Ridge Regression (L2)", "type": "linear", "category": "regression", "desc": "L2 weight penalty to prevent coefficient explosion on multicollinear data."},
                {"id": "lasso", "name": "Lasso Regression (L1)", "type": "linear", "category": "regression", "desc": "L1 penalty driving uninformative feature weights strictly to zero (sparse selection)."},
                {"id": "elastic_net", "name": "ElasticNet Regression", "type": "linear", "category": "regression", "desc": "Convex combination of L1 and L2 penalties for balanced regularization."},
                {"id": "decision_tree_regressor", "name": "Decision Tree Regressor", "type": "tree", "category": "regression", "desc": "Piecewise constant regression via recursive variance reduction."},
                {"id": "random_forest_regressor", "name": "Random Forest Regressor", "type": "ensemble", "category": "regression", "desc": "Bagged ensemble of regression trees for non-linear variance suppression."},
                {"id": "gradient_boosting_regressor", "name": "Gradient Boosting Regressor", "type": "ensemble", "category": "regression", "desc": "Sequential additive boosting minimizing pseudo-residuals."},
                {"id": "svr", "name": "Support Vector Regressor (SVR)", "type": "kernel", "category": "regression", "desc": "Epsilon-insensitive loss tube optimization with kernel projection."},
                {"id": "knn_regressor", "name": "K-Nearest Neighbors Regressor", "type": "instance", "category": "regression", "desc": "Instance-based non-parametric local metric neighborhood averaging."}
            ]

            clf_algos = [
                {"id": "logistic_regression", "name": "Logistic Regression", "type": "linear", "category": "classification", "desc": "Fast, interpretable, probabilistic linear decision boundary via sigmoid."},
                {"id": "decision_tree_classifier", "name": "Decision Tree Classifier", "type": "tree", "category": "classification", "desc": "Non-linear orthogonal partitions via Gini impurity reduction."},
                {"id": "random_forest_classifier", "name": "Random Forest Classifier", "type": "ensemble", "category": "classification", "desc": "Bagged ensemble of randomized trees for robust variance suppression."},
                {"id": "gradient_boosting_classifier", "name": "Gradient Boosting Classifier", "type": "ensemble", "category": "classification", "desc": "Sequential stagewise boosting on logistic negative log-likelihood."},
                {"id": "svc", "name": "Support Vector Classifier (SVC)", "type": "kernel", "category": "classification", "desc": "Maximum margin hyperplane separation with dual quadratic optimization."},
                {"id": "knn_classifier", "name": "K-Nearest Neighbors Classifier", "type": "instance", "category": "classification", "desc": "Locality-sensitive majority voting over Euclidean neighbors."},
                {"id": "gaussian_nb", "name": "Gaussian Naive Bayes", "type": "probabilistic", "category": "classification", "desc": "Bayesian likelihood estimation assuming conditional feature independence."}
            ]

            unsup_algos = [
                {"id": "kmeans", "name": "K-Means Clustering", "type": "clustering", "category": "unsupervised", "desc": "Centroid-based partition minimizing within-cluster sum-of-squares (inertia)."},
                {"id": "dbscan", "name": "DBSCAN Clustering", "type": "density", "category": "unsupervised", "desc": "Density-based spatial clustering finding arbitrary shapes and isolating noise."},
                {"id": "isolation_forest", "name": "Isolation Forest Anomaly Detection", "type": "anomaly", "category": "unsupervised", "desc": "Recursive tree-based anomaly isolation based on short path lengths."}
            ]

            for a in reg_algos:
                a["compatible"] = not is_classification
            for a in clf_algos:
                a["compatible"] = is_classification
            for a in unsup_algos:
                a["compatible"] = True

            # ---- Smart Algorithm Recommendation Engine ----
            # Analyze dataset characteristics to recommend the best starting algorithm
            n_rows = train_count
            n_feats = feat_count
            n_classes = int(y_train.nunique()) if is_classification else 0
            class_balance_ratio = 1.0
            if is_classification and n_classes >= 2:
                vc = y_train.value_counts()
                class_balance_ratio = float(vc.min()) / float(vc.max()) if vc.max() > 0 else 1.0

            # Check feature correlation (high multicollinearity suggests regularization)
            high_corr = False
            if n_feats >= 2 and n_rows >= 10:
                try:
                    corr_mat = num_X_train.corr().abs()
                    # Upper triangle excluding diagonal
                    upper_tri = corr_mat.where(np.triu(np.ones(corr_mat.shape, dtype=bool), k=1))
                    high_corr = (upper_tri > 0.85).any().any()
                except Exception:
                    pass

            recommendation_reason = ""

            if is_classification:
                if n_rows < 100:
                    # Very small dataset — simple, low-variance model
                    rec_model = "logistic_regression"
                    recommendation_reason = "Small dataset (<100 rows): Logistic Regression avoids overfitting with minimal variance."
                elif n_classes > 5:
                    # Many classes — tree ensembles handle multiclass natively
                    rec_model = "random_forest_classifier"
                    recommendation_reason = f"Multi-class ({n_classes} classes): Random Forest handles multiclass natively with robust variance suppression."
                elif class_balance_ratio < 0.3:
                    # Imbalanced classes — boosting adapts better to minority patterns
                    rec_model = "gradient_boosting_classifier"
                    recommendation_reason = f"Class imbalance (ratio {class_balance_ratio:.2f}): Gradient Boosting focuses on hard-to-classify minority samples."
                elif n_feats > 50:
                    # High-dimensional — ensemble with feature subsampling
                    rec_model = "random_forest_classifier"
                    recommendation_reason = f"High dimensionality ({n_feats} features): Random Forest uses random feature subsets to prevent curse of dimensionality."
                elif high_corr:
                    # Multicollinear features
                    rec_model = "logistic_regression"
                    recommendation_reason = "Correlated features detected: Logistic Regression with regularization handles multicollinearity well."
                elif n_rows > 5000 and n_feats > 10:
                    # Large dataset with moderate features — boosting excels
                    rec_model = "gradient_boosting_classifier"
                    recommendation_reason = f"Large dataset ({n_rows:,} rows, {n_feats} features): Gradient Boosting captures complex non-linear patterns."
                elif n_rows > 500:
                    # Medium dataset — Random Forest provides good generalization
                    rec_model = "random_forest_classifier"
                    recommendation_reason = f"Medium dataset ({n_rows:,} rows): Random Forest provides excellent bias-variance balance."
                else:
                    rec_model = "logistic_regression"
                    recommendation_reason = "Default baseline: Logistic Regression — fast, interpretable, strong probabilistic output."
            else:
                # Regression
                if n_rows < 100:
                    rec_model = "ridge"
                    recommendation_reason = "Small dataset (<100 rows): Ridge Regression prevents overfitting with L2 regularization."
                elif high_corr:
                    rec_model = "ridge"
                    recommendation_reason = "Correlated features detected: Ridge Regression prevents coefficient explosion on multicollinear data."
                elif n_feats > 50:
                    rec_model = "lasso"
                    recommendation_reason = f"High dimensionality ({n_feats} features): Lasso performs automatic feature selection via L1 sparsity."
                elif n_rows > 5000 and n_feats > 10:
                    rec_model = "gradient_boosting_regressor"
                    recommendation_reason = f"Large dataset ({n_rows:,} rows, {n_feats} features): Gradient Boosting captures non-linear residual patterns."
                elif n_rows > 500:
                    rec_model = "random_forest_regressor"
                    recommendation_reason = f"Medium dataset ({n_rows:,} rows): Random Forest provides robust non-linear regression with variance suppression."
                else:
                    rec_model = "linear_regression"
                    recommendation_reason = "Default baseline: OLS Linear Regression — closed-form, fast, fully interpretable."

            # Mark the recommended algorithm in the catalog
            for a in reg_algos + clf_algos + unsup_algos:
                a["recommended"] = (a["id"] == rec_model)

            # All algorithms are available so the user can select any model
            if is_classification:
                algos = clf_algos + reg_algos + unsup_algos
            else:
                algos = reg_algos + clf_algos + unsup_algos

            msg = f"Ready for model training on {train_count} training records across {feat_count} numerical features. Recommended: {rec_model.replace('_', ' ').title()} — {recommendation_reason}"
        except Exception:
            has_split = False
            train_count = 0
            test_count = 0
            target_col = None
            task_type = "classification"
            feat_count = 0
            feat_names = []
            algos = []
            rec_model = "logistic_regression"
            recommendation_reason = ""
            msg = "Train/Test split has not yet been executed for this dataset. Please run Step 10 first."

        return ModelSummaryResponse(
            dataset_id=dataset_id,
            has_split=has_split,
            train_rows=train_count,
            test_rows=test_count,
            target_column=target_col,
            target_type=task_type,
            feature_count=feat_count,
            feature_names=feat_names,
            available_algorithms=algos,
            recommended_model=rec_model,
            recommendation_reason=recommendation_reason,
            message=msg
        )


    @classmethod
    def instantiate_model(cls, model_type: Any, hyperparameters: Dict[str, Any]):
        """Factory for scikit-learn models across regression, classification, and unsupervised learning."""
        hp = dict(hyperparameters)
        val = model_type.value if hasattr(model_type, "value") else str(model_type).lower().strip()
        
        # --- Regression Models ---
        if val in ("linear_regression", "linear"):
            return LinearRegression(**hp), "regression"
        elif val == "ridge":
            hp.setdefault("alpha", 1.0)
            return Ridge(**hp), "regression"
        elif val == "lasso":
            hp.setdefault("alpha", 1.0)
            return Lasso(**hp), "regression"
        elif val == "elastic_net":
            hp.setdefault("alpha", 1.0)
            hp.setdefault("l1_ratio", 0.5)
            return ElasticNet(**hp), "regression"
        elif val == "decision_tree_regressor":
            hp.setdefault("random_state", 42)
            return DecisionTreeRegressor(**hp), "regression"
        elif val == "random_forest_regressor":
            hp.setdefault("n_estimators", 100)
            hp.setdefault("random_state", 42)
            return RandomForestRegressor(**hp), "regression"
        elif val == "gradient_boosting_regressor":
            hp.setdefault("n_estimators", 100)
            hp.setdefault("random_state", 42)
            return GradientBoostingRegressor(**hp), "regression"
        elif val == "svr":
            hp.setdefault("C", 1.0)
            return SVR(**hp), "regression"
        elif val == "knn_regressor":
            hp.setdefault("n_neighbors", 5)
            return KNeighborsRegressor(**hp), "regression"

        # --- Classification Models ---
        elif val in ("logistic_regression", "logistic"):
            hp.setdefault("max_iter", 1000)
            return LogisticRegression(**hp), "classification"
        elif val in ("decision_tree_classifier", "tree", "decision_tree"):
            hp.setdefault("random_state", 42)
            return DecisionTreeClassifier(**hp), "classification"
        elif val in ("random_forest_classifier", "forest", "random_forest"):
            hp.setdefault("n_estimators", 100)
            hp.setdefault("random_state", 42)
            return RandomForestClassifier(**hp), "classification"
        elif val == "gradient_boosting_classifier":
            hp.setdefault("n_estimators", 100)
            hp.setdefault("random_state", 42)
            return GradientBoostingClassifier(**hp), "classification"
        elif val == "svc":
            hp.setdefault("C", 1.0)
            hp.setdefault("probability", True)
            hp.setdefault("random_state", 42)
            return SVC(**hp), "classification"
        elif val in ("knn_classifier", "knn"):
            hp.setdefault("n_neighbors", 5)
            return KNeighborsClassifier(**hp), "classification"
        elif val in ("gaussian_nb", "naive_bayes"):
            return GaussianNB(**hp), "classification"

        # --- Unsupervised Learning Models ---
        elif val == "kmeans":
            hp.setdefault("n_clusters", 3)
            hp.setdefault("random_state", 42)
            hp.setdefault("n_init", 10)
            return KMeans(**hp), "unsupervised"
        elif val == "dbscan":
            hp.setdefault("eps", 0.5)
            hp.setdefault("min_samples", 5)
            return DBSCAN(**hp), "unsupervised"
        elif val == "isolation_forest":
            hp.setdefault("n_estimators", 100)
            hp.setdefault("random_state", 42)
            hp.setdefault("contamination", "auto")
            return IsolationForest(**hp), "unsupervised"
        else:
            raise ValueError(f"Unsupported model type: '{val}'")

    # =========================================================================
    # STEP 11: MODEL FITTING (X_train, y_train)
    # =========================================================================
    @classmethod
    def fit_model(
        cls,
        dataset_id: str,
        request: ModelFitRequest
    ) -> ModelFitResponse:
        """Train selected model on isolated X_train / y_train."""
        X_train, X_test, y_train, y_test, target_col = SplitEngine.load_split(dataset_id)
        
        # Ensure numerical feature matrices (convert strings/dates or impute if needed)
        num_X_train = X_train.select_dtypes(include=[np.number]).fillna(0.0)
        if len(num_X_train.columns) == 0:
            raise HTTPException(status_code=400, detail="X_train contains no numerical features. Please encode categorical features first.")

        model, task_type = cls.instantiate_model(request.model_type, request.hyperparameters)

        # Adapt target for selected model family if needed
        fit_y_train = y_train
        if task_type == "regression":
            if not pd.api.types.is_numeric_dtype(fit_y_train):
                fit_y_train = pd.Series(pd.Categorical(fit_y_train).codes, index=fit_y_train.index).astype(float)
        elif task_type == "classification":
            # Classifiers require discrete labels — discretize continuous float targets
            if pd.api.types.is_float_dtype(fit_y_train):
                n_uniq = fit_y_train.nunique()
                if n_uniq <= 10:
                    # Few unique floats — round to int labels
                    fit_y_train = fit_y_train.round().astype(int).astype(str)
                else:
                    try:
                        n_bins = min(3, n_uniq)
                        labels = ["Low", "Medium", "High"][:n_bins]
                        fit_y_train = pd.qcut(fit_y_train, q=n_bins, labels=labels, duplicates='drop').astype(str)
                    except Exception:
                        fit_y_train = fit_y_train.round().astype(int).astype(str)

        start_t = time.time()
        try:
            if task_type == "unsupervised":
                model.fit(num_X_train)
            else:
                model.fit(num_X_train, fit_y_train)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Model fitting failed: {str(e)}")
        duration_ms = (time.time() - start_t) * 1000

        # Extract feature importances / coefficients / cluster variance
        feat_importances: Dict[str, float] = {}
        if hasattr(model, "feature_importances_"):
            for col, imp in zip(num_X_train.columns, model.feature_importances_):
                feat_importances[col] = round(float(imp), 4)
        elif hasattr(model, "coef_"):
            coefs = np.ravel(model.coef_)
            for col, cf in zip(num_X_train.columns, coefs):
                feat_importances[col] = round(float(cf), 4)
        elif hasattr(model, "cluster_centers_"):
            # For KMeans, show feature variance/spread across cluster centroids as an indicator
            centroid_variance = np.var(model.cluster_centers_, axis=0)
            tot_var = float(np.sum(centroid_variance))
            if tot_var > 0:
                normalized_var = centroid_variance / tot_var
            else:
                normalized_var = np.ones(len(num_X_train.columns)) / len(num_X_train.columns)
            for col, v in zip(num_X_train.columns, normalized_var):
                feat_importances[col] = round(float(v), 4)

        model_id = f"model_{uuid.uuid4().hex[:8]}"
        m_type_str = request.model_type.value if hasattr(request.model_type, "value") else str(request.model_type)
        
        # Save model artifact
        model_payload = {
            "model_id": model_id,
            "model": model,
            "model_type": m_type_str,
            "task_type": task_type,
            "feature_names": list(num_X_train.columns),
            "target_col": target_col,
            "fitted_at": datetime.utcnow().isoformat()
        }
        models_dir = cls.get_models_dir(dataset_id)
        with open(models_dir / f"{model_id}.pkl", "wb") as f:
            pickle.dump(model_payload, f)
        # Also write latest pointer
        with open(models_dir / "latest.pkl", "wb") as f:
            pickle.dump(model_payload, f)

        # Update manifest.json with all fitted models for comparative tracking
        manifest_path = models_dir / "manifest.json"
        manifest_data = []
        if manifest_path.exists():
            try:
                with open(manifest_path, "r") as mf:
                    manifest_data = json.load(mf)
            except Exception:
                manifest_data = []

        for item in manifest_data:
            item["is_active"] = False

        model_entry = {
            "model_id": model_id,
            "model_type": m_type_str,
            "name": m_type_str.replace("_", " ").title(),
            "task_type": task_type,
            "train_rows": len(num_X_train),
            "feature_count": len(num_X_train.columns),
            "features_used": list(num_X_train.columns),
            "training_duration_ms": round(duration_ms, 2),
            "feature_importances": feat_importances,
            "hyperparameters": request.hyperparameters,
            "fitted_at": datetime.utcnow().isoformat(),
            "is_active": True
        }
        manifest_data.insert(0, model_entry)
        try:
            with open(manifest_path, "w") as mf:
                json.dump(manifest_data, mf, indent=2)
        except Exception:
            pass

        concept = concept_registry.get_concept("model_fitting")
        edu_dict = {
            "title": concept.title if concept else "Model Fitting & Optimization",
            "short_definition": concept.short_definition if concept else "Mathematical parameter estimation via loss minimization.",
            "beginner_explanation": concept.beginner_explanation if concept else "",
            "why_it_matters": concept.why_it_matters if concept else "",
            "interview_tip": concept.interview_tip if concept else "",
            "common_mistakes": concept.common_mistakes if concept else []
        }

        m_type_str = request.model_type.value if hasattr(request.model_type, "value") else str(request.model_type)

        return ModelFitResponse(
            success=True,
            dataset_id=dataset_id,
            model_id=model_id,
            model_type=m_type_str,
            task_type=task_type,
            train_rows=len(num_X_train),
            feature_count=len(num_X_train.columns),
            features_used=list(num_X_train.columns),
            training_duration_ms=round(duration_ms, 2),
            feature_importances=feat_importances,
            model_parameters=request.hyperparameters,
            explanation=edu_dict,
            message=f"Successfully trained {m_type_str} model on {len(num_X_train)} training records in {round(duration_ms, 1)}ms.",
            timestamp=datetime.utcnow().isoformat()
        )

    # =========================================================================
    # STEP 12: PREDICTION (y_pred = model.predict(X_test))
    # =========================================================================
    @classmethod
    def predict(
        cls,
        dataset_id: str,
        request: ModelPredictRequest
    ) -> ModelPredictResponse:
        """Generate predictions using test partition X_test."""
        start_time = time.perf_counter()
        models_dir = cls.get_models_dir(dataset_id)
        target_model_file = (models_dir / f"{request.model_id}.pkl") if request.model_id else (models_dir / "latest.pkl")
        
        if not target_model_file.exists():
            raise HTTPException(status_code=400, detail="No trained model found. Please fit a model in Step 11 first.")

        with open(target_model_file, "rb") as f:
            model_payload = safe_pickle_load(f)

        model = model_payload["model"]
        feature_names = model_payload.get("feature_names", [])
        task_type = model_payload.get("task_type", "classification")
        model_type = model_payload.get("model_type", "model")
        model_name = model_type.replace("_", " ").title()

        X_train, X_test, y_train, y_test, target_col = SplitEngine.load_split(dataset_id)
        num_X_test = X_test.reindex(columns=feature_names, fill_value=0.0).fillna(0.0)

        if hasattr(model, "predict"):
            y_pred = model.predict(num_X_test)
        elif hasattr(model, "fit_predict"):
            # For DBSCAN without inductive predict method
            y_pred = model.fit_predict(num_X_test)
        else:
            y_pred = np.zeros(len(num_X_test), dtype=int)

        duration_ms = (time.perf_counter() - start_time) * 1000

        # Save predictions for Step 13 evaluation
        pred_payload = {
            "y_pred": y_pred,
            "model_type": model_type,
            "task_type": task_type,
            "model_id": request.model_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        with open(models_dir / "predictions.pkl", "wb") as f:
            pickle.dump(pred_payload, f)

        probabilities = None
        classes = []
        if task_type == "classification" and hasattr(model, "predict_proba"):
            try:
                probs_arr = model.predict_proba(num_X_test)
                classes = [str(c) for c in model.classes_]
            except Exception:
                probs_arr = None
        else:
            probs_arr = None

        sample_limit = max(5, min(request.limit or 50, len(num_X_test)))
        sample_items: List[PredictionItem] = []
        residuals_list = []
        confidences_list = []

        for idx in range(len(num_X_test)):
            act_val = y_test.iloc[idx] if idx < len(y_test) else None
            pred_val = y_pred[idx]

            res_val = None
            if task_type == "regression" and act_val is not None:
                try:
                    res_val = round(float(pred_val) - float(act_val), 4)
                    residuals_list.append(res_val)
                except Exception:
                    pass

            prob_dict = None
            if probs_arr is not None:
                prob_dict = {classes[c_idx]: round(float(probs_arr[idx, c_idx]), 4) for c_idx in range(len(classes))}
                max_prob = max(probs_arr[idx])
                confidences_list.append(max_prob)

            if idx < sample_limit:
                sample_items.append(
                    PredictionItem(
                        index=idx + 1,
                        actual=round(float(act_val), 4) if isinstance(act_val, (float, int, np.number)) else (str(act_val) if act_val is not None else None),
                        predicted=round(float(pred_val), 4) if isinstance(pred_val, (float, int, np.number)) else str(pred_val),
                        residual=res_val,
                        probabilities=prob_dict
                    )
                )

        summary_stats = {}
        if task_type == "regression" and len(residuals_list) > 0:
            abs_res = np.abs(residuals_list)
            summary_stats = {
                "mean_residual": round(float(np.mean(residuals_list)), 4),
                "mae": round(float(np.mean(abs_res)), 4),
                "max_residual": round(float(np.max(abs_res)), 4),
                "std_residual": round(float(np.std(residuals_list)), 4),
                "mean_actual": round(float(np.mean(y_test.dropna())), 4) if len(y_test.dropna()) > 0 else 0.0,
                "mean_predicted": round(float(np.mean(y_pred)), 4) if len(y_pred) > 0 else 0.0
            }
        elif task_type == "classification":
            pred_counts = pd.Series(y_pred).astype(str).value_counts().to_dict()
            act_counts = y_test.astype(str).value_counts().to_dict() if len(y_test) > 0 else {}
            summary_stats = {
                "classes": classes if len(classes) > 0 else list(pred_counts.keys()),
                "class_distribution_predicted": pred_counts,
                "class_distribution_actual": act_counts,
                "mean_confidence": round(float(np.mean(confidences_list)), 4) if len(confidences_list) > 0 else None
            }
        else:
            cluster_counts = pd.Series(y_pred).astype(str).value_counts().to_dict()
            summary_stats = {
                "cluster_counts": cluster_counts
            }

        concept = concept_registry.get_concept("prediction")
        edu_dict = {
            "title": concept.title if concept else "Model Prediction & Inductive Inference",
            "short_definition": concept.short_definition if concept else "Generating outputs on unseen test feature vectors without updating model weights.",
            "beginner_explanation": concept.beginner_explanation if concept else "",
            "why_it_matters": concept.why_it_matters if concept else "",
            "interview_tip": concept.interview_tip if concept else "",
            "common_mistakes": concept.common_mistakes if concept else []
        }

        return ModelPredictResponse(
            dataset_id=dataset_id,
            model_id=request.model_id or "latest",
            model_type=model_type,
            model_name=model_name,
            task_type=task_type,
            target_column=target_col,
            feature_names=feature_names,
            total_test_samples=len(num_X_test),
            sample_predictions=sample_items,
            summary_stats=summary_stats,
            inference_latency_ms=round(duration_ms, 2),
            explanation=edu_dict,
            message=f"Successfully generated {len(num_X_test)} predictions in {round(duration_ms, 1)}ms.",
            timestamp=datetime.utcnow().isoformat()
        )

    @classmethod
    def transform_raw_inputs_to_features(
        cls,
        dataset_id: str,
        raw_inputs: Dict[str, Any],
        feature_names: List[str]
    ) -> Tuple[pd.DataFrame, Dict[str, float]]:
        """
        Map human raw inputs (original strings, categories, raw numbers)
        into the model's exact expected numeric feature tensor columns.
        """
        try:
            X_train, _, _, _, _ = SplitEngine.load_split(dataset_id)
        except Exception:
            X_train = None

        vector_dict: Dict[str, float] = {}
        raw_inputs_lower = {str(k).strip().lower(): v for k, v in raw_inputs.items()}

        for feat in feature_names:
            feat_lower = feat.lower()

            # 1. Exact match (numerical feature or already matching key)
            if feat in raw_inputs or feat_lower in raw_inputs_lower:
                val = raw_inputs[feat] if feat in raw_inputs else raw_inputs_lower[feat_lower]
                if isinstance(val, bool):
                    vector_dict[feat] = 1.0 if val else 0.0
                    continue
                try:
                    cleaned_val = str(val).replace("$", "").replace(",", "").strip()
                    vector_dict[feat] = float(cleaned_val)
                    continue
                except (ValueError, TypeError):
                    pass

            # 2. Check for One-Hot Encoding pattern: e.g. 'dept_Sales', 'gender_Male', 'city==NYC'
            matched_ohe = False
            for raw_col, raw_val in raw_inputs.items():
                prefix_col = f"{raw_col}_"
                prefix_eq = f"{raw_col}=="
                if feat.startswith(prefix_col) or feat.startswith(prefix_eq):
                    prefix_len = len(prefix_eq) if feat.startswith(prefix_eq) else len(prefix_col)
                    cat_suffix = feat[prefix_len:].strip()
                    
                    is_match = str(raw_val).strip().lower() == str(cat_suffix).strip().lower()
                    vector_dict[feat] = 1.0 if is_match else 0.0
                    matched_ohe = True
                    break

            if matched_ohe:
                continue

            # 3. Check for transformed numerical feature (e.g. 'scaled_income', 'log_salary', etc.)
            matched_num = False
            for raw_col, raw_val in raw_inputs.items():
                if str(raw_col).lower() in feat_lower:
                    try:
                        cleaned_val = str(raw_val).replace("$", "").replace(",", "").strip()
                        num_v = float(cleaned_val)
                        vector_dict[feat] = num_v
                        matched_num = True
                        break
                    except (ValueError, TypeError):
                        pass

            if matched_num:
                continue

            # 4. Fallback to training set median or default
            if X_train is not None and feat in X_train.columns:
                series = pd.to_numeric(X_train[feat], errors="coerce").dropna()
                vector_dict[feat] = float(series.median()) if len(series) > 0 else 0.0
            else:
                vector_dict[feat] = 0.0

        single_df = pd.DataFrame([vector_dict], columns=feature_names)
        return single_df, vector_dict

    @classmethod
    def get_original_schema(
        cls,
        dataset_id: str,
        model_id: Optional[str] = None
    ) -> OriginalSchemaResponse:
        """Inspect the untouched original dataset and return column types, categories, and sample rows for live prediction."""
        try:
            df_orig, _, _ = version_service.get_original_dataset(dataset_id)
        except Exception:
            df_orig, _, _ = version_service.get_current_dataset(dataset_id)

        models_dir = cls.get_models_dir(dataset_id)
        target_model_file = (models_dir / f"{model_id}.pkl") if model_id else (models_dir / "latest.pkl")
        
        target_col = None
        task_type = "classification"
        model_features: List[str] = []

        if target_model_file.exists():
            try:
                with open(target_model_file, "rb") as f:
                    model_payload = pickle.load(f)
                target_col = model_payload.get("target_col")
                task_type = model_payload.get("task_type", "classification")
                model_features = model_payload.get("feature_names", [])
            except Exception:
                pass

        if not target_col:
            try:
                _, _, _, _, split_target = SplitEngine.load_split(dataset_id)
                target_col = split_target
            except Exception:
                target_col = df_orig.columns[-1] if len(df_orig.columns) > 0 else None

        feature_items: List[OriginalFeatureItem] = []

        for col in df_orig.columns:
            if col == target_col:
                continue
            
            series = df_orig[col]
            is_numeric = pd.api.types.is_numeric_dtype(series)
            is_bool = pd.api.types.is_bool_dtype(series)
            
            if is_bool:
                col_type = "boolean"
                categories = ["True", "False"]
                default_v = True
                min_v, max_v, mean_v, med_v = None, None, None, None
            elif not is_numeric or series.nunique(dropna=True) <= 12:
                col_type = "categorical"
                cats = [str(x) for x in series.dropna().unique()][:30]
                categories = cats
                default_v = cats[0] if cats else ""
                min_v, max_v, mean_v, med_v = None, None, None, None
            else:
                col_type = "numeric"
                categories = []
                s_clean = pd.to_numeric(series, errors="coerce").dropna()
                min_v = float(s_clean.min()) if len(s_clean) > 0 else 0.0
                max_v = float(s_clean.max()) if len(s_clean) > 0 else 100.0
                mean_v = float(s_clean.mean()) if len(s_clean) > 0 else 0.0
                med_v = float(s_clean.median()) if len(s_clean) > 0 else 0.0
                default_v = round(float(med_v), 2)

            feature_items.append(
                OriginalFeatureItem(
                    name=col,
                    type=col_type,
                    dtype=str(series.dtype),
                    categories=categories,
                    min_val=round(min_v, 2) if min_v is not None else None,
                    max_val=round(max_v, 2) if max_v is not None else None,
                    mean_val=round(mean_v, 2) if mean_v is not None else None,
                    median_val=round(med_v, 2) if med_v is not None else None,
                    default_val=default_v,
                    is_target=False
                )
            )

        # Extract 6 sample rows from original dataset
        sample_rows: List[Dict[str, Any]] = []
        sample_head = df_orig.head(6)
        for idx, row in sample_head.iterrows():
            row_dict = {}
            for col in df_orig.columns:
                val = row[col]
                if pd.isna(val):
                    row_dict[col] = None
                elif isinstance(val, (int, np.integer)):
                    row_dict[col] = int(val)
                elif isinstance(val, (float, np.floating)):
                    row_dict[col] = round(float(val), 2)
                else:
                    row_dict[col] = str(val)
            row_dict["_row_index"] = int(idx)
            sample_rows.append(row_dict)

        return OriginalSchemaResponse(
            dataset_id=dataset_id,
            target_column=target_col,
            task_type=task_type,
            features=feature_items,
            sample_rows=sample_rows,
            model_feature_names=model_features
        )

    @classmethod
    def predict_live(
        cls,
        dataset_id: str,
        request: LivePredictRequest
    ) -> LivePredictResponse:
        """Execute real-time live prediction with original raw feature values."""
        models_dir = cls.get_models_dir(dataset_id)
        target_model_file = (models_dir / f"{request.model_id}.pkl") if request.model_id else (models_dir / "latest.pkl")

        if not target_model_file.exists():
            raise HTTPException(status_code=400, detail="No trained model found. Please fit a model in Step 11 first.")

        with open(target_model_file, "rb") as f:
            model_payload = safe_pickle_load(f)

        model = model_payload["model"]
        feature_names = model_payload.get("feature_names", [])
        task_type = model_payload.get("task_type", "classification")
        model_type = model_payload.get("model_type", "model")
        target_col = model_payload.get("target_col", "Target")

        # Map human inputs to model's exact tensor vector
        single_df, transformed_vector = cls.transform_raw_inputs_to_features(
            dataset_id, request.inputs, feature_names
        )

        # Run inference
        if hasattr(model, "predict"):
            pred_raw = model.predict(single_df)[0]
        elif hasattr(model, "fit_predict"):
            pred_raw = model.fit_predict(single_df)[0]
        else:
            pred_raw = 0

        prob_dict = None
        confidence = None
        predicted_label = None

        if task_type == "classification":
            if hasattr(model, "predict_proba"):
                try:
                    probs = model.predict_proba(single_df)[0]
                    classes = [str(c) for c in model.classes_]
                    prob_dict = {classes[c_idx]: round(float(probs[c_idx]), 4) for c_idx in range(len(classes))}
                    confidence = round(float(np.max(probs)), 4)
                except Exception:
                    prob_dict = None
            predicted_val = int(pred_raw) if isinstance(pred_raw, (int, np.integer)) else str(pred_raw)
            predicted_label = str(pred_raw)
        else:
            predicted_val = round(float(pred_raw), 4) if isinstance(pred_raw, (float, int, np.number)) else str(pred_raw)

        # Compute top contributing features
        top_features: List[Dict[str, Any]] = []
        if hasattr(model, "coef_"):
            try:
                coefs = np.ravel(model.coef_)
                for feat, cf in zip(feature_names, coefs):
                    feat_val = transformed_vector.get(feat, 0.0)
                    impact = round(float(cf * feat_val), 4)
                    top_features.append({
                        "feature": feat,
                        "value": feat_val,
                        "weight": round(float(cf), 4),
                        "impact": impact,
                        "direction": "positive" if impact >= 0 else "negative"
                    })
                top_features.sort(key=lambda x: abs(x["impact"]), reverse=True)
                top_features = top_features[:8]
            except Exception:
                pass
        elif hasattr(model, "feature_importances_"):
            try:
                imps = model.feature_importances_
                for feat, imp in zip(feature_names, imps):
                    feat_val = transformed_vector.get(feat, 0.0)
                    top_features.append({
                        "feature": feat,
                        "value": feat_val,
                        "importance": round(float(imp), 4),
                        "impact": round(float(imp * feat_val), 4),
                        "direction": "positive"
                    })
                top_features.sort(key=lambda x: x["importance"], reverse=True)
                top_features = top_features[:8]
            except Exception:
                pass

        explanation = {
            "summary": f"Model {model_type} predicted {predicted_val} for target '{target_col}'.",
            "active_inputs_count": len(request.inputs),
            "tensor_features_count": len(feature_names),
            "confidence_pct": round(confidence * 100, 1) if confidence is not None else None
        }

        return LivePredictResponse(
            dataset_id=dataset_id,
            model_id=request.model_id or "latest",
            model_type=model_type,
            task_type=task_type,
            target_column=target_col,
            predicted=predicted_val,
            predicted_label=predicted_label,
            probabilities=prob_dict,
            confidence=confidence,
            raw_inputs=request.inputs,
            transformed_vector=transformed_vector,
            top_contributing_features=top_features,
            explanation=explanation,
            message="Live prediction computed successfully using original input schema.",
            timestamp=datetime.utcnow().isoformat()
        )

    @classmethod
    def predict_single(
        cls,
        dataset_id: str,
        request: SinglePredictRequest
    ) -> SinglePredictResponse:
        """Generate prediction for a single custom feature vector (What-If Simulator)."""
        # Forward to live prediction for seamless handling
        live_req = LivePredictRequest(model_id=request.model_id, inputs=request.features)
        live_resp = cls.predict_live(dataset_id, live_req)

        return SinglePredictResponse(
            dataset_id=dataset_id,
            model_id=live_resp.model_id,
            model_type=live_resp.model_type,
            task_type=live_resp.task_type,
            predicted=live_resp.predicted,
            probabilities=live_resp.probabilities,
            confidence=live_resp.confidence,
            features_used=live_resp.transformed_vector,
            message=live_resp.message,
            timestamp=live_resp.timestamp
        )

    @classmethod
    def get_sample_instance(
        cls,
        dataset_id: str,
        model_id: Optional[str] = None
    ) -> SampleInstanceResponse:
        """Get feature statistics and a default test sample row for the What-If playground."""
        models_dir = cls.get_models_dir(dataset_id)
        target_model_file = (models_dir / f"{model_id}.pkl") if model_id else (models_dir / "latest.pkl")
        
        if not target_model_file.exists():
            raise HTTPException(status_code=400, detail="No trained model found. Please fit a model in Step 11 first.")

        with open(target_model_file, "rb") as f:
            model_payload = safe_pickle_load(f)

        feature_names = model_payload.get("feature_names", [])
        task_type = model_payload.get("task_type", "classification")

        X_train, X_test, _, _, target_col = SplitEngine.load_split(dataset_id)

        feat_stats: List[FeatureStatItem] = []
        sample_vals: Dict[str, Any] = {}

        first_test_row = X_test.iloc[0].to_dict() if len(X_test) > 0 else {}

        for feat in feature_names:
            if feat in X_train.columns:
                series = pd.to_numeric(X_train[feat], errors="coerce").dropna()
                min_v = float(series.min()) if len(series) > 0 else 0.0
                max_v = float(series.max()) if len(series) > 0 else 100.0
                mean_v = float(series.mean()) if len(series) > 0 else 0.0
                med_v = float(series.median()) if len(series) > 0 else 0.0
                dtype_str = str(X_train[feat].dtype)
            else:
                min_v, max_v, mean_v, med_v = 0.0, 100.0, 0.0, 0.0
                dtype_str = "float64"

            # Determine sample value
            default_v = first_test_row.get(feat, med_v)
            try:
                default_v = round(float(default_v), 2)
            except Exception:
                default_v = round(float(med_v), 2)

            feat_stats.append(
                FeatureStatItem(
                    name=feat,
                    dtype=dtype_str,
                    min_val=round(min_v, 2),
                    max_val=round(max_v, 2),
                    mean_val=round(mean_v, 2),
                    median_val=round(med_v, 2),
                    default_val=default_v
                )
            )
            sample_vals[feat] = default_v

        return SampleInstanceResponse(
            dataset_id=dataset_id,
            model_id=model_id or "latest",
            target_column=target_col,
            task_type=task_type,
            features=feat_stats,
            sample_values=sample_vals
        )

    @classmethod
    def transform_multiple_raw_inputs_to_features(
        cls,
        dataset_id: str,
        df_raw: pd.DataFrame,
        feature_names: List[str]
    ) -> pd.DataFrame:
        """
        Map a batch DataFrame of raw input records (containing original human strings, 
        categories, and numbers) into the model's exact expected numeric feature tensor matrix.
        """
        try:
            X_train, _, _, _, _ = SplitEngine.load_split(dataset_id)
        except Exception:
            X_train = None

        n_rows = len(df_raw)
        result_df = pd.DataFrame(index=range(n_rows), columns=feature_names)

        # Normalize column names in df_raw for case-insensitive lookup
        raw_cols_lower = {str(c).strip().lower(): c for c in df_raw.columns}

        for feat in feature_names:
            feat_lower = feat.lower()

            # 1. Exact or case-insensitive column match
            if feat in df_raw.columns:
                s_num = pd.to_numeric(df_raw[feat], errors="coerce")
                if s_num.notna().any():
                    med = float(s_num.dropna().median()) if len(s_num.dropna()) > 0 else 0.0
                    result_df[feat] = s_num.fillna(med)
                    continue
                else:
                    # Non-numeric direct column (fallback)
                    result_df[feat] = 0.0
                    continue
            elif feat_lower in raw_cols_lower:
                actual_col = raw_cols_lower[feat_lower]
                s_num = pd.to_numeric(df_raw[actual_col], errors="coerce")
                if s_num.notna().any():
                    med = float(s_num.dropna().median()) if len(s_num.dropna()) > 0 else 0.0
                    result_df[feat] = s_num.fillna(med)
                    continue

            # 2. One-Hot Encoding pattern check (e.g. 'gender_Female', 'department==Sales', 'city_New York')
            matched_ohe = False
            for raw_col in df_raw.columns:
                prefix_under = f"{raw_col}_"
                prefix_eq = f"{raw_col}=="
                if feat.startswith(prefix_under) or feat.startswith(prefix_eq):
                    prefix_len = len(prefix_eq) if feat.startswith(prefix_eq) else len(prefix_under)
                    cat_suffix = feat[prefix_len:].strip().lower()

                    series_str = df_raw[raw_col].astype(str).str.strip().str.lower()
                    result_df[feat] = (series_str == cat_suffix).astype(float)
                    matched_ohe = True
                    break

            if matched_ohe:
                continue

            # 3. Transformed numerical match (e.g. 'scaled_income' -> 'income')
            matched_num = False
            for raw_col in df_raw.columns:
                if str(raw_col).lower() in feat_lower:
                    s_num = pd.to_numeric(df_raw[raw_col], errors="coerce")
                    if s_num.notna().any():
                        med = float(s_num.dropna().median()) if len(s_num.dropna()) > 0 else 0.0
                        result_df[feat] = s_num.fillna(med)
                        matched_num = True
                        break

            if matched_num:
                continue

            # 4. Fallback to training set median or 0.0
            if X_train is not None and feat in X_train.columns:
                series = pd.to_numeric(X_train[feat], errors="coerce").dropna()
                med_val = float(series.median()) if len(series) > 0 else 0.0
                result_df[feat] = med_val
            else:
                result_df[feat] = 0.0

        return result_df.fillna(0.0).astype(float)

    @classmethod
    def predict_batch_new(
        cls,
        dataset_id: str,
        records: List[Dict[str, Any]],
        model_id: Optional[str] = None
    ) -> BatchNewPredictResponse:
        """
        Execute vectorized batch inference on a list of new unseen raw records.
        Returns enriched predictions table, probability metrics, and summary stats.
        """
        if not records:
            raise HTTPException(status_code=400, detail="No unlabelled records provided for batch prediction.")

        models_dir = cls.get_models_dir(dataset_id)
        target_model_file = (models_dir / f"{model_id}.pkl") if model_id else (models_dir / "latest.pkl")

        if not target_model_file.exists():
            raise HTTPException(status_code=400, detail="No trained model found. Please train a model in Step 11 first.")

        with open(target_model_file, "rb") as f:
            model_payload = pickle.load(f)

        model = model_payload["model"]
        feature_names = model_payload.get("feature_names", [])
        task_type = model_payload.get("task_type", "classification")
        model_type = model_payload.get("model_type", "model")
        target_col = model_payload.get("target_col", "Target")

        start_time = time.time()
        df_raw = pd.DataFrame(records)

        # Vectorized transform into model tensor
        X_tensor = cls.transform_multiple_raw_inputs_to_features(dataset_id, df_raw, feature_names)

        # Run inference
        if hasattr(model, "predict"):
            raw_preds = model.predict(X_tensor)
        elif hasattr(model, "fit_predict"):
            raw_preds = model.fit_predict(X_tensor)
        else:
            raw_preds = np.zeros(len(X_tensor))

        # Class probabilities for classification
        probs_arr = None
        classes = []
        if task_type == "classification" and hasattr(model, "predict_proba"):
            try:
                probs_arr = model.predict_proba(X_tensor)
                classes = [str(c) for c in model.classes_]
            except Exception:
                probs_arr = None

        duration_ms = (time.time() - start_time) * 1000

        # Construct enriched preview items and DataFrame
        preview_rows: List[BatchPredictRowItem] = []
        confidences: List[float] = []
        pred_formatted_list = []

        for idx in range(len(df_raw)):
            pred_raw = raw_preds[idx]
            if task_type == "classification":
                pred_val = int(pred_raw) if isinstance(pred_raw, (int, np.integer)) else str(pred_raw)
                pred_label = str(pred_raw)
            else:
                pred_val = round(float(pred_raw), 4) if isinstance(pred_raw, (float, int, np.number)) else str(pred_raw)
                pred_label = None

            pred_formatted_list.append(pred_val)

            prob_dict = None
            conf_val = None
            if probs_arr is not None:
                prob_dict = {classes[c_idx]: round(float(probs_arr[idx, c_idx]), 4) for c_idx in range(len(classes))}
                conf_val = round(float(np.max(probs_arr[idx])), 4)
                confidences.append(conf_val)

            # Store preview for first 100 rows
            if idx < 100:
                row_raw_dict = df_raw.iloc[idx].to_dict()
                # Clean NaNs in raw dict for JSON serialization
                cleaned_inputs = {
                    k: (None if pd.isna(v) else (int(v) if isinstance(v, (int, np.integer)) else (round(float(v), 2) if isinstance(v, (float, np.floating)) else str(v))))
                    for k, v in row_raw_dict.items()
                }
                preview_rows.append(
                    BatchPredictRowItem(
                        row_index=idx + 1,
                        inputs=cleaned_inputs,
                        predicted=pred_val,
                        predicted_label=pred_label,
                        probabilities=prob_dict,
                        confidence=conf_val
                    )
                )

        # Build enriched DataFrame and save to latest_new_predictions.csv
        enriched_df = df_raw.copy()
        pred_col_name = f"predicted_{target_col}"
        enriched_df[pred_col_name] = pred_formatted_list

        if confidences:
            enriched_df["prediction_confidence"] = [round(float(c), 4) for c in confidences]

        if probs_arr is not None and len(classes) > 0:
            for c_idx, c_name in enumerate(classes):
                enriched_df[f"prob_{c_name}"] = [round(float(probs_arr[r, c_idx]), 4) for r in range(len(df_raw))]

        predictions_file_path = models_dir / "latest_new_predictions.csv"
        enriched_df.to_csv(predictions_file_path, index=False)

        # Summary statistics
        summary_stats = {}
        if task_type == "classification":
            pred_counts = pd.Series(pred_formatted_list).astype(str).value_counts().to_dict()
            summary_stats = {
                "classes": classes if len(classes) > 0 else list(pred_counts.keys()),
                "class_distribution_predicted": pred_counts,
                "mean_confidence": round(float(np.mean(confidences)), 4) if confidences else None,
                "total_records": len(df_raw)
            }
        elif task_type == "regression":
            num_preds = [float(p) for p in pred_formatted_list if isinstance(p, (int, float, np.number))]
            summary_stats = {
                "mean_predicted": round(float(np.mean(num_preds)), 4) if num_preds else 0.0,
                "min_predicted": round(float(np.min(num_preds)), 4) if num_preds else 0.0,
                "max_predicted": round(float(np.max(num_preds)), 4) if num_preds else 0.0,
                "std_predicted": round(float(np.std(num_preds)), 4) if num_preds else 0.0,
                "total_records": len(df_raw)
            }
        else:
            cluster_counts = pd.Series(pred_formatted_list).astype(str).value_counts().to_dict()
            summary_stats = {
                "cluster_distribution": cluster_counts,
                "total_records": len(df_raw)
            }

        return BatchNewPredictResponse(
            dataset_id=dataset_id,
            model_id=model_id or "latest",
            model_type=model_type,
            task_type=task_type,
            target_column=target_col,
            total_records=len(df_raw),
            preview_rows=preview_rows,
            columns=list(enriched_df.columns),
            summary_stats=summary_stats,
            inference_latency_ms=round(duration_ms, 2),
            csv_download_available=True,
            message=f"Generated {len(df_raw)} new predictions in {round(duration_ms, 1)}ms.",
            timestamp=datetime.utcnow().isoformat()
        )

    @classmethod
    def predict_batch_file(
        cls,
        dataset_id: str,
        file_bytes: bytes,
        filename: str,
        model_id: Optional[str] = None
    ) -> BatchNewPredictResponse:
        """
        Parse uploaded dataset file (.csv, .xlsx, .json) and execute batch inference.
        """
        if not file_bytes:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        fname_lower = filename.lower()
        try:
            if fname_lower.endswith(".csv") or fname_lower.endswith(".tsv") or fname_lower.endswith(".txt"):
                sep = "\t" if fname_lower.endswith(".tsv") else ","
                df_file = pd.read_csv(io.BytesIO(file_bytes), sep=sep)
            elif fname_lower.endswith(".xlsx") or fname_lower.endswith(".xls"):
                df_file = pd.read_excel(io.BytesIO(file_bytes))
            elif fname_lower.endswith(".json"):
                df_file = pd.read_json(io.BytesIO(file_bytes))
            else:
                # Default attempt CSV
                df_file = pd.read_csv(io.BytesIO(file_bytes))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse uploaded prediction file: {str(e)}")

        if df_file.empty:
            raise HTTPException(status_code=400, detail="The uploaded file contains 0 rows of data.")

        # Convert to records list
        records = df_file.to_dict(orient="records")
        return cls.predict_batch_new(dataset_id, records, model_id)

    @classmethod
    def get_prediction_template(
        cls,
        dataset_id: str,
        model_id: Optional[str] = None
    ) -> PredictTemplateResponse:
        """
        Generate unlabelled CSV template and sample rows for user data preparation.
        """
        try:
            df_orig, _, _ = version_service.get_original_dataset(dataset_id)
        except Exception:
            df_orig, _, _ = version_service.get_current_dataset(dataset_id)

        models_dir = cls.get_models_dir(dataset_id)
        target_model_file = (models_dir / f"{model_id}.pkl") if model_id else (models_dir / "latest.pkl")
        
        target_col = None
        if target_model_file.exists():
            try:
                with open(target_model_file, "rb") as f:
                    model_payload = pickle.load(f)
                target_col = model_payload.get("target_col")
            except Exception:
                pass

        if not target_col:
            try:
                _, _, _, _, split_target = SplitEngine.load_split(dataset_id)
                target_col = split_target
            except Exception:
                target_col = df_orig.columns[-1] if len(df_orig.columns) > 0 else None

        feature_cols = [c for c in df_orig.columns if c != target_col]

        # Build 3 sample rows
        sample_rows: List[Dict[str, Any]] = []
        sample_head = df_orig[feature_cols].head(3)
        for idx, row in sample_head.iterrows():
            row_dict = {}
            for c in feature_cols:
                v = row[c]
                if pd.isna(v):
                    row_dict[c] = None
                elif isinstance(v, (int, np.integer)):
                    row_dict[c] = int(v)
                elif isinstance(v, (float, np.floating)):
                    row_dict[c] = round(float(v), 2)
                else:
                    row_dict[c] = str(v)
            sample_rows.append(row_dict)

        # Generate CSV template
        csv_buffer = io.StringIO()
        if sample_rows:
            sample_df = pd.DataFrame(sample_rows)
            sample_df.to_csv(csv_buffer, index=False)
        else:
            csv_buffer.write(",".join(feature_cols) + "\n")

        return PredictTemplateResponse(
            dataset_id=dataset_id,
            target_column=target_col,
            expected_columns=feature_cols,
            sample_template_rows=sample_rows,
            csv_template=csv_buffer.getvalue()
        )

    @classmethod
    def get_predictions_file_path(cls, dataset_id: str) -> Tuple[Path, str]:
        """Retrieve Path and filename for exported batch prediction results CSV."""
        models_dir = cls.get_models_dir(dataset_id)
        pred_file = models_dir / "latest_new_predictions.csv"
        if not pred_file.exists():
            raise HTTPException(
                status_code=404,
                detail="No batch predictions found. Please run a batch prediction on a new dataset first."
            )
        return pred_file, f"predictions_{dataset_id}.csv"

    # =========================================================================
    # STEP 13: EVALUATION (y_pred vs y_test)
    # =========================================================================
    @classmethod
    def evaluate(
        cls,
        dataset_id: str,
        request: EvaluationRequest
    ) -> EvaluationResponse:
        """Compare test predictions y_pred against true ground-truth y_test."""
        models_dir = cls.get_models_dir(dataset_id)
        pred_file = models_dir / "predictions.pkl"
        
        if not pred_file.exists():
            # If predictions haven't been run explicitly, run predict automatically
            cls.predict(dataset_id, ModelPredictRequest(model_id=request.model_id))

        with open(pred_file, "rb") as f:
            pred_payload = pickle.load(f)

        y_pred = pred_payload["y_pred"]
        task_type = pred_payload["task_type"]
        model_type = pred_payload["model_type"]

        model_id = request.model_id or pred_payload.get("model_id") or "latest"
        target_model_file = (models_dir / f"{model_id}.pkl") if model_id != "latest" else (models_dir / "latest.pkl")
        model_name = model_type.replace("_", " ").title()

        _, X_test, _, y_test, target_col = SplitEngine.load_split(dataset_id)
        
        # Build comparative leaderboard across all fitted models
        leaderboard = []
        manifest_path = models_dir / "manifest.json"
        if manifest_path.exists():
            try:
                with open(manifest_path, "r") as mf:
                    manifest_data = json.load(mf)
                for entry in manifest_data:
                    m_id = entry.get("model_id")
                    m_type = entry.get("model_type", "model")
                    m_name = entry.get("name", m_type.replace("_", " ").title())
                    p_file = (models_dir / f"{m_id}.pkl") if m_id else None
                    if p_file and p_file.exists():
                        try:
                            with open(p_file, "rb") as pf:
                                p_obj = pickle.load(pf)
                            m_model = p_obj["model"]
                            m_feats = p_obj.get("feature_names", [])
                            m_X_test = X_test.reindex(columns=m_feats, fill_value=0.0).fillna(0.0)
                            if hasattr(m_model, "predict"):
                                m_pred = m_model.predict(m_X_test)
                            elif hasattr(m_model, "fit_predict"):
                                m_pred = m_model.fit_predict(m_X_test)
                            else:
                                m_pred = np.zeros(len(m_X_test))

                            score_dict = {
                                "model_id": m_id,
                                "model_type": m_type,
                                "name": m_name,
                                "is_active": (m_id == model_id or (model_id == "latest" and entry.get("is_active", False))),
                                "training_duration_ms": entry.get("training_duration_ms", 0),
                                "fitted_at": entry.get("fitted_at")
                            }
                            if task_type == "classification":
                                m_acc = float(accuracy_score([str(x) for x in y_test], [str(x) for x in m_pred]))
                                m_f1 = float(f1_score([str(x) for x in y_test], [str(x) for x in m_pred], average="weighted", zero_division=0))
                                score_dict["accuracy"] = round(m_acc, 4)
                                score_dict["f1_score"] = round(m_f1, 4)
                                score_dict["primary_metric"] = "F1-Score"
                                score_dict["primary_score"] = round(m_f1, 4)
                            elif task_type == "regression":
                                y_t_num = pd.to_numeric(y_test, errors="coerce").fillna(0.0).values
                                m_rmse = float(np.sqrt(mean_squared_error(y_t_num, m_pred)))
                                m_r2 = float(r2_score(y_t_num, m_pred))
                                score_dict["rmse"] = round(m_rmse, 4)
                                score_dict["r2_score"] = round(m_r2, 4)
                                score_dict["primary_metric"] = "R² Score"
                                score_dict["primary_score"] = round(m_r2, 4)
                            leaderboard.append(score_dict)
                        except Exception:
                            pass
                if leaderboard and "primary_score" in leaderboard[0]:
                    leaderboard.sort(key=lambda x: x.get("primary_score", 0), reverse=True)
            except Exception:
                leaderboard = []

        concept = concept_registry.get_concept("model_evaluation")
        edu_dict = {
            "title": concept.title if concept else "Model Evaluation & Generalization Verification",
            "short_definition": concept.short_definition if concept else "Evaluating test predictions against ground truth without data leakage.",
            "beginner_explanation": concept.beginner_explanation if concept else "",
            "why_it_matters": concept.why_it_matters if concept else "",
            "interview_tip": concept.interview_tip if concept else "",
            "common_mistakes": concept.common_mistakes if concept else []
        }

        explanations: Dict[str, str] = {}

        if task_type == "regression":
            y_test_num = pd.to_numeric(y_test, errors="coerce").fillna(0.0).values
            y_pred_num = np.array(y_pred, dtype=float)

            rmse_val = float(np.sqrt(mean_squared_error(y_test_num, y_pred_num)))
            r2_val = float(r2_score(y_test_num, y_pred_num))
            mse_val = float(mean_squared_error(y_test_num, y_pred_num))
            mae_val = float(mean_absolute_error(y_test_num, y_pred_num))

            explanations = {
                "RMSE": "Root Mean Squared Error measures the average magnitude of error in target units, penalizing large outlier errors heavily.",
                "R2": "Coefficient of Determination (R²) indicates the proportion of target variance explained by the model (1.0 = perfect fit).",
                "MSE": "Mean Squared Error is the mean of squared residuals.",
                "MAE": "Mean Absolute Error measures the average absolute difference between predicted and actual values."
            }

            return EvaluationResponse(
                dataset_id=dataset_id,
                model_id=model_id,
                model_type=model_type,
                model_name=model_name,
                task_type="regression",
                target_column=target_col,
                total_evaluated_samples=len(y_test_num),
                rmse=round(rmse_val, 4),
                r2_score=round(r2_val, 4),
                mse=round(mse_val, 4),
                mae=round(mae_val, 4),
                educational_concept=edu_dict,
                educational_explanations=explanations,
                leaderboard=leaderboard,
                message=f"Regression evaluation completed: RMSE = {round(rmse_val, 4)}, R² = {round(r2_val, 4)}.",
                timestamp=datetime.utcnow().isoformat()
            )

        elif task_type == "unsupervised":
            if not target_model_file.exists():
                raise HTTPException(status_code=400, detail="No trained model found for evaluation.")
            with open(target_model_file, "rb") as f:
                saved_payload = pickle.load(f)
            feat_names = saved_payload["feature_names"]
            num_X_test = X_test.reindex(columns=feat_names, fill_value=0.0).fillna(0.0)
            
            y_pred_arr = np.array(y_pred)
            unique_labels = set(y_pred_arr)
            cluster_counts = {f"Cluster_{k}" if k >= 0 else "Noise": int(np.sum(y_pred_arr == k)) for k in unique_labels}
            anomaly_count = int(np.sum(y_pred_arr == -1)) if -1 in unique_labels else None

            sil_score = None
            db_index = None
            if len(unique_labels - {-1}) >= 2 and len(num_X_test) > len(unique_labels):
                try:
                    sil_score = round(float(silhouette_score(num_X_test, y_pred_arr)), 4)
                except Exception:
                    pass
                try:
                    db_index = round(float(davies_bouldin_score(num_X_test, y_pred_arr)), 4)
                except Exception:
                    pass

            explanations = {
                "Silhouette_Score": "Measures how well each point is clustered with points similar to itself (-1 to +1, higher is better).",
                "Davies_Bouldin_Index": "Ratio of within-cluster distances to between-cluster distances (lower is better).",
                "Cluster_Distribution": "Breakdown of test instances partitioned into distinct discovered clusters."
            }

            return EvaluationResponse(
                dataset_id=dataset_id,
                model_id=model_id,
                model_type=model_type,
                model_name=model_name,
                task_type="unsupervised",
                target_column=target_col,
                total_evaluated_samples=len(num_X_test),
                silhouette_score=sil_score,
                davies_bouldin_index=db_index,
                cluster_counts=cluster_counts,
                anomaly_count=anomaly_count,
                educational_concept=edu_dict,
                educational_explanations=explanations,
                leaderboard=leaderboard,
                message=f"Unsupervised evaluation completed across {len(unique_labels)} partitions.",
                timestamp=datetime.utcnow().isoformat()
            )

        else:  # Classification
            y_test_str = [str(x) for x in y_test]
            y_pred_str = [str(x) for x in y_pred]

            acc = float(accuracy_score(y_test_str, y_pred_str))
            prec = float(precision_score(y_test_str, y_pred_str, average="weighted", zero_division=0))
            rec = float(recall_score(y_test_str, y_pred_str, average="weighted", zero_division=0))
            f1 = float(f1_score(y_test_str, y_pred_str, average="weighted", zero_division=0))

            # Confusion matrix
            labels = sorted(list(set(y_test_str).union(set(y_pred_str))))
            cm = confusion_matrix(y_test_str, y_pred_str, labels=labels)
            cm_data = ConfusionMatrixData(
                labels=labels,
                matrix=[[int(cell) for cell in row] for row in cm]
            )

            # Classification report
            cr_dict = classification_report(y_test_str, y_pred_str, output_dict=True, zero_division=0)
            class_reports: List[ClassificationReportClassDetail] = []
            for lab in labels:
                if lab in cr_dict:
                    class_reports.append(
                        ClassificationReportClassDetail(
                            class_label=lab,
                            precision=round(float(cr_dict[lab]["precision"]), 4),
                            recall=round(float(cr_dict[lab]["recall"]), 4),
                            f1_score=round(float(cr_dict[lab]["f1-score"]), 4),
                            support=int(cr_dict[lab]["support"])
                        )
                    )

            explanations = {
                "Accuracy": "Proportion of total correct predictions (TP + TN) / Total.",
                "Precision": "Of all instances predicted as positive, how many were truly positive? (TP / (TP + FP)).",
                "Recall": "Of all truly positive instances, how many did the model detect? (TP / (TP + FN)).",
                "F1_Score": "Harmonic mean of precision and recall (2 * P * R / (P + R)).",
                "Confusion_Matrix": "Visual grid comparing ground truth labels (rows) vs predicted labels (columns)."
            }

            return EvaluationResponse(
                dataset_id=dataset_id,
                model_id=model_id,
                model_type=model_type,
                model_name=model_name,
                task_type="classification",
                target_column=target_col,
                total_evaluated_samples=len(y_test_str),
                accuracy=round(acc, 4),
                precision=round(prec, 4),
                recall=round(rec, 4),
                f1_score=round(f1, 4),
                confusion_matrix=cm_data,
                classification_report=class_reports,
                educational_concept=edu_dict,
                educational_explanations=explanations,
                leaderboard=leaderboard,
                message=f"Classification evaluation completed: Accuracy = {round(acc * 100, 1)}%, F1-Score = {round(f1, 4)}.",
                timestamp=datetime.utcnow().isoformat()
            )

    @classmethod
    def list_models(cls, dataset_id: str) -> List[Dict[str, Any]]:
        """List all fitted models for this dataset session from manifest."""
        models_dir = cls.get_models_dir(dataset_id)
        manifest_path = models_dir / "manifest.json"
        if manifest_path.exists():
            try:
                with open(manifest_path, "r") as mf:
                    return json.load(mf)
            except Exception:
                pass
        
        # Fallback: inspect directory for saved pkl files
        models = []
        for pkl_file in models_dir.glob("model_*.pkl"):
            try:
                with open(pkl_file, "rb") as f:
                    p = pickle.load(f)
                    models.append({
                        "model_id": p.get("model_id", pkl_file.stem),
                        "model_type": p.get("model_type", "unknown"),
                        "name": p.get("model_type", "unknown").replace("_", " ").title(),
                        "task_type": p.get("task_type", "supervised"),
                        "train_rows": 0,
                        "feature_count": len(p.get("feature_names", [])),
                        "features_used": p.get("feature_names", []),
                        "training_duration_ms": 0,
                        "feature_importances": {},
                        "hyperparameters": {},
                        "fitted_at": p.get("fitted_at", datetime.utcnow().isoformat()),
                        "is_active": False
                    })
            except Exception:
                continue
        return models

    @classmethod
    def activate_model(cls, dataset_id: str, model_id: str) -> Dict[str, Any]:
        """Activate a specific model by model_id, making it the latest.pkl target."""
        models_dir = cls.get_models_dir(dataset_id)
        target_model_file = models_dir / f"{model_id}.pkl"
        if not target_model_file.exists():
            raise HTTPException(status_code=404, detail=f"Model '{model_id}' not found.")
        
        # Copy / rewrite latest.pkl
        with open(target_model_file, "rb") as sf:
            payload = pickle.load(sf)
        with open(models_dir / "latest.pkl", "wb") as df:
            pickle.dump(payload, df)
        
        # Update manifest
        manifest_path = models_dir / "manifest.json"
        active_entry = None
        if manifest_path.exists():
            try:
                with open(manifest_path, "r") as mf:
                    manifest_data = json.load(mf)
                for item in manifest_data:
                    if item.get("model_id") == model_id:
                        item["is_active"] = True
                        active_entry = item
                    else:
                        item["is_active"] = False
                with open(manifest_path, "w") as mf:
                    json.dump(manifest_data, mf, indent=2)
            except Exception:
                pass
        
        return {
            "success": True,
            "model_id": model_id,
            "message": f"Model {model_id} activated for inference and evaluation.",
            "active_model": active_entry or {"model_id": model_id}
        }

    @classmethod
    def get_model_file_path(cls, dataset_id: str, model_id: Optional[str] = None) -> Tuple[Path, str]:
        """Retrieve Path and filename for a serialized model artifact pickle file."""
        models_dir = cls.get_models_dir(dataset_id)
        if not models_dir.exists():
            raise HTTPException(status_code=404, detail="No model directory found for this dataset. Please train a model in Step 11 first.")

        if model_id and model_id != "latest":
            pkl_path = models_dir / f"{model_id}.pkl"
            if not pkl_path.exists():
                pkl_path = models_dir / f"{model_id}"
            if not pkl_path.exists():
                raise HTTPException(status_code=404, detail=f"Model artifact '{model_id}' not found.")
            filename = f"datamentor_{model_id}.pkl"
        else:
            # Try to resolve the active or latest model
            manifest_path = models_dir / "manifest.json"
            target_model_id = None
            model_type = "model"
            if manifest_path.exists():
                try:
                    with open(manifest_path, "r") as mf:
                        manifest_data = json.load(mf)
                    for item in manifest_data:
                        if item.get("is_active"):
                            target_model_id = item.get("model_id")
                            model_type = item.get("model_type", "model")
                            break
                    if not target_model_id and manifest_data:
                        target_model_id = manifest_data[0].get("model_id")
                        model_type = manifest_data[0].get("model_type", "model")
                except Exception:
                    pass

            if target_model_id and (models_dir / f"{target_model_id}.pkl").exists():
                pkl_path = models_dir / f"{target_model_id}.pkl"
                filename = f"datamentor_{model_type}_{target_model_id}.pkl"
            else:
                pkl_path = models_dir / "latest.pkl"
                filename = "datamentor_model_latest.pkl"

            if not pkl_path.exists():
                # Check for any .pkl file in models_dir
                pkl_files = list(models_dir.glob("*.pkl"))
                if pkl_files:
                    pkl_path = pkl_files[0]
                    filename = f"datamentor_{pkl_path.name}"
                else:
                    raise HTTPException(status_code=404, detail="No serialized model pickle file found. Please train a model in Step 11 first.")

        return pkl_path, filename

