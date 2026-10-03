"""Pydantic data models for Steps 11, 12, 13: Model Fitting, Prediction, and Evaluation."""
from typing import List, Dict, Any, Optional, Union
from enum import Enum
from pydantic import BaseModel, Field, root_validator


class ModelTypeEnum(str, Enum):
    # Regression
    LINEAR_REGRESSION = "linear_regression"
    RIDGE_REGRESSION = "ridge"
    LASSO_REGRESSION = "lasso"
    ELASTIC_NET = "elastic_net"
    DECISION_TREE_REGRESSOR = "decision_tree_regressor"
    RANDOM_FOREST_REGRESSOR = "random_forest_regressor"
    GRADIENT_BOOSTING_REGRESSOR = "gradient_boosting_regressor"
    SUPPORT_VECTOR_REGRESSOR = "svr"
    KNN_REGRESSOR = "knn_regressor"
    
    # Classification
    LOGISTIC_REGRESSION = "logistic_regression"
    DECISION_TREE_CLASSIFIER = "decision_tree_classifier"
    RANDOM_FOREST_CLASSIFIER = "random_forest_classifier"
    GRADIENT_BOOSTING_CLASSIFIER = "gradient_boosting_classifier"
    SUPPORT_VECTOR_CLASSIFIER = "svc"
    KNN_CLASSIFIER = "knn_classifier"
    NAIVE_BAYES = "gaussian_nb"
    
    # Unsupervised Learning
    KMEANS = "kmeans"
    DBSCAN = "dbscan"
    ISOLATION_FOREST = "isolation_forest"


class ModelSummaryResponse(BaseModel):
    """Step 11 readiness summary containing partition status, task type, and candidate algorithms."""
    dataset_id: str
    has_split: bool
    train_rows: int
    test_rows: int
    target_column: Optional[str] = None
    target_type: str = "classification"  # "classification", "regression", or "unsupervised"
    feature_count: int = 0
    feature_names: List[str] = Field(default_factory=list)
    available_algorithms: List[Dict[str, Any]] = Field(default_factory=list)
    recommended_model: str = "logistic_regression"
    recommendation_reason: str = ""
    message: str


# --- Step 11: Model Fitting Models ---
class ModelFitRequest(BaseModel):
    """Payload to train a model on X_train and y_train."""
    model_type: Union[ModelTypeEnum, str] = ModelTypeEnum.LINEAR_REGRESSION
    hyperparameters: Dict[str, Any] = Field(default_factory=dict)

    @root_validator(pre=True)
    def normalize_model_type(cls, values):
        if isinstance(values, dict):
            m_type = values.get("model_type")
            if isinstance(m_type, str):
                m_lower = m_type.lower().strip()
                alias_map = {
                    "linear": "linear_regression",
                    "linear_regression": "linear_regression",
                    "ridge": "ridge",
                    "lasso": "lasso",
                    "elasticnet": "elastic_net",
                    "elastic_net": "elastic_net",
                    "tree": "decision_tree_classifier",
                    "decision_tree": "decision_tree_classifier",
                    "decision_tree_regressor": "decision_tree_regressor",
                    "decision_tree_classifier": "decision_tree_classifier",
                    "forest": "random_forest_classifier",
                    "random_forest": "random_forest_classifier",
                    "random_forest_classifier": "random_forest_classifier",
                    "random_forest_regressor": "random_forest_regressor",
                    "gradient_boosting": "gradient_boosting_classifier",
                    "gradient_boosting_classifier": "gradient_boosting_classifier",
                    "gradient_boosting_regressor": "gradient_boosting_regressor",
                    "gbm": "gradient_boosting_classifier",
                    "svm": "svc",
                    "svc": "svc",
                    "svr": "svr",
                    "support_vector_machine": "svc",
                    "knn": "knn_classifier",
                    "knn_classifier": "knn_classifier",
                    "knn_regressor": "knn_regressor",
                    "k_nearest_neighbors": "knn_classifier",
                    "naive_bayes": "gaussian_nb",
                    "nb": "gaussian_nb",
                    "gaussian_nb": "gaussian_nb",
                    "logistic": "logistic_regression",
                    "logistic_regression": "logistic_regression",
                    "kmeans": "kmeans",
                    "k_means": "kmeans",
                    "dbscan": "dbscan",
                    "isolation_forest": "isolation_forest",
                    "isolationforest": "isolation_forest"
                }
                values["model_type"] = alias_map.get(m_lower, m_lower)
        return values


