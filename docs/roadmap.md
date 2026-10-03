# DataMentor AI — Development Roadmap

This document outlines the phased development plan for the 12 core platform capabilities of DataMentor AI.

---

## Current Status: Phase 0 — Foundation & Architecture (Completed)

- [x] Initial monorepo project structure (`frontend/`, `backend/`, `docs/`)
- [x] FastAPI backend application with health-check endpoint (`/health`, `/api/v1/health`)
- [x] Modern responsive React + Vite + Tailwind CSS dashboard shell
- [x] Standardized `OperationExplanation` schema modeling the 7 Explainability Pillars
- [x] Modular service package stubs for all future capabilities
- [x] Architectural documentation and development roadmap

---

## Phase 1 — Dataset Ingestion & Profiling Engine

### Capabilities Addressed:
- **1. Dataset Ingestion**
- **2. Dataset Profiling**

### Backend Goals (`app/services/ingestion/`, `app/services/profiling/`):
- Implement multi-format data parser (CSV, Parquet, Excel, JSON).
- Implement statistical profiling engine (data type inference, summary statistics, missingness rate, skewness, cardinality).
- Build the initial `OperationExplanation` generator for profiling insights.

### Frontend Goals (`frontend/src/pages/DatasetsPage.jsx`, `frontend/src/pages/PipelineModulePage.jsx`):
- Drag-and-drop file upload with live progress and parsing feedback.
- Interactive data table and column overview cards.

---

## Phase 2 — Data Cleaning, Missing Values & Versioning (Completed)

### Capabilities Addressed:
- [x] **3. Data Cleaning & Diagnostics**
- [x] **4. Missing-Value Imputation (Mean, Median, Mode, Constant, Drop)**
- [x] **5. Duplicate Detection & Removal**
- [x] **Version Snapshots & Single-Click Undo Engine**

---

## Phase 6 — Outlier Detection & Treatment Engine (Completed)

### Capabilities Addressed:
- [x] **IQR (Tukey's Method) with Configurable Multiplier**
- [x] **Parametric Z-Score with Zero-Variance Guards**
- [x] **Modified Z-Score (Iglewicz & Hoaglin) with Safe MAD/MeanAD Fallback**
- [x] **Distribution-Aware Method Recommendations (Skewness Analysis)**
- [x] **Step-by-Step Educational Mathematics Breakdown with Real Dataset Values**
- [x] **Interactive SVG Box-and-Whisker Plots & Frequency Distribution Histograms**
- [x] **Safe Treatments: Keep (Flag), Remove (Drop), Cap (Winsorization), and Custom Bounds**
- [x] **Non-Destructive Simulation Preview & Mandatory Confirmation Workflow**
- [x] **Dataset Versioning & Rollback Integration**

---

## Phase 7 — Data Transformation Engine (Completed)

### Capabilities Addressed:
- [x] **Standardization (StandardScaler)** with Zero-Variance Constant Safety
- [x] **Min-Max Scaling (MinMaxScaler)** with Configurable Feature Range and Zero-Range Safety
- [x] **Robust Scaling (RobustScaler)** with Median and IQR
- [x] **Logarithmic Transformation (Log1p)** with Negative Domain Rejection
- [x] **Yeo-Johnson Power Transformation** (Positive, Zero, and Negative Support via MLE)
- [x] **Box-Cox Power Transformation** (Strictly Positive $x > 0$ Validation)
- [x] **Deterministic Transformation Recommendation Engine**
- [x] **11 New Educational Concepts & Live Formula Breakdown with Real Numbers**
- [x] **Interactive SVG Histograms & Box Plots Comparison Overlay**
- [x] **Non-Destructive Simulation Preview & Mandatory Confirmation Workflow**
- [x] **Immutable Version Snapshots & Single-Click Undo Engine**

---

## Phase 8 — Categorical Encoding & Feature Engineering (Next)

---

## Phase 4 — Data Visualization, Validation & Export

### Capabilities Addressed:
- **10. Data Visualization**
- **11. Dataset Validation**
- **12. Export of Processed Datasets**

### Backend Goals (`app/services/visualization/`, `app/services/validation/`, `app/services/export/`):
- Chart data generators: Histograms, KDEs, Box plots, Scatter plots.
- Validation engine: Schema validation, range constraints, drift tests.
- Export formats: Cleaned dataset files (CSV, Parquet) + reproducible scikit-learn / pandas Python script generation.

### Frontend Goals:
- Interactive chart dashboard.
- Export modal with code preview and one-click copy.

---

## Phase 5 — AI-Powered Educational Chatbot & RAG Knowledge Base

### Capabilities Addressed:
- **AI-Powered Educational Chatbot**
- **RAG Knowledge Base & Context Grounding**

### Backend Goals (`app/services/chatbot/`, `app/services/rag/`):
- Integration with LLM provider using structured prompt chains.
- Vector database indexing curated data science concepts and scikit-learn documentation.
- Context injection injecting current dataset statistics and `OperationExplanation` payloads into LLM context.

### Frontend Goals:
- Collapsible AI mentor assistant drawer accessible from any pipeline step.
- Follow-up question prompts (e.g. *"Why is KNN imputation slower than median?"*).
