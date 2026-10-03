"""Concept Registry providing central deterministic indexation and search for Educational Concepts."""
from typing import Dict, List, Optional
try:
    from app.engines.menti_ai.education.models import EducationalConcept
    from app.engines.menti_ai.education.concepts.data_fundamentals import DATA_FUNDAMENTALS_CONCEPTS
    from app.engines.menti_ai.education.concepts.data_quality import DATA_QUALITY_CONCEPTS
    from app.engines.menti_ai.education.concepts.data_types import DATA_TYPES_CONCEPTS
    from app.engines.menti_ai.education.concepts.statistics import STATISTICS_CONCEPTS
    from app.engines.menti_ai.education.concepts.advanced import ADVANCED_CONCEPTS
    from app.engines.menti_ai.education.concepts.outliers import OUTLIER_CONCEPTS
    from app.engines.menti_ai.education.concepts.transformations import TRANSFORMATION_CONCEPTS
    from app.engines.menti_ai.education.concepts.feature_engineering import FEATURE_ENGINEERING_CONCEPTS
    from app.engines.menti_ai.education.concepts.encoding import ENCODING_CONCEPTS
    from app.engines.menti_ai.education.concepts.dimensionality import DIMENSIONALITY_CONCEPTS
    from app.engines.menti_ai.education.concepts.feature_selection import FEATURE_SELECTION_CONCEPTS
    from app.engines.menti_ai.education.concepts.train_test_split import TRAIN_TEST_SPLIT_CONCEPTS
    from app.engines.menti_ai.education.concepts.model_fitting import MODEL_FITTING_CONCEPTS
    from app.engines.menti_ai.education.concepts.prediction import PREDICTION_CONCEPTS
    from app.engines.menti_ai.education.concepts.evaluation import EVALUATION_CONCEPTS
except ImportError:
    from app.engines.menti_ai.education.models import EducationalConcept
    from app.engines.menti_ai.education.concepts.data_fundamentals import DATA_FUNDAMENTALS_CONCEPTS
    from app.engines.menti_ai.education.concepts.data_quality import DATA_QUALITY_CONCEPTS
    from app.engines.menti_ai.education.concepts.data_types import DATA_TYPES_CONCEPTS
    from app.engines.menti_ai.education.concepts.statistics import STATISTICS_CONCEPTS
    from app.engines.menti_ai.education.concepts.advanced import ADVANCED_CONCEPTS
    from app.engines.menti_ai.education.concepts.outliers import OUTLIER_CONCEPTS
    from app.engines.menti_ai.education.concepts.transformations import TRANSFORMATION_CONCEPTS
    from app.engines.menti_ai.education.concepts.feature_engineering import FEATURE_ENGINEERING_CONCEPTS
    from app.engines.menti_ai.education.concepts.encoding import ENCODING_CONCEPTS
    from app.engines.menti_ai.education.concepts.dimensionality import DIMENSIONALITY_CONCEPTS
    from app.engines.menti_ai.education.concepts.feature_selection import FEATURE_SELECTION_CONCEPTS
    from app.engines.menti_ai.education.concepts.train_test_split import TRAIN_TEST_SPLIT_CONCEPTS
    from app.engines.menti_ai.education.concepts.model_fitting import MODEL_FITTING_CONCEPTS
    from app.engines.menti_ai.education.concepts.prediction import PREDICTION_CONCEPTS
    from app.engines.menti_ai.education.concepts.evaluation import EVALUATION_CONCEPTS


