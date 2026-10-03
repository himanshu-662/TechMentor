# TechMentor 🧠⚡

> **The Unified Platform for First-Principles AI & Data Engineering**  
> *Step inside the black box.* Master transparent machine learning pipelines, grounded RAG architectures, and Socratic AI tutoring.

---

## 🌐 The TechMentor Ecosystem

TechMentor unites three specialized engineering tools within a cohesive, modern workspace:

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

| Tool | Focus | Theme | Status |
|---|---|---|---|
| **DataMentor** | 13-Stage Deterministic Tabular ML Studio | **Green / Emerald** | 🟢 Production Ready |
| **AIMentor** | Grounded RAG Pipeline Workbench & RRF | **Blue / Sky** | 🟡 Workbench Preview |
| **Menti.ai** | Socratic AI Tutor & Zero-Fabrication Prover | **Purple (`#9333EA`)** | 🟢 Production Ready |

---

## 📁 Repository Structure

```
TechMentor/
├── .env                              # Local environment variables (API keys, ports)
├── .env.example                      # Template configuration for contributors
├── .gitignore                        # Git exclusion rules
├── README.md                         # Master entry point & documentation
│
├── docs/                             # Exhaustive Engineering Specifications
│   ├── ARCHITECTURE.md               # High-level architecture, contracts & data flow
│   ├── DATA_MENTOR_PIPELINE.md       # 13-stage ML pipeline specifications & mathematical proofs
│   ├── AI_MENTOR_RAG.md              # RAG pipeline specs, BM25, embeddings & RRF re-ranking
│   ├── MENTI_AI_TUTOR.md             # Socratic pedagogical framework & zero-fabrication rules
│   └── API_REFERENCE.md              # Complete REST API endpoint catalog & schemas
│
├── Prompts/                          # Prompt Engineering Catalogs & Master Prompts
│   ├── DataMentor/                   # Modules 1–16 prompts for 13-stage ML pipeline
│   ├── AIMentor/                     # Chunking, indexing & grounded retrieval prompt specs
│   └── Menti_AI/                     # Master-prompt.txt, Socratic rules & zero-fabrication guardrails
│
├── backend/                          # FastAPI Python 3.10+ Backend
│   ├── requirements.txt              # Production dependencies
│   ├── pytest.ini                    # Pytest configuration & markers
│   ├── app/
│   │   ├── main.py                   # FastAPI app factory, CORS & route mounts
│   │   ├── core/                     # App configuration & settings
│   │   ├── api/                      # REST API endpoint controllers
│   │   ├── models/                   # Pydantic Schemas & Domain DTOs
│   │   ├── profiling/                # Statistical moment calculators (1st–4th central moments)
│   │   ├── cleaning/                 # Missing value imputation & deduplication
│   │   ├── outliers/                 # IQR, Z-Score & Winsorization engines
│   │   ├── encoding/                 # One-Hot, Ordinal, Target & Frequency encoding
│   │   ├── transformations/          # StandardScaler, MinMaxScaler, RobustScaler & Power transforms
│   │   ├── dimensionality/           # PCA & explained variance ratio
│   │   ├── feature_selection/        # SelectKBest (ANOVA F-value, Mutual Information)
│   │   ├── split/                    # Stratified & random train-test partitioners
│   │   ├── modeling/                 # Model fitting, weight extraction & what-if inference
│   │   ├── education/                # 7 Explainability Pillars generator
│   │   └── rag/                      # Menti.ai RAG engine & zero-fabrication synthesizer
│   │
│   ├── storage/                      # Local isolated file system storage
│   │   ├── uploads/                  # Raw datasets & versioned snapshots (v1, v2)
│   │   ├── models/                   # Trained model artifacts (.pkl)
│   │   └── knowledge/                # Curated ML curriculum Markdown documents
│   │
│   └── tests/                        # 138+ Automated Pytest Unit & Integration Tests
│
└── frontend/                         # Vite + React + TailwindCSS Frontend
    ├── package.json
    ├── vite.config.js                # Dev server (Port 5173) + /api proxy to Port 8000
    ├── tailwind.config.js            # Design tokens & color palettes
    ├── src/
    │   ├── main.jsx                  # React DOM root entry
    │   ├── App.jsx                   # Master router & view orchestrator
    │   ├── state/                    # Global React State (WorkflowContext.jsx)
    │   ├── layouts/                  # Header, Sidebar & Studio Layouts
    │   ├── pages/                    # Landing, Dashboard, Legal & 13 Pipeline Steps
    │   ├── components/               # Modular UI Atoms, RAG KaTeX Viewers & Chatbot Popup
    │   └── services/                 # Axios API services (1-to-1 with Backend)
```

---

## ⚡ Quickstart Guide

### Prerequisites
- **Python:** `3.10` or higher
- **Node.js:** `18.0` or higher

### 1. Clone & Configure Environment
```bash
# Clone the repository
git clone https://github.com/your-org/TechMentor.git
cd TechMentor

# Create environment configuration
cp .env.example .env
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# Linux / macOS
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend development server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend runs at `http://127.0.0.1:8000` (Swagger docs at `/docs`).*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at `http://localhost:5173`.*

---

## 🧪 Testing & Validation

### Run Backend Pytest Suite
```bash
cd TechMentor
python -m pytest backend/tests -v
```
*Result: 138 unit & integration tests validating all 13 pipeline steps, RAG engines, and Socratic routers.*

### Run Frontend Production Build
```bash
cd frontend
npm run build
```
*Result: 0 errors, 0 warnings.*

---

## 📚 In-Depth Engineering Documentation

For comprehensive technical specifications, explore the `/docs` directory:
- 🏗️ [System Architecture](docs/ARCHITECTURE.md)
- 🔬 [DataMentor 13-Stage Pipeline & Mathematical Proofs](docs/DATA_MENTOR_PIPELINE.md)
- ⚡ [AIMentor Grounded RAG Pipeline](docs/AI_MENTOR_RAG.md)
- 🎓 [Menti.ai Socratic Pedagogical Framework](docs/MENTI_AI_TUTOR.md)
- 📡 [Complete REST API Reference](docs/API_REFERENCE.md)

---

## 🛡️ License & Principles
Built with first-principles engineering for researchers, students, and engineers. Zero telemetry, local-first data privacy, and 100% deterministic mathematical transparency.
