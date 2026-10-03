# TechMentor — Comprehensive System Architecture

> **Platform Mission:** Demystify the black-box of modern Data Science, Machine Learning, and Artificial Intelligence through first-principles engineering, deterministic mathematical workflows, grounded RAG pipelines, and Socratic pedagogy.

---

## 1. High-Level Ecosystem Topology

TechMentor is a unified multi-tool educational and engineering platform comprising three core domains:

```
                                  ┌───────────────────────────┐
                                  │   TechMentor (Platform)   │
                                  │   Landing • Legal • Core  │
                                  └─────────────┬─────────────┘
                                                │
         ┌──────────────────────────────────────┼──────────────────────────────────────┐
         │                                      │                                      │
         ▼                                      ▼                                      ▼
┌──────────────────┐                  ┌──────────────────┐                  ┌──────────────────┐
│    DataMentor    │                  │     AIMentor     │                  │     Menti.ai     │
│ 13-Stage ML      │                  │ Grounded RAG     │                  │ Socratic AI      │
│ Preprocessing    │                  │ Pipeline Studio  │                  │ Tutoring Mentor  │
│ [Green Theme]    │                  │ [Blue Theme]     │                  │ [Purple #9333EA] │
└──────────────────┘                  └──────────────────┘                  └──────────────────┘
```

### Domain Responsibilities

1. **TechMentor (Parent Platform & Infrastructure):**
   - Central brand entry point, hero showcases, technical features, founder story, changelog, and legal policies (Privacy, Terms, Cookies, Security).
   - Unified design language with distinct visual themes for each sub-tool.
   - Shared HTTP proxies, CORS middleware, and local session management.

2. **DataMentor (Deterministic Tabular ML Studio — Green Theme):**
   - 13-stage sequential data science workflow: Ingestion $\rightarrow$ Profiling $\rightarrow$ Cleaning $\rightarrow$ Outliers $\rightarrow$ Encoding $\rightarrow$ Scaling $\rightarrow$ Dimensionality $\rightarrow$ Selection $\rightarrow$ Split $\rightarrow$ Model Fitting $\rightarrow$ What-If Prediction $\rightarrow$ Evaluation.
   - 100% deterministic mathematical execution using NumPy, SciPy, and Scikit-Learn.
   - Every operation is wrapped in the **7 Pillars of Explainability** with formulas and before/after moments.

3. **AIMentor (Grounded RAG Pipeline Studio — Blue Theme):**
   - Visual workbench for building, inspecting, and evaluating Retrieval-Augmented Generation systems.
   - AST-aware semantic chunkers, dense embeddings, sparse BM25 indexing, and Reciprocal Rank Fusion (RRF).
   - RAG Triad verification (Context Relevance, Groundedness, Answer Relevance).

4. **Menti.ai (Socratic AI Tutor & Math Prover — Purple `#9333EA` Theme):**
   - Context-aware pedagogical AI mentor integrated directly into the workspace and via floating chatbot widget.
   - Zero-fabrication prompt synthesis: Injects live in-memory dataset moments (mean, standard deviation, skewness, null counts) directly into the LLM system prompt.
   - KaTeX-rendered mathematical proofs, step-by-step guidance, and Socratic questioning.

---

## 2. System Architecture & Component Interaction

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                FRONTEND (React 18 + Vite)                             │
│                                                                                        │
│  ┌────────────────────┐   ┌────────────────────┐   ┌────────────────────────────────┐  │
│  │  TechMentor Core   │   │ DataMentor Studio  │   │  Menti.ai Workspace & Chatbot  │  │
│  │ Landing/Legal/Nav  │   │ 13 Pipeline Steps  │   │  KaTeX Proofs / Socratic Tutor │  │
│  └─────────┬──────────┘   └─────────┬──────────┘   └───────────────┬────────────────┘  │
│            │                        │                              │                   │
│            └────────────────────────┼──────────────────────────────┘                   │
│                                     ▼                                                  │
│                       Axios Service Client Layer (/api)                                │
└─────────────────────────────────────┬──────────────────────────────────────────────────┘
                                      │ HTTP / JSON (Port 5173 -> Proxy Port 8000)
                                      ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND (FastAPI / Python 3.10+)                          │
│                                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                       FastAPI Application Gateway (app.main)                     │  │
│  │       CORS Middleware • Security Bounds • Structured Logging • Pydantic V2       │  │
│  └──────────────────────────────────────────┬───────────────────────────────────────┘  │
│                                             │                                          │
│         ┌───────────────────────────────────┼───────────────────────────────────┐      │
│         ▼                                   ▼                                   ▼      │
│  ┌───────────────┐                  ┌───────────────┐                  ┌─────────────┐ │
│  │ Data API      │                  │ RAG API       │                  │ Socratic API│ │
│  │ /api/datasets │                  │ /api/rag      │                  │ /api/chat   │ │
│  │ /api/cleaning │                  │ /api/knowledge│                  │ /api/explain│ │
│  └───────┬───────┘                  └───────┬───────┘                  └──────┬──────┘ │
│          │                                  │                                 │        │
│          ▼                                  ▼                                 ▼        │
│  ┌───────────────┐                  ┌───────────────┐                  ┌─────────────┐ │
│  │ Deterministic │                  │ Hybrid Search │                  │ In-Memory   │ │
│  │ Scikit Engines│                  │ BM25 + Dense  │                  │ Live Moments│ │
│  └───────┬───────┘                  └───────┬───────┘                  └──────┬──────┘ │
│          │                                  │                                 │        │
│          └──────────────────────────────────┼─────────────────────────────────┘        │
│                                             ▼                                          │
│                              Local Storage Layer (File System)                         │
│                    storage/uploads/  •  storage/models/  •  storage/knowledge/         │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Architectural Contracts

### 3.1 Deterministic Transformation Contract
All DataMentor transformations operate strictly on immutable dataset snapshots. When an operation (such as Imputation or Power Transform) is executed:
1. The active dataset file in `storage/uploads/` is loaded into a Pandas DataFrame.
2. The transformation calculates exact statistical moments before and after the operation.
3. A new version snapshot (e.g. `dataset_v2.csv`) is written to disk.
4. An `OperationExplanation` domain object is generated with exact metrics, LaTeX formulas, and alternative trade-offs.

### 3.2 Zero-Fabrication RAG & Socratic Contract
Menti.ai strictly eliminates LLM hallucinations through a 3-layer grounding sandwich:
1. **System Prompt Constraint:** Strict instructions forbidding speculation or generating unverifiable numbers.
2. **Dynamic In-Memory Moments:** Live statistical metrics from the active Pandas DataFrame (mean, variance, skewness, missing percentages, model coefficients) are injected into the prompt context at runtime.
3. **Curated Knowledge Grounding:** Vector and BM25 search over verified scikit-learn and statistical textbooks in `storage/knowledge/`.

---

## 4. Security & Operational Boundaries

- **Local-First Privacy:** All dataset processing occurs locally on the server. No raw tabular data is transmitted to third-party endpoints.
- **File Upload Limits:** Strict 50MB file size ceiling with MIME-type and extension validation (`.csv`, `.xlsx`, `.xls`).
- **Input Sanitization:** Parameter bounds validation on all numerical inputs (e.g. $k \ge 1$ for KNN, $0 < \alpha < 1$ for significance, variance threshold $\ge 0$).
- **CORS Protection:** Explicit whitelist restricting API access to authorized frontend origin servers (`localhost:5173`, `127.0.0.1:5173`).