class ConceptRegistry:
    """In-memory educational concept knowledge base."""

    def __init__(self):
        self._concepts: Dict[str, EducationalConcept] = {}
        self._categories: Dict[str, List[EducationalConcept]] = {}
        self._aliases: Dict[str, str] = {
            # Step 13: Evaluation aliases
            "model_evaluation": "model_evaluation",
            "evaluation": "model_evaluation",
            "evaluate": "model_evaluation",
            "evaluation_metrics": "model_evaluation",
            "metrics": "model_evaluation",
            "confusion_matrix": "confusion_matrix",
            "cm": "confusion_matrix",
            "confusion": "confusion_matrix",
            "regression_metrics": "regression_metrics",
            "rmse": "regression_metrics",
            "r2": "regression_metrics",
            "r2_score": "regression_metrics",
            "r_squared": "regression_metrics",
            "mae": "regression_metrics",
            "mse": "regression_metrics",
            "classification_metrics": "confusion_matrix",
            "precision_recall": "confusion_matrix",
            # Step 12: Prediction aliases
            "prediction": "prediction",
            "predictions": "prediction",
            "predict": "prediction",
            "inference": "prediction",
            "model_prediction": "prediction",
            "model_inference": "prediction",
            "calibration": "probability_calibration",
            "probability_calibration": "probability_calibration",
            "predict_proba": "probability_calibration",
            "probabilities": "probability_calibration",
            "residual": "residuals",
            "residuals": "residuals",
            "residual_error": "residuals",
            "threshold": "decision_threshold",
            "decision_threshold": "decision_threshold",
            "classification_threshold": "decision_threshold",
            # Step 11: Model Fitting aliases
            "fit": "model_fitting",
            "fitting": "model_fitting",
            "model_fit": "model_fitting",
            "model_fitting": "model_fitting",
            "training": "model_fitting",
            "model_training": "model_fitting",
            "hyperparameter": "hyperparameters",
            "hyperparameters": "hyperparameters",
            "tuning": "hyperparameters",
            "hyperparameter_tuning": "hyperparameters",
            "bias_variance": "bias_variance_tradeoff",
            "bias_variance_tradeoff": "bias_variance_tradeoff",
            "overfitting": "bias_variance_tradeoff",
            "underfitting": "bias_variance_tradeoff",
            # Step 10: Train-Test Split aliases
            "split": "train_test_split",
            "train_test": "train_test_split",
            "train_test_split": "train_test_split",
            "training_test_split": "train_test_split",
            "stratification": "stratified_sampling",
            "stratified": "stratified_sampling",
            "stratify": "stratified_sampling",
            "stratified_split": "stratified_sampling",
            "stratified_kfold": "stratified_sampling",
            "cv": "cross_validation",
            "kfold": "cross_validation",
            "k_fold": "cross_validation",
            "k-fold": "cross_validation",
            "k_fold_cross_validation": "cross_validation",
            "leakage": "data_leakage",
            "data_leakage": "data_leakage",
            "target_leakage": "data_leakage",
            "test_leakage": "data_leakage",
            # Helpful aliases for smooth querying and issue detector mapping

            "nulls": "missing_values",
            "nans": "missing_values",
            "missing": "missing_values",
            "duplicates": "duplicate_records",
            "duplicate": "duplicate_records",
            "duplicate_rows": "duplicate_records",
            "constant_column": "constant_features",
            "constant": "constant_features",
            "near_constant": "near_constant_features",
            "near_constant_column": "near_constant_features",
            "quasi_constant": "near_constant_features",
            "std": "standard_deviation",
            "std_dev": "standard_deviation",
            "stdev": "standard_deviation",
            "min": "minimum",
            "max": "maximum",
            "q1": "quartiles",
            "q2": "quartiles",
            "q3": "quartiles",
            "interquartile_range": "iqr",
            "skew": "skewness",
            "outliers": "outlier",
            "extreme_values": "outlier",
            "z_score": "zscore",
            "modified_z_score": "modified_zscore",
            "modz": "modified_zscore",
            "capping": "winsorization",
            "cap": "winsorization",
            "winsorize": "winsorization",
            "trimming": "outlier_removal",
            "remove_outliers": "outlier_removal",
            "remove_outlier": "outlier_removal",
            "removing_outliers": "outlier_removal",
            "how_to_remove_outliers": "outlier_removal",
            "handling_outliers": "handling_outliers",
            "outlier_handling": "handling_outliers",
            "how_to_handle_outliers": "handling_outliers",
            "outlier_treatment": "handling_outliers",
            "outlier_treatments": "handling_outliers",
            "outlier_capping": "winsorization",
            "outlier_flagging": "handling_outliers",
            "pca": "pca",
            "principal_component_analysis": "pca",
            "principal_components": "pca",
            "lda": "lda",
            "linear_discriminant_analysis": "lda",
            "svd": "svd",
            "truncated_svd": "svd",
            "dimensionality": "curse_of_dimensionality",
            "dimensionality_reduction": "curse_of_dimensionality",
            "dimension_reduction": "curse_of_dimensionality",
            "dim_reduction": "curse_of_dimensionality",
            "curse_of_dimensionality": "curse_of_dimensionality",
            "scree": "scree_plot",
            "scree_plot": "scree_plot",
            "elbow_criterion": "scree_plot",
            "kaiser_criterion": "scree_plot",
            "eigenvalue": "scree_plot",
            "eigenvalues": "scree_plot",
            "feature_selection": "feature_selection",
            "selection": "feature_selection",
            "features_selection": "feature_selection",
            "select_k_best": "select_k_best",
            "selectkbest": "select_k_best",
            "k_best": "select_k_best",
            "kbest": "select_k_best",
            "f_score": "f_score",
            "f_classif": "f_score",
            "f_regression": "f_score",
            "anova": "f_score",
            "anova_f": "f_score",
            "mutual_info": "mutual_information",
            "mutual_information": "mutual_information",
            "information_gain": "mutual_information",
            "mutual_info_classif": "mutual_information",
            "mutual_info_regression": "mutual_information",
            "identifiers": "identifier",
            "id": "identifier",
            "numerical": "numerical_data",
            "numeric": "numerical_data",
            "categorical": "categorical_data",
            "category": "categorical_data",
            "datetime": "datetime_data",
            "timestamp": "datetime_data",
            "scaling": "feature_scaling",
            "scaler": "feature_scaling",
            "standard_scaler": "standardization",
            "standardize": "standardization",
            "z_score_scaling": "standardization",
            "minmax": "min_max_scaling",
            "min_max": "min_max_scaling",
            "minmax_scaler": "min_max_scaling",
            "normalization": "min_max_scaling",
            "robust": "robust_scaling",
            "robust_scaler": "robust_scaling",
            "log": "log_transformation",
            "log1p": "log_transformation",
            "log_transform": "log_transformation",
            "power_transform": "power_transformation",
            "yeojohnson": "yeo_johnson",
            "yeo_johnson_transform": "yeo_johnson",
            "boxcox": "box_cox",
            "box_cox_transform": "box_cox",
            "leakage": "data_leakage",
            "fit_transform": "fit_vs_transform",
            "fe": "feature_engineering",
            "interactions": "interaction_features",
            "interaction": "interaction_features",
            "ratios": "ratio_features",
            "ratio": "ratio_features",
            "math_features": "mathematical_features",
            "math": "mathematical_features",
            "arithmetic_features": "mathematical_features",
            "cyclical": "cyclical_encoding",
            "sine_cosine": "cyclical_encoding",
            "datediff": "date_difference",
            "date_diff": "date_difference",
            "duration": "date_difference",
            "aggregations": "aggregation_features",
            "grouped_aggregations": "aggregation_features",
            "binning": "feature_binning",
            "discretization": "feature_binning",
            "indicator": "indicator_features",
            "indicators": "indicator_features",
            "flags": "indicator_features",
            "boolean_features": "indicator_features",
            "freq_encoding": "frequency_features",
            "count_encoding": "frequency_features",
            "text_stats": "text_features",
            "text_statistics": "text_features",
            "feature_leak": "feature_leakage",
            "ohe": "one_hot_encoding",
            "onehot": "one_hot_encoding",
            "one_hot": "one_hot_encoding",
            "label": "label_encoding",
            "ordinal": "ordinal_encoding",
            "frequency": "frequency_encoding",
            "freq": "frequency_encoding",
            "dummy_trap": "dummy_variable_trap",
            "dummy": "dummy_variable_trap",
        }
        self._load_all_concepts()

    def _load_all_concepts(self) -> None:
        """Register all defined concepts from modules into registry dictionaries."""
        all_concept_lists = [
            DATA_FUNDAMENTALS_CONCEPTS,
            DATA_QUALITY_CONCEPTS,
            DATA_TYPES_CONCEPTS,
            STATISTICS_CONCEPTS,
            ADVANCED_CONCEPTS,
            OUTLIER_CONCEPTS,
            TRANSFORMATION_CONCEPTS,
            FEATURE_ENGINEERING_CONCEPTS,
            ENCODING_CONCEPTS,
            DIMENSIONALITY_CONCEPTS,
            FEATURE_SELECTION_CONCEPTS,
            TRAIN_TEST_SPLIT_CONCEPTS,
            MODEL_FITTING_CONCEPTS,
            PREDICTION_CONCEPTS,
            EVALUATION_CONCEPTS,
        ]

        for concept_list in all_concept_lists:
            for concept in concept_list:
                cid = concept.concept_id.lower().strip()
                self._concepts[cid] = concept

                category = concept.category.lower().strip()
                if category not in self._categories:
                    self._categories[category] = []
                self._categories[category].append(concept)

    def get_concept(self, concept_id: str) -> Optional[EducationalConcept]:
        """Lookup a concept by ID or alias (case-insensitive)."""
        if not concept_id:
            return None
        norm_id = concept_id.lower().strip()
        if norm_id in self._concepts:
            return self._concepts[norm_id]
        if norm_id in self._aliases:
            resolved_id = self._aliases[norm_id]
            return self._concepts.get(resolved_id)
        return None

    def list_concepts(
        self,
        category: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[EducationalConcept]:
        """List concepts with optional category and search filtering."""
        results = list(self._concepts.values())

        if category and category.lower() != "all":
            norm_cat = category.lower().strip()
            results = [c for c in results if c.category.lower() == norm_cat]

        if search:
            query = search.lower().strip()
            results = [
                c for c in results
                if query in c.concept_id.lower()
                or query in c.title.lower()
                or query in c.short_definition.lower()
                or query in c.beginner_explanation.lower()
                or query in c.intermediate_explanation.lower()
                or query in c.technical_explanation.lower()
                or query in c.why_it_matters.lower()
                or any(query in kw.lower() for kw in c.common_methods)
            ]

        return results

    def get_categories(self) -> List[str]:
        """Return list of distinct categories in order."""
        return ["data_fundamentals", "data_quality", "data_types", "statistics", "advanced"]

    def get_related_concepts(self, concept_id: str) -> List[EducationalConcept]:
        """Retrieve the list of EducationalConcept objects related to a given concept ID."""
        concept = self.get_concept(concept_id)
        if not concept:
            return []

        related: List[EducationalConcept] = []
        for rel_id in concept.related_concepts:
            rel_obj = self.get_concept(rel_id)
            if rel_obj and rel_obj not in related:
                related.append(rel_obj)
        return related

    def total_count(self) -> int:
        """Return the total number of unique concepts registered."""
        return len(self._concepts)


concept_registry = ConceptRegistry()
