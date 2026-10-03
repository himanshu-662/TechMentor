"""Deterministic Golden Benchmark Queries for Phase 16 RAG Knowledge Base Evaluation."""
from typing import List, Dict, Any

BENCHMARK_QUERIES: List[Dict[str, Any]] = [
    {
        "query": "What is overfitting?",
        "expected_topics": ["Overfitting", "Bias-Variance", "Generalization", "Regularization"],
        "expected_keywords": ["overfitting", "variance", "generalization", "noise"]
    },
    {
        "query": "What is precision?",
        "expected_topics": ["Precision", "Confusion Matrix", "False Positive"],
        "expected_keywords": ["precision", "positive", "fp", "tp"]
    },
    {
        "query": "What is recall?",
        "expected_topics": ["Recall", "Sensitivity", "True Positive Rate", "False Negative"],
        "expected_keywords": ["recall", "sensitivity", "fn", "tp"]
    },
    {
        "query": "Why is feature scaling useful?",
        "expected_topics": ["Feature Scaling", "StandardScaler", "MinMaxScaler", "Normalization"],
        "expected_keywords": ["scaling", "standardscaler", "minmaxscaler", "distance", "gradient"]
    },
    {
        "query": "What is cross-validation?",
        "expected_topics": ["Cross-Validation", "K-Fold", "Train-Test Split"],
        "expected_keywords": ["cross-validation", "k-fold", "folds", "split", "generalization"]
    },
    {
        "query": "What is data leakage?",
        "expected_topics": ["Data Leakage", "Splitting", "Preprocessors"],
        "expected_keywords": ["leakage", "target", "test", "split", "preprocessor"]
    },
    {
        "query": "What is one-hot encoding?",
        "expected_topics": ["One-Hot Encoding", "Categorical Data", "Dummy Variable Trap"],
        "expected_keywords": ["one-hot", "dummy", "binary", "categorical", "nominal"]
    },
    {
        "query": "What is feature selection?",
        "expected_topics": ["Feature Selection", "Variance Threshold", "RFE", "Filter Methods"],
        "expected_keywords": ["selection", "variance", "rfe", "correlation", "subset"]
    },
    {
        "query": "What is standardization?",
        "expected_topics": ["StandardScaler", "Z-Score", "Gaussian"],
        "expected_keywords": ["standardization", "z-score", "mean", "std", "normal"]
    },
    {
        "query": "What is normalization?",
        "expected_topics": ["MinMaxScaler", "Normalization", "Range"],
        "expected_keywords": ["normalization", "minmax", "bound", "scale"]
    },
    {
        "query": "How does PCA work?",
        "expected_topics": ["Principal Component Analysis", "Eigendecomposition", "Dimensionality Reduction"],
        "expected_keywords": ["pca", "eigenvalues", "eigenvectors", "variance", "orthogonal"]
    },
    {
        "query": "What is an outlier and how to detect it using IQR?",
        "expected_topics": ["Outlier Detection", "IQR Rule", "Tukey's Fences"],
        "expected_keywords": ["outlier", "iqr", "q1", "q3", "fences"]
    }
]
