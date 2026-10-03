from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class AlternativeTechnique(BaseModel):
    """Schema representing an alternative technique for an operation."""
    name: str = Field(description="Name of the alternative method")
    description: str = Field(description="Brief explanation of the alternative method")
    pros: List[str] = Field(default_factory=list, description="Advantages of this alternative")
    cons: List[str] = Field(default_factory=list, description="Trade-offs or disadvantages")
    best_used_when: str = Field(description="Conditions under which this alternative is preferred")


class OperationExplanation(BaseModel):
    """
    Foundational Explainability Schema for DataMentor AI.
    
    Every automated operation in the platform yields an explanation conforming
    to this standard to ensure complete transparency for learners:
    - What happened?
    - Why did it happen?
    - Which technique was used?
    - Why was that technique selected?
    - What changed?
    - What alternatives exist?
    - When should this technique be used?
    """
    operation_id: str = Field(description="Unique identifier of the operation")
    module_name: str = Field(description="Module name (e.g., cleaning, outliers, transformations)")
    
    # 1. What happened?
    what_happened: str = Field(
        description="Clear, beginner-friendly summary of what transformation or analysis occurred"
    )
    
    # 2. Why did it happen?
    why_it_happened: str = Field(
        description="The dataset diagnosis or trigger that prompted this action"
    )
    
    # 3. Which technique was used?
    technique_used: str = Field(
        description="Formal name of the mathematical/statistical or algorithmic technique"
    )
    
    # 4. Why was that technique selected?
    selection_rationale: str = Field(
        description="Reasoning behind selecting this specific technique over others"
    )
    
    # 5. What changed?
    metrics_before: Dict[str, Any] = Field(
        default_factory=dict,
        description="Dataset metrics prior to the operation"
    )
    metrics_after: Dict[str, Any] = Field(
        default_factory=dict,
        description="Dataset metrics following the operation"
    )
    impact_summary: str = Field(
        description="Concise description of the rows, columns, or distribution changes"
    )
    
    # 6. What alternatives exist?
    alternatives: List[AlternativeTechnique] = Field(
        default_factory=list,
        description="Alternative methods that could have been applied"
    )
    
    # 7. When should this technique be used?
    when_to_use: str = Field(
        description="General rule of thumb and guidelines for when data scientists choose this approach"
    )
    
    # Pedagogical concept anchor
    learning_concept_tag: Optional[str] = Field(
        default=None,
        description="Reference key for related learning modules or glossary definitions"
    )
