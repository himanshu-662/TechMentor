"""Education API routes providing educational concepts and contextual explanations."""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status

from app.engines.menti_ai.education.models import (
    EducationalConcept,
    ContextualExplanationRequest,
    ContextualExplanationResponse,
)
from app.engines.menti_ai.education.concept_registry import concept_registry
from app.engines.menti_ai.education.explanation_service import explanation_service

router = APIRouter(prefix="/education", tags=["Education & Explanation Engine"])


@router.get(
    "/concepts",
    response_model=List[EducationalConcept],
    status_code=status.HTTP_200_OK,
    summary="List all educational concepts",
    description="Retrieve catalog of deterministic educational concepts with optional category and search filtering."
)
async def list_concepts(
    category: Optional[str] = Query(default=None, description="Category filter (data_fundamentals, data_quality, data_types, statistics, advanced)"),
    search: Optional[str] = Query(default=None, description="Search query across concept title, keywords, and description")
) -> List[EducationalConcept]:
    return concept_registry.list_concepts(category=category, search=search)


@router.get(
    "/concepts/{concept_id}",
    response_model=EducationalConcept,
    status_code=status.HTTP_200_OK,
    summary="Get single educational concept by ID",
    description="Returns complete structured pedagogical definition, 3-tier levels, real-world examples, and knowledge check."
)
async def get_concept(concept_id: str) -> EducationalConcept:
    concept = concept_registry.get_concept(concept_id)
    if not concept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Concept '{concept_id}' not found in educational registry."
        )
    return concept


@router.post(
    "/explain",
    response_model=ContextualExplanationResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate contextual explanation with real dataset evidence",
    description="Combines theoretical knowledge with actual non-fabricated dataset metrics, selected explanation level, and pipeline next steps."
)
async def explain_concept(payload: ContextualExplanationRequest) -> ContextualExplanationResponse:
    return explanation_service.explain(payload)
