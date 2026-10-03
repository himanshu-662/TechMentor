from fastapi import APIRouter
from app.api.v1.endpoints import health
from app.api.routes.datasets import router as datasets_router
from app.api.routes.cleaning import router as cleaning_router
from app.api.routes.education import router as education_router
from app.api.routes.outliers import router as outliers_router
from app.api.routes.transformations import router as transformations_router
from app.api.routes.feature_engineering import router as feature_engineering_router
from app.api.routes.encoding import router as encoding_router, legacy_router as encoding_legacy_router
from app.api.routes.dimensionality import router as dimensionality_router
from app.api.routes.feature_selection import router as feature_selection_router
from app.api.routes.split import router as split_router, legacy_split_router
from app.api.routes.modeling import router as modeling_router, legacy_modeling_router

from app.api.routes.knowledge import router as knowledge_router
from app.api.routes.rag import router as rag_router

api_router = APIRouter()

# Core system endpoints
api_router.include_router(health.router, tags=["System"])

# Step 01 & 02: Ingestion & Loading
api_router.include_router(datasets_router)

# Step 04: Data Cleaning
api_router.include_router(cleaning_router)

# Step 05: Outlier Detection & Treatment
api_router.include_router(outliers_router)

# Step 06: Data Encoding
api_router.include_router(encoding_router)
api_router.include_router(encoding_legacy_router)

# Step 07: Feature Scaling
api_router.include_router(transformations_router)

# Feature Engineering Subsystem
api_router.include_router(feature_engineering_router)

# Step 08: Dimensionality Reduction (PCA, LDA, SVD)
api_router.include_router(dimensionality_router)

# Step 09: Feature Selection (SelectKBest)
api_router.include_router(feature_selection_router)

# Step 10: Train-Test Split
api_router.include_router(split_router)
api_router.include_router(legacy_split_router)

# Steps 11, 12, 13: Model Fitting, Prediction, and Evaluation
api_router.include_router(modeling_router)
api_router.include_router(legacy_modeling_router)

# Global Education Engine
api_router.include_router(education_router)

# Phase 16: RAG & Knowledge Base
api_router.include_router(knowledge_router)
api_router.include_router(rag_router)


