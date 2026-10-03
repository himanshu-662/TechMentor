from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ConceptExample(BaseModel):
    """Concrete example illustrating a data concept with optional tabular data."""
    title: str = Field(description="Example title or context")
    description: str = Field(description="Explanation of the scenario")
    table_headers: Optional[List[str]] = Field(default=None, description="Column headers for mini example table")
    table_rows: Optional[List[List[str]]] = Field(default=None, description="Row values for mini example table")
    takeaway: str = Field(description="Key lesson or observation from this example")


class ConceptKnowledgeCheck(BaseModel):
    """Multiple-choice quiz question assessing understanding of the concept."""
    check_id: str = Field(description="Unique question identifier")
    question: str = Field(description="Question prompt")
    options: List[str] = Field(description="List of possible answer choices")
    correct_option_index: int = Field(description="0-indexed position of the correct answer")
    explanation: str = Field(description="Educational explanation of why this answer is correct")


class EducationalConcept(BaseModel):
    """Comprehensive structured domain model for a data concept across 3 learning tiers."""
    concept_id: str = Field(description="Unique canonical identifier (e.g. missing_values, median)")
    category: str = Field(
        description="Grouping category (data_fundamentals, data_quality, data_types, statistics, advanced)"
    )
    title: str = Field(description="Human-readable concept title")
    short_definition: str = Field(description="Concise 1-2 sentence core definition")

    # 3 Learning Levels
    beginner_explanation: str = Field(
        description="Intuitive, jargon-free explanation using everyday analogies"
    )
    intermediate_explanation: str = Field(
        description="Standard data science vocabulary and operational intuition"
    )
    technical_explanation: str = Field(
        description="Mathematical formulation, algorithmic properties, and computational nuances"
    )

    why_it_matters: str = Field(description="Why this concept is critical in the data preparation workflow")
    real_world_example: ConceptExample = Field(description="Illustrative example with concrete data")
    ml_impact: str = Field(description="Direct consequences on machine learning model behavior and performance")
    common_methods: List[str] = Field(
        default_factory=list,
        description="Standard techniques or functions used to compute or handle this concept"
    )
    when_to_use: str = Field(description="Conditions under which this technique/metric is preferred")
    when_not_to_use: str = Field(description="Scenarios where an alternative approach should be chosen")
    common_mistakes: List[str] = Field(
        default_factory=list,
        description="Frequent misconceptions or traps beginners encounter"
    )
    interview_tip: str = Field(description="Practical tip for data science technical interviews")
    related_concepts: List[str] = Field(
        default_factory=list,
        description="Cross-referencing concept IDs for hyperlinked exploration"
    )
    knowledge_check: Optional[ConceptKnowledgeCheck] = Field(
        default=None,
        description="Self-assessment question"
    )


class ContextualExplanationRequest(BaseModel):
    """Payload to request a contextual explanation grounded in active dataset profiling."""
    concept_id: str = Field(description="Concept to explain")
    dataset_id: Optional[str] = Field(default=None, description="Optional ID of active dataset for evidence")
    column: Optional[str] = Field(default=None, description="Optional target column name")
    level: str = Field(default="beginner", description="Explanation level: beginner, intermediate, or technical")


class DatasetEvidence(BaseModel):
    """Grounded dataset metrics extracted from actual profiling results without fabrication."""
    column: Optional[str] = None
    metrics: Dict[str, Any] = Field(default_factory=dict)
    summary_statement: str = Field(description="Human-readable summary of the exact dataset values")


class ContextualExplanationResponse(BaseModel):
    """Contextual explanation combining general educational theory with real dataset diagnostics."""
    concept_id: str
    title: str
    level: str
    selected_explanation: str
    dataset_evidence: Optional[DatasetEvidence] = None
    why_it_matters: str
    next_step: str
    related_concepts: List[str] = Field(default_factory=list)
    knowledge_check: Optional[ConceptKnowledgeCheck] = None
