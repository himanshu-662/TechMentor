# DataMentor AI — API Specification

## 1. Overview

The DataMentor AI backend is powered by FastAPI, with RESTful JSON endpoints mounted under the `/api/v1` namespace.

---

## 2. Base Endpoints

### 2.1 System Health Check
- **Endpoint:** `GET /health` or `GET /api/v1/health`
- **Description:** Verifies that the API service is operational and returns metadata.
- **Status Code:** `200 OK`

#### Response Schema:
```json
{
  "status": "healthy",
  "app_name": "DataMentor AI",
  "version": "0.1.0",
  "environment": "development",
  "timestamp": "2026-09-30T02:00:00Z"
}
```

---

## 3. Standard Explainability Payload Specification

All future data processing endpoints will include an explanation payload adhering to the `OperationExplanation` schema:

```json
{
  "operation_id": "op_clean_impute_001",
  "module_name": "cleaning",
  "what_happened": "Replaced 42 missing numerical values in 'MonthlyIncome' with the median value ($4,250).",
  "why_it_happened": "Column contained 3.8% missing values and exhibits a right-skewed distribution.",
  "technique_used": "Median Imputation",
  "selection_rationale": "Median preserves central tendency for skewed distributions without outlier distortion.",
  "metrics_before": {
    "missing_count": 42,
    "missing_pct": 3.8,
    "mean": 4890.0,
    "skewness": 2.14
  },
  "metrics_after": {
    "missing_count": 0,
    "missing_pct": 0.0,
    "mean": 4510.0,
    "skewness": 1.95
  },
  "impact_summary": "42 rows updated. Mean shifted slightly downward, variance preserved.",
  "alternatives": [
    {
      "name": "KNN Imputation",
      "description": "Estimates missing values based on similarity to k nearest records.",
      "pros": ["Preserves multivariate relationships"],
      "cons": ["High computational cost on large datasets"],
      "best_used_when": "When feature correlations are strong and dataset size is moderate."
    }
  ],
  "when_to_use": "Recommended for skewed numeric data where computation speed is valued.",
  "learning_concept_tag": "missing_data_imputation"
}
```

---

## 4. Planned Endpoint Namespaces

| Namespace | Module | Purpose |
|---|---|---|
| `/api/v1/datasets` | `ingestion` | Upload, list, and manage dataset files |
| `/api/v1/profiling` | `profiling` | Generate statistical summaries and quality diagnostics |
| `/api/v1/cleaning` | `cleaning` | Imputation, deduplication, and sanitization |
| `/api/v1/outliers` | `outliers` | Outlier detection and treatment strategies |
| `/api/v1/transformations` | `transformations` | Scaling, power transforms, and encoding |
| `/api/v1/feature-engineering` | `feature_engineering` | Feature generation and interactions |
| `/api/v1/feature-selection` | `feature_selection` | Feature importance and correlation filtering |
| `/api/v1/visualization` | `visualization` | Chart datasets and distribution data |
| `/api/v1/validation` | `validation` | Schema assertions and data drift checks |
| `/api/v1/export` | `export` | Dataset and reproducible python code export |
| `/api/v1/education` | `education` | Concept glossary and explanation templates |
| `/api/v1/chatbot` | `chatbot` & `rag` | Interactive pedagogical AI mentoring |