class ModelFitResponse(BaseModel):
    """Training completion summary."""
    success: bool = True
    dataset_id: str
    model_id: str
    model_type: str
    task_type: str  # "regression" or "classification"
    train_rows: int
    feature_count: int
    features_used: List[str]
    training_duration_ms: float
    feature_importances: Dict[str, float] = Field(default_factory=dict)
    model_parameters: Dict[str, Any] = Field(default_factory=dict)
    explanation: Dict[str, Any] = Field(default_factory=dict)
    message: str
    timestamp: str



# --- Step 12: Prediction Models ---
class PredictionItem(BaseModel):
    """Row-level prediction."""
    index: int
    actual: Optional[Any] = None
    predicted: Any
    residual: Optional[float] = None
    probabilities: Optional[Dict[str, float]] = None


class ModelPredictRequest(BaseModel):
    """Payload to generate predictions on X_test."""
    model_id: Optional[str] = None
    limit: Optional[int] = Field(default=50, description="Max number of sample rows to return for preview")


class ModelPredictResponse(BaseModel):
    """Prediction output summary."""
    dataset_id: str
    model_id: Optional[str] = None
    model_type: str
    model_name: Optional[str] = None
    task_type: str
    target_column: Optional[str] = None
    feature_names: List[str] = Field(default_factory=list)
    total_test_samples: int
    sample_predictions: List[PredictionItem] = Field(default_factory=list)
    summary_stats: Optional[Dict[str, Any]] = None
    inference_latency_ms: Optional[float] = None
    explanation: Optional[Dict[str, Any]] = None
    message: str
    timestamp: str


class SinglePredictRequest(BaseModel):
    """Payload to generate prediction for a custom feature vector."""
    model_id: Optional[str] = None
    features: Dict[str, Any] = Field(..., description="Mapping of feature column names to input values")


class SinglePredictResponse(BaseModel):
    """Single-sample prediction response for What-If playground."""
    dataset_id: str
    model_id: Optional[str] = None
    model_type: str
    task_type: str
    predicted: Any
    probabilities: Optional[Dict[str, float]] = None
    confidence: Optional[float] = None
    features_used: Dict[str, Any] = Field(default_factory=dict)
    message: str
    timestamp: str


class FeatureStatItem(BaseModel):
    """Statistics for a feature to help user input in What-If simulator."""
    name: str
    dtype: str
    min_val: Optional[float] = None
    max_val: Optional[float] = None
    mean_val: Optional[float] = None
    median_val: Optional[float] = None
    default_val: Any = None


class OriginalFeatureItem(BaseModel):
    """Original raw column schema for human-readable live prediction input."""
    name: str
    type: str  # "numeric" | "categorical" | "boolean"
    dtype: str
    categories: List[str] = Field(default_factory=list)
    min_val: Optional[float] = None
    max_val: Optional[float] = None
    mean_val: Optional[float] = None
    median_val: Optional[float] = None
    default_val: Any = None
    is_target: bool = False


class OriginalSchemaResponse(BaseModel):
    """Original schema and sample rows for live prediction playground."""
    dataset_id: str
    target_column: Optional[str] = None
    task_type: str
    features: List[OriginalFeatureItem] = Field(default_factory=list)
    sample_rows: List[Dict[str, Any]] = Field(default_factory=list)
    model_feature_names: List[str] = Field(default_factory=list)


class LivePredictRequest(BaseModel):
    """Live prediction request using raw human inputs."""
    model_id: Optional[str] = None
    inputs: Dict[str, Any] = Field(..., description="Mapping of raw or preprocessed feature names to input values")


