"""DataMentor Deterministic Machine Learning & Preprocessing Engines.

Provides direct access to all 13 pipeline stage computation engines:
- IngestionEngine: Step 01 & 02 ingestion, hashing, parsing & type inference
- ProfilingEngine: Step 03 EDA, 1st–4th central moments, distribution profiling & issue detection
- CleaningEngine: Step 04 missing value imputation, deduplication & constant pruning
- OutlierEngine: Step 05 IQR, Z-Score, Modified Z-Score detection & treatments
- EncodingEngine: Step 06 One-Hot, Ordinal, Label & Frequency encoding
- ScalingEngine: Step 07 StandardScaler, MinMaxScaler, RobustScaler & Power transforms
- DimensionalityEngine: Step 08 PCA, SVD, scree plots & variance ratios
- SelectionEngine: Step 09 SelectKBest, ANOVA F-test & Mutual Information
- SplitEngine: Step 10 Stratified & random train-test splitting without data leakage
- ModelingEngine: Step 11–13 Model fitting (12+ algorithms), What-If prediction & evaluation
"""

from app.engines.datamentor.ingestion_engine import IngestionEngine
from app.engines.datamentor.profiling_engine import ProfilingEngine
from app.engines.datamentor.cleaning_engine import CleaningEngine, execute_cleaning_pipeline
from app.engines.datamentor.outliers_engine import OutlierEngine, outlier_engine
from app.engines.datamentor.encoding_engine import EncodingEngine
from app.engines.datamentor.scaling_engine import ScalingEngine
from app.engines.datamentor.dimensionality_engine import DimensionalityEngine
from app.engines.datamentor.selection_engine import SelectionEngine, FeatureSelectionEngine
from app.engines.datamentor.split_engine import SplitEngine
from app.engines.datamentor.modeling_engine import ModelingEngine

try:
    from app.engines.datamentor.education.concept_registry import concept_registry, ConceptRegistry
    from app.engines.datamentor.education.explanation_service import ExplanationService, explanation_service
    from app.engines.datamentor import education
except ImportError:
    pass

__all__ = [
    "IngestionEngine",
    "ProfilingEngine",
    "CleaningEngine",
    "execute_cleaning_pipeline",
    "OutlierEngine",
    "outlier_engine",
    "EncodingEngine",
    "ScalingEngine",
    "DimensionalityEngine",
    "SelectionEngine",
    "FeatureSelectionEngine",
    "SplitEngine",
    "ModelingEngine",
    "concept_registry",
    "ConceptRegistry",
    "ExplanationService",
    "explanation_service",
    "education",
]
