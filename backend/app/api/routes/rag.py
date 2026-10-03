"""API Router for RAG AI Learning Assistant."""
from fastapi import APIRouter, HTTPException, status
from app.engines.menti_ai.rag.models.rag_models import (
    RAGAskRequest,
    RAGAskResponse,
    RAGSearchRequest,
    RAGSearchResponse
)
from app.services.rag_service import rag_service

router = APIRouter(prefix="/rag", tags=["RAG Learning Assistant"])


@router.post("/ask", response_model=RAGAskResponse, summary="Ask AI Mentor with Grounded RAG")
async def ask_mentor(payload: RAGAskRequest):
    """Generate a source-grounded educational answer using the DataMentor Knowledge Base.
    Combines general knowledge with user-specific dataset/pipeline context when dataset_id is provided.
    """
    if not payload.question or not payload.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question parameter cannot be empty."
        )

    try:
        response = rag_service.ask(payload)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"RAG Assistant encountered an issue: {str(e)}"
        )


@router.post("/search", response_model=RAGSearchResponse, summary="RAG Retrieval Search")
async def rag_search(payload: RAGSearchRequest):
    """Execute hybrid retrieval across indexed knowledge chunks."""
    return rag_service.search(payload)


@router.get("/status", summary="RAG System Status & Health")
async def rag_status():
    """Retrieve vector store health, BM25 indexing status, and active embedding provider info."""
    stats = rag_service.get_stats()
    health = rag_service.vector_store.health_check()
    return {
        "status": "online",
        "provider": rag_service.embedding_provider.provider_name,
        "embedding_dimensions": rag_service.embedding_provider.dimension,
        "vector_store": health,
        "knowledge_stats": stats
    }