class LivePredictResponse(BaseModel):
    """Response for real-time live prediction."""
    dataset_id: str
    model_id: str
    model_type: str
    task_type: str
    target_column: Optional[str] = None
    predicted: Any
    predicted_label: Optional[str] = None
    probabilities: Optional[Dict[str, float]] = None
    confidence: Optional[float] = None
    raw_inputs: Dict[str, Any] = Field(default_factory=dict)
    transformed_vector: Dict[str, float] = Field(default_factory=dict)
    top_contributing_features: List[Dict[str, Any]] = Field(default_factory=list)
    explanation: Dict[str, Any] = Field(default_factory=dict)
    message: str
    timestamp: str


class SampleInstanceResponse(BaseModel):
    """Sample instance data for interactive prediction playground."""
    dataset_id: str
    model_id: Optional[str] = None
    target_column: Optional[str] = None
    task_type: str
    features: List[FeatureStatItem] = Field(default_factory=list)
    sample_values: Dict[str, Any] = Field(default_factory=dict)


# --- Step 12: New Dataset Batch Inference Models ---
class BatchNewPredictRequest(BaseModel):
    """Payload to generate predictions on multiple new unseen raw records."""
    model_id: Optional[str] = None
    records: List[Dict[str, Any]] = Field(..., description="List of unlabelled record dicts")


class BatchPredictRowItem(BaseModel):
    """Prediction result for an individual unlabelled record."""
    row_index: int
    inputs: Dict[str, Any] = Field(default_factory=dict)
    predicted: Any
    predicted_label: Optional[str] = None
    probabilities: Optional[Dict[str, float]] = None
    confidence: Optional[float] = None


class BatchNewPredictResponse(BaseModel):
    """Batch inference response for new unseen dataset or records."""
    dataset_id: str
    model_id: str
    model_type: str
    task_type: str
    target_column: Optional[str] = None
    total_records: int
    preview_rows: List[BatchPredictRowItem] = Field(default_factory=list)
    columns: List[str] = Field(default_factory=list)
    summary_stats: Optional[Dict[str, Any]] = None
    inference_latency_ms: float
    csv_download_available: bool = True
    message: str
    timestamp: str


class PredictTemplateResponse(BaseModel):
    """Template schema and sample empty unlabelled rows to help user format new prediction files."""
    dataset_id: str
    target_column: Optional[str] = None
    expected_columns: List[str] = Field(default_factory=list)
    sample_template_rows: List[Dict[str, Any]] = Field(default_factory=list)
    csv_template: str


# --- Step 13: Evaluation Models ---
class ConfusionMatrixData(BaseModel):
    """Confusion matrix structure for classification."""
    labels: List[str]
    matrix: List[List[int]]


class ClassificationReportClassDetail(BaseModel):
    """Precision, Recall, F1 per class."""
    class_label: str
    precision: float
    recall: float
    f1_score: float
    support: int


class EvaluationRequest(BaseModel):
    """Payload to evaluate predictions against y_test."""
    model_id: Optional[str] = None


class EvaluationResponse(BaseModel):
    """Comprehensive evaluation metrics comparing y_pred vs y_test."""
    dataset_id: str
    model_id: Optional[str] = None
    model_type: str
    model_name: Optional[str] = None
    task_type: str
    target_column: Optional[str] = None
    total_evaluated_samples: int
    
    # Regression metrics
    rmse: Optional[float] = None
    r2_score: Optional[float] = None
    mse: Optional[float] = None
    mae: Optional[float] = None
    
    # Classification metrics
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None
    confusion_matrix: Optional[ConfusionMatrixData] = None
    classification_report: Optional[List[ClassificationReportClassDetail]] = None
    
    # Unsupervised metrics
    silhouette_score: Optional[float] = None
    davies_bouldin_index: Optional[float] = None
    inertia: Optional[float] = None
    cluster_counts: Optional[Dict[str, int]] = None
    anomaly_count: Optional[int] = None
    
    educational_concept: Optional[Dict[str, Any]] = None
    educational_explanations: Dict[str, str] = Field(default_factory=dict)
    leaderboard: Optional[List[Dict[str, Any]]] = None
    message: str
    timestamp: str
