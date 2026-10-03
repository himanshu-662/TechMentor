# TechMentor — Comprehensive REST API Reference

> **API Gateway:** FastAPI mounted at `/api/v1` and with clean routes at `/api`. Interactive OpenAPI documentation available at `http://127.0.0.1:8000/docs`.

---

## 1. System & Health Endpoints

### 1.1 Root Health Check
- **Endpoint:** `GET /health` or `GET /api/health`
- **Response:**
```json
{
  "status": "healthy",
  "app_name": "TechMentor / DataMentor AI",
  "version": "1.0.0",
  "environment": "development",
  "timestamp": "2026-10-03T06:30:00Z"
}
```

---

## 2. Dataset Management & Ingestion (`/api/datasets`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/datasets/upload` | Ingest CSV or Excel dataset, calculate hash & initial moments |
| `GET` | `/api/datasets` | List all uploaded and active datasets |
| `GET` | `/api/datasets/{id}/summary` | Retrieve comprehensive statistical moments (1st–4th), types, and null counts |
| `GET` | `/api/datasets/{id}/preview` | Fetch tabular slice ($N$ rows) with column data types |
| `DELETE` | `/api/datasets/{id}` | Purge dataset and associated cached snapshots from disk |

---

## 3. Data Cleaning & Imputation (`/api/cleaning`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/cleaning/impute` | Apply deterministic imputation (`mean`, `median`, `mode`, `constant`, `knn`) |
| `POST` | `/api/cleaning/deduplicate` | Identify and remove duplicate rows |
| `POST` | `/api/cleaning/drop-columns` | Drop redundant, sparse, or identifier columns |

---

## 4. Outlier Detection & Treatment (`/api/outliers`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/outliers/detect` | Identify anomalies using `iqr`, `z_score`, or `modified_z_score` |
| `POST` | `/api/outliers/treat` | Apply `winsorize` (capping) or `trim` (row removal) to detected outliers |

---

## 5. Categorical Encoding (`/api/encoding`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/encoding/apply` | Apply `one_hot`, `ordinal`, `frequency`, or `target` encoding |

---

## 6. Feature Scaling & Transformations (`/api/transformations`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/transformations/apply` | Apply `standard`, `minmax`, `robust`, `log1p`, `box_cox`, or `yeo_johnson` |

---

## 7. Dimensionality Reduction (`/api/dimensionality`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/dimensionality/pca` | Fit PCA, extract eigenvalues, eigenvectors, and explained variance ratio |

---

## 8. Feature Selection (`/api/feature-selection`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/feature-selection/apply` | Select top $k$ features using `anova_f`, `mutual_info`, or `variance_threshold` |

---

## 9. Train-Test Partitioning (`/api/split`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/split/apply` | Partition into train/test subsets with stratified or random sampling |

---

## 10. Model Fitting, Predictions & Evaluation (`/api/modeling`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/modeling/train` | Train `linear_regression` or `logistic_regression` model & extract weights |
| `POST` | `/api/modeling/predict` | Real-time what-if inference on arbitrary input feature vectors |
| `POST` | `/api/modeling/evaluate` | Compute confusion matrix, ROC-AUC, $R^2$, RMSE, MAE, and accuracy |

---

## 11. Knowledge & RAG Retrieval (`/api/rag` & `/api/knowledge`)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/knowledge/documents` | List indexed ML curriculum Markdown documents |
| `POST` | `/api/knowledge/search` | Execute hybrid search (BM25 + Dense) with RRF re-ranking |
| `POST` | `/api/rag/ask` | Socratic query routing with zero-fabrication prompt synthesis |
