"""AIMentor Engine: Semantic & Hierarchical Document Chunking.
Uses LangChain RecursiveCharacterTextSplitter for AST and Markdown chunking with metadata tagging.
"""
try:
    from app.engines.menti_ai.rag.ingestion.chunker import DocumentChunker
except ImportError:
    from backend.app.rag.ingestion.chunker import DocumentChunker

Chunker = DocumentChunker

__all__ = ["DocumentChunker", "Chunker"]
