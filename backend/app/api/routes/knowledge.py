"""API Router for Knowledge Documents Management and Ingestion."""
from typing import Optional, List
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query, status
from pydantic import BaseModel

from app.engines.menti_ai.rag.models.rag_models import (
    KnowledgeDocument,
    KnowledgeChunk,
    DocumentStatus,
    DocumentCategory,
    DocumentUploadResponse,
    DocumentDetailResponse,
    DocumentListResponse,
    RAGSearchRequest,
    RAGSearchResponse,
    RetrievalBenchmarkResponse
)
from app.services.rag_service import rag_service

router = APIRouter(prefix="/knowledge", tags=["Knowledge Base"])


class TextDocumentUploadRequest(BaseModel):
    title: str
    text: str
    category: str = DocumentCategory.GENERAL.value
    subcategory: Optional[str] = None
    description: str = ""
    source_reference: Optional[str] = None


@router.get("/documents", response_model=DocumentListResponse, summary="List Knowledge Documents")
async def list_documents(
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[DocumentStatus] = Query(None, description="Filter by status")
):
    """Retrieve all ingested knowledge documents."""
    docs = rag_service.list_documents(category=category, status=status)
    stats = rag_service.get_stats()
    return DocumentListResponse(
        total_documents=stats["total_documents"],
        active_documents=stats["active_documents"],
        total_chunks=stats["total_chunks"],
        categories=stats["categories"],
        documents=docs
    )


@router.post("/documents", response_model=DocumentUploadResponse, summary="Upload & Ingest Document")
async def upload_document(
    file: Optional[UploadFile] = File(None),
    title: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    subcategory: Optional[str] = Form(None),
    description: Optional[str] = Form(""),
    source_reference: Optional[str] = Form(None)
):
    """Upload and ingest a document file (Markdown, TXT, PDF, HTML, JSON)."""
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File upload is required."
        )

    try:
        content_bytes = await file.read()
        doc, chunks, msg = rag_service.ingest_document(
            content_bytes=content_bytes,
            filename=file.filename or "document.txt",
            title=title,
            category=category,
            subcategory=subcategory,
            description=description or "",
            source_reference=source_reference
        )
        return DocumentUploadResponse(
            document_id=doc.document_id,
            title=doc.title,
            category=doc.category,
            version=doc.version,
            chunk_count=len(chunks),
            status=doc.status,
            message=msg
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Document ingestion failed: {str(e)}"
        )


@router.post("/documents/text", response_model=DocumentUploadResponse, summary="Ingest Raw Text Document")
async def ingest_text_document(payload: TextDocumentUploadRequest):
    """Ingest a knowledge document directly from raw text content."""
    try:
        content_bytes = payload.text.encode("utf-8")
        doc, chunks, msg = rag_service.ingest_document(
            content_bytes=content_bytes,
            filename=f"{payload.title.replace(' ', '_').lower()}.md",
            title=payload.title,
            category=payload.category,
            subcategory=payload.subcategory,
            description=payload.description,
            source_reference=payload.source_reference
        )
        return DocumentUploadResponse(
            document_id=doc.document_id,
            title=doc.title,
            category=doc.category,
            version=doc.version,
            chunk_count=len(chunks),
            status=doc.status,
            message=msg
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Text document ingestion failed: {str(e)}"
        )


@router.get("/documents/{document_id}", response_model=DocumentDetailResponse, summary="Get Document Details")
async def get_document(document_id: str):
    """Retrieve document metadata and all associated semantic chunks."""
    doc = rag_service.get_document(document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found."
        )
    chunks = rag_service.get_document_chunks(document_id)
    return DocumentDetailResponse(document=doc, chunks=chunks)


@router.get("/documents/{document_id}/chunks", response_model=List[KnowledgeChunk], summary="Get Document Chunks")
async def get_document_chunks(document_id: str):
    """Retrieve all semantic chunks for a given document ID."""
    doc = rag_service.get_document(document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found."
        )
    return rag_service.get_document_chunks(document_id)


@router.post("/documents/{document_id}/index", summary="Index Document")
@router.post("/documents/{document_id}/reindex", summary="Re-index Document")
async def reindex_document(document_id: str):
    """Re-index an existing document and bump its version."""
    try:
        doc, chunks, msg = rag_service.reindex_document(document_id)
        return {
            "document_id": doc.document_id,
            "version": doc.version,
            "chunk_count": len(chunks),
            "status": doc.status,
            "message": msg
        }
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Document '{document_id}' not found.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/documents/{document_id}/activate", summary="Activate Document")
async def activate_document(document_id: str):
    """Activate an archived or draft document for retrieval."""
    try:
        doc = rag_service.set_document_status(document_id, DocumentStatus.ACTIVE)
        return {"document_id": doc.document_id, "status": doc.status, "message": "Document activated."}
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Document '{document_id}' not found.")


@router.post("/documents/{document_id}/archive", summary="Archive Document")
async def archive_document(document_id: str):
    """Archive a document so its chunks are excluded from standard search."""
    try:
        doc = rag_service.set_document_status(document_id, DocumentStatus.ARCHIVED)
        return {"document_id": doc.document_id, "status": doc.status, "message": "Document archived."}
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Document '{document_id}' not found.")


@router.delete("/documents/{document_id}", summary="Delete Document")
async def delete_document(document_id: str):
    """Permanently delete a document and all indexed vectors/keywords."""
    success = rag_service.delete_document(document_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Document '{document_id}' not found.")
    return {"document_id": document_id, "deleted": True, "message": "Document and index deleted."}


@router.post("/search", response_model=RAGSearchResponse, summary="Search Knowledge Base")
async def search_knowledge(payload: RAGSearchRequest):
    """Perform semantic, keyword, or hybrid search across the active knowledge base."""
    return rag_service.search(payload)


@router.get("/benchmark", response_model=RetrievalBenchmarkResponse, summary="Run Retrieval Benchmark")
async def run_benchmark(
    k: int = Query(5, ge=1, le=10),
    method: str = Query("hybrid", description="retrieval method: 'hybrid', 'semantic', 'keyword'")
):
    """Execute standard evaluation queries and return Recall@K, Precision@K, and MRR metrics."""
    return rag_service.run_benchmark(k=k, retrieval_method=method)


@router.get("/stats", summary="Knowledge Base Stats")
async def get_stats():
    """Retrieve total document counts, chunk counts, and categories."""
    return rag_service.get_stats()
