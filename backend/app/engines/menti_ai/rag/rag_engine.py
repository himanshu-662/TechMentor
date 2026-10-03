"""End-to-End RAG Engine for Phase 16 RAG Knowledge Base.
Coordinates Query Routing, LangChain Hybrid Retrieval, Reranking, LCEL Context Building, and Citations.
"""
import os
import time
from typing import Optional, Dict, Any, List
from datetime import datetime

from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

from app.core.config import settings
from app.engines.menti_ai.rag.models.rag_models import (
    RAGAskRequest,
    RAGAskResponse,
    RAGSearchRequest,
    RAGSearchResponse,
    RAGSearchResultItem,
    CitationItem,
    StructuredRAGOutput,
    QueryTypeEnum
)
from app.engines.menti_ai.rag.hybrid_retrieval import HybridRetriever
from app.engines.menti_ai.rag.reranker import Reranker
from app.engines.menti_ai.context_builder import ContextBuilder
from app.engines.menti_ai.rag.citation_builder import CitationBuilder
from app.engines.menti_ai.query_router import QueryRouter
from app.engines.menti_ai.prompt_builder import PromptBuilder
from app.engines.menti_ai.rag.retrieval import RetrievalCandidate


class RAGEngine:
    """Core RAG Engine orchestrating LangChain retrieval, query classification, structured synthesis, and citations."""

    def __init__(
        self,
        retriever: HybridRetriever,
        reranker: Optional[Reranker] = None,
        context_builder: Optional[ContextBuilder] = None
    ):
        self.retriever = retriever
        self.reranker = reranker or Reranker()
        self.context_builder = context_builder or ContextBuilder(max_chunks=5, max_context_length=4000)

    def search(self, request: RAGSearchRequest) -> RAGSearchResponse:
        """Direct search across the knowledge base."""
        candidates, latency_ms = self.retriever.retrieve(
            query=request.query,
            top_k=request.top_k,
            category=request.category,
            document_id=request.document_id,
            retrieval_method=request.retrieval_method
        )

        # Apply reranking
        reranked = self.reranker.rerank(request.query, candidates, top_k=request.top_k)

        results = [
            RAGSearchResultItem(
                chunk_id=c.chunk.chunk_id,
                document_id=c.chunk.document_id,
                title=c.chunk.title,
                section=c.chunk.section,
                category=c.chunk.category,
                score=c.score,
                semantic_score=c.semantic_score,
                keyword_score=c.keyword_score,
                text=c.chunk.text,
                source_reference=c.chunk.source_reference,
                retrieval_method=c.retrieval_method
            )
            for c in reranked
        ]

        return RAGSearchResponse(
            query=request.query,
            results=results,
            candidate_count=len(results),
            retrieval_method=request.retrieval_method,
            latency_ms=round(latency_ms, 2)
        )

    def ask(
        self,
        request: RAGAskRequest,
        dataset_summary: Optional[Dict[str, Any]] = None
    ) -> RAGAskResponse:
        """Answer a user question with retrieved knowledge and optional dataset context using LangChain."""
        start_time = time.perf_counter()

        # 1. Query Routing
        has_dataset = bool(dataset_summary)
        has_model = bool(dataset_summary and dataset_summary.get("key_metrics"))
        query_type = QueryRouter.route_query(
            request.question,
            has_dataset_context=has_dataset,
            has_model_context=has_model
        )

        # 1.1 Handle Live Prediction Queries with Trained Model (Step 12)
        if query_type == QueryTypeEnum.PREDICTION:
            from app.engines.menti_ai.rag.prediction_helper import PredictionHelper
            extracted_inputs = PredictionHelper.extract_feature_inputs(request.question)
            pred_result, err_msg = PredictionHelper.execute_live_prediction(request.dataset_id, extracted_inputs)
            if pred_result is not None:
                ans_md, structured_out, follow_ups = PredictionHelper.format_prediction_response(pred_result, request.question)
                latency_ms = (time.perf_counter() - start_time) * 1000.0
                return RAGAskResponse(
                    question=request.question,
                    answer=ans_md,
                    query_type=query_type,
                    sources=[],
                    structured_output=structured_out,
                    follow_up_questions=follow_ups,
                    dataset_id=pred_result.get("dataset_id") or request.dataset_id,
                    prediction_result=pred_result,
                    context_used={
                        "framework": "Scikit-Learn Live Inference (Step 12)",
                        "model": pred_result.get("model_type"),
                        "task_type": pred_result.get("task_type"),
                        "inputs_count": len(extracted_inputs),
                        "has_model_context": True
                    },
                    latency_ms=round(latency_ms, 2)
                )
            elif extracted_inputs and err_msg:
                # User provided input variables but no model exists yet
                latency_ms = (time.perf_counter() - start_time) * 1000.0
                summary_msg = f"I detected input variables `{extracted_inputs}`, but {err_msg}"
                structured_out = StructuredRAGOutput(
                    summary=summary_msg,
                    key_concepts=[
                        "Step 11 (Model Fitting) must be completed before Step 12 (Prediction) can run inference.",
                        "Input variables are mapped to dataset feature encodings and scaling transformations.",
                        f"Detected query variables: {', '.join([f'{k}={v}' for k, v in extracted_inputs.items()])}"
                    ],
                    practical_guidance="Navigate to Step 11: Model Fitting in the left sidebar, select your preferred algorithm (e.g. Random Forest, Logistic Regression), and click 'Fit Model'. Once fitted, ask me to predict anytime!",
                    follow_up_questions=[
                        "How do I train a model in Step 11?",
                        "What is the difference between Linear and Tree-based models?",
                        "How does feature scaling affect predictions?"
                    ]
                )
                return RAGAskResponse(
                    question=request.question,
                    answer=f"### Direct Answer\n{summary_msg}\n\n### How to Enable Live Predictions\nPlease navigate to **Step 11: Model Fitting** and train a model. Once trained, you can type queries like `predict for age=25, fare=50` or provide custom feature values, and I will execute live inference instantly using your trained model!",
                    query_type=query_type,
                    sources=[],
                    structured_output=structured_out,
                    follow_up_questions=structured_out.follow_up_questions,
                    dataset_id=request.dataset_id,
                    latency_ms=round(latency_ms, 2)
                )

        # 2. Retrieval via LangChain Hybrid Engine
        candidates, _ = self.retriever.retrieve(
            query=request.question,
            top_k=request.top_k * 2,
            category=request.category,
            retrieval_method="hybrid"
        )

        # 3. Reranking
        reranked = self.reranker.rerank(request.question, candidates, top_k=request.top_k)

        # 4. Check for Retrieval Sufficiency
        min_relevance_threshold = 0.05
        valid_candidates = [c for c in reranked if c.score >= min_relevance_threshold]

        if not valid_candidates and query_type == QueryTypeEnum.GENERAL_KNOWLEDGE:
            latency_ms = (time.perf_counter() - start_time) * 1000.0
            return RAGAskResponse(
                question=request.question,
                answer="I couldn't find enough relevant information in the DataMentor knowledge base to answer this reliably.",
                query_type=query_type,
                sources=[],
                structured_output=None,
                follow_up_questions=[],
                dataset_id=request.dataset_id,
                latency_ms=round(latency_ms, 2)
            )

        # 5. Build Contexts with Token Budgets
        rag_context_str, used_candidates = self.context_builder.build_rag_context(valid_candidates)
        dataset_context_str = self.context_builder.build_dataset_context(dataset_summary)

        # 6. Generate Citations directly from retrieved evidence
        citations = CitationBuilder.build_citations(used_candidates)

        # 7. LangChain LCEL & Grounded Synthesis
        answer, model_used = self._synthesize_answer(
            question=request.question,
            rag_context=rag_context_str,
            dataset_context=dataset_context_str,
            query_type=query_type,
            citations=citations,
            used_candidates=used_candidates,
            dataset_summary=dataset_summary
        )

        # 8. Extract Structured Breakdown & Follow-up Questions
        structured_out, follow_ups = self._extract_structured_output(
            answer=answer,
            used_candidates=used_candidates,
            dataset_summary=dataset_summary
        )

        latency_ms = (time.perf_counter() - start_time) * 1000.0
        return RAGAskResponse(
            question=request.question,
            answer=answer,
            query_type=query_type,
            sources=citations,
            structured_output=structured_out,
            follow_up_questions=follow_ups,
            dataset_id=request.dataset_id,
            context_used={
                "retrieved_chunks_count": len(used_candidates),
                "has_dataset_context": has_dataset,
                "dataset_context_length": len(dataset_context_str),
                "top_score": valid_candidates[0].score if valid_candidates else 0.0,
                "framework": "LangChain Core",
                "model": model_used
            },
            latency_ms=round(latency_ms, 2)
        )

    def _synthesize_answer(
        self,
        question: str,
        rag_context: str,
        dataset_context: str,
        query_type: QueryTypeEnum,
        citations: List[CitationItem],
        used_candidates: List[RetrievalCandidate],
        dataset_summary: Optional[Dict[str, Any]] = None
    ) -> tuple[str, str]:
        """Synthesize answer using LangChain Chat Model with Google Gemini or offline grounded synthesis."""
        gemini_api_key = settings.GEMINI_API_KEY or settings.GOOGLE_API_KEY or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY", "")
        configured_model = settings.GEMINI_MODEL or os.getenv("GEMINI_MODEL", "gemini-flash-lite-latest")
        openai_api_key = os.getenv("OPENAI_API_KEY", "")

        # 1. Primary: Google Gemini with LangChain ChatGoogleGenerativeAI
        if gemini_api_key:
            # Model candidates for automatic fallback mapping
            candidate_models = [
                configured_model,
                "gemini-flash-lite-latest",
                "gemini-2.5-flash-lite",
                "gemini-flash-latest"
            ]
            # De-duplicate while preserving order
            seen_models = set()
            unique_candidates = []
            for m in candidate_models:
                # normalize alias
                norm = "gemini-flash-lite-latest" if m == "gemini-flash-latest-lite" else m
                if norm not in seen_models:
                    seen_models.add(norm)
                    unique_candidates.append(norm)

            for model_name in unique_candidates:
                try:
                    from langchain_google_genai import ChatGoogleGenerativeAI
                    llm = ChatGoogleGenerativeAI(
                        model=model_name,
                        api_key=gemini_api_key,
                        temperature=0.2
                    )
                    prompt_template = PromptBuilder.get_langchain_chat_prompt()

                    # LCEL Chain Execution
                    chain = prompt_template | llm | StrOutputParser()
                    dataset_section = f"### ACTIVE USER PIPELINE CONTEXT:\n{dataset_context}" if dataset_context else ""
                    rag_section = f"### RETRIEVED KNOWLEDGE SOURCES:\n{rag_context}" if rag_context else ""

                    raw_ans = chain.invoke({
                        "dataset_section": dataset_section,
                        "rag_section": rag_section,
                        "query_type": query_type.value,
                        "question": question
                    })

                    if raw_ans and len(raw_ans.strip()) > 20:
                        if "### Sources" not in raw_ans and citations:
                            raw_ans += "\n\n" + CitationBuilder.format_citations_markdown(citations)
                        return raw_ans, f"google/{model_name}"
                except Exception:
                    continue

        # 2. Secondary: OpenAI if configured
        if openai_api_key:
            try:
                from langchain.chat_models import init_chat_model
                model_name = os.getenv("RAG_LLM_MODEL", "gpt-4o-mini")
                llm = init_chat_model(model_name, model_provider="openai", api_key=openai_api_key, temperature=0.3)
                prompt_template = PromptBuilder.get_langchain_chat_prompt()

                chain = prompt_template | llm | StrOutputParser()
                dataset_section = f"### ACTIVE USER PIPELINE CONTEXT:\n{dataset_context}" if dataset_context else ""
                rag_section = f"### RETRIEVED KNOWLEDGE SOURCES:\n{rag_context}" if rag_context else ""

                raw_ans = chain.invoke({
                    "dataset_section": dataset_section,
                    "rag_section": rag_section,
                    "query_type": query_type.value,
                    "question": question
                })

                if "### Sources" not in raw_ans and citations:
                    raw_ans += "\n\n" + CitationBuilder.format_citations_markdown(citations)
                return raw_ans, f"openai/{model_name}"
            except Exception:
                pass

        # 3. Deterministic Offline Grounded Pedagogical Synthesis Engine
        offline_ans = self._offline_grounded_synthesis(
            question=question,
            query_type=query_type,
            citations=citations,
            used_candidates=used_candidates,
            dataset_summary=dataset_summary
        )
        return offline_ans, "offline-grounded-synthesizer"

    def _offline_grounded_synthesis(
        self,
        question: str,
        query_type: QueryTypeEnum,
        citations: List[CitationItem],
        used_candidates: List[RetrievalCandidate],
        dataset_summary: Optional[Dict[str, Any]] = None
    ) -> str:
        """Deterministic, grounded educational response synthesized directly from retrieved knowledge chunks."""
        sections = []

        # Direct Answer & Overview based on top retrieved chunk
        if used_candidates:
            top_chunk = used_candidates[0].chunk
            sections.append("### Direct Answer")
            sections.append(f"Based on **{top_chunk.title}** ({top_chunk.section}):")
            first_sentence = top_chunk.text.split(". ")[0] + "." if ". " in top_chunk.text else top_chunk.text
            sections.append(f"{first_sentence}\n")

            sections.append("### Key Concepts & Formulas")
            sections.append(f"* **Core Topic**: {top_chunk.section} ({top_chunk.category})")
            sections.append(f"* **Retrieved Ground Truth**: {top_chunk.text}\n")

            if len(used_candidates) > 1:
                supporting_chunk = used_candidates[1].chunk
                if supporting_chunk.section != top_chunk.section:
                    sections.append(f"* **Supporting Principle ({supporting_chunk.section})**: {supporting_chunk.text}\n")

            sections.append("### Practical Guidance & Code Example")
            sections.append("Always verify feature distributions and evaluation metrics before applying irreversible transformations.\n")

        # Add Dataset Context Connection if available
        if dataset_summary:
            sections.append("### Active Dataset Application")
            if "filename" in dataset_summary:
                sections.append(f"- **Current Dataset**: `{dataset_summary.get('filename')}` ({dataset_summary.get('rows', '?')} rows, {dataset_summary.get('columns', '?')} columns)")
            if "target_column" in dataset_summary:
                sections.append(f"- **Target Variable**: `{dataset_summary.get('target_column')}`")
            if "key_metrics" in dataset_summary and isinstance(dataset_summary["key_metrics"], dict):
                metrics_text = ", ".join(f"**{k}**: {v}" for k, v in dataset_summary["key_metrics"].items())
                sections.append(f"- **Observed Model Metrics**: {metrics_text}")
            if "notes" in dataset_summary:
                sections.append(f"- **Pipeline Observation**: {dataset_summary.get('notes')}")
            sections.append("")

        # Suggested Follow-up Questions
        sections.append("### Suggested Next Questions")
        if used_candidates:
            cat = used_candidates[0].chunk.category
            sections.append(f"* How does this concept apply to real-world {cat} pipelines?")
            sections.append(f"* What are the common failure modes and diagnostic checks?")
            sections.append(f"* How do I tune the hyperparameters related to {used_candidates[0].chunk.section}?")
        else:
            sections.append("* How does train-test splitting prevent data leakage?")
            sections.append("* What is the difference between Precision and Recall?")
        sections.append("")

        # Verified Sources
        if citations:
            sections.append(CitationBuilder.format_citations_markdown(citations))

        return "\n".join(sections)

    def _extract_structured_output(
        self,
        answer: str,
        used_candidates: List[RetrievalCandidate],
        dataset_summary: Optional[Dict[str, Any]] = None
    ) -> tuple[Optional[StructuredRAGOutput], List[str]]:
        """Extract structured pedagogical fields from markdown answer."""
        import re

        summary = ""
        key_concepts = []
        practical_guidance = None
        code_example = None
        dataset_insights = None
        follow_up_questions = []

        # 1. Code example extraction
        code_match = re.search(r'```(?:python|sql|bash)?\s*(.*?)\s*```', answer, re.DOTALL)
        if code_match:
            code_example = code_match.group(1).strip()

        # 2. Follow up questions extraction
        follow_match = re.search(
            r'###\s*(?:Suggested Next Questions|Suggested Questions|Follow-up Questions).*?\n((?:[*\-\d.]+\s*.*?\n?)+)',
            answer,
            re.DOTALL | re.IGNORECASE
        )
        if follow_match:
            lines = follow_match.group(1).strip().split('\n')
            for line in lines:
                clean_q = re.sub(r'^[*\-\d.]+\s*', '', line).strip()
                if clean_q and len(clean_q) > 5 and not clean_q.startswith("###"):
                    follow_up_questions.append(clean_q)

        # Fallback default follow up questions if none extracted
        if not follow_up_questions:
            if used_candidates:
                top_c = used_candidates[0].chunk
                follow_up_questions = [
                    f"How do I diagnose issues in {top_c.section}?",
                    f"What is the mathematical formulation of {top_c.title}?",
                    "How does this impact model evaluation metrics?"
                ]
            else:
                follow_up_questions = [
                    "What is the difference between Precision and Recall?",
                    "How does StandardScaler handle outliers?",
                    "What causes overfitting in tree models?"
                ]

        # 3. Direct Answer / Summary extraction
        summary_match = re.search(r'###\s*(?:Direct Answer|Summary & Direct Answer|Overview)\s*\n+(.*?)(?=\n###|\Z)', answer, re.DOTALL)
        if summary_match:
            summary = summary_match.group(1).strip()
        else:
            # First 2 non-header sentences
            non_header_lines = [l for l in answer.split('\n') if l.strip() and not l.startswith('#') and not l.startswith('```')]
            summary = " ".join(non_header_lines[:2]) if non_header_lines else "Answer provided based on knowledge base."

        # 4. Key concepts extraction
        concepts_match = re.search(r'###\s*(?:Key Concepts & Formulas|Key Concepts|Formulas)\s*\n+(.*?)(?=\n###|\Z)', answer, re.DOTALL)
        if concepts_match:
            lines = concepts_match.group(1).strip().split('\n')
            for l in lines:
                clean_l = re.sub(r'^[*\-\d.]+\s*', '', l).strip()
                if clean_l and len(clean_l) > 3:
                    key_concepts.append(clean_l)
        if not key_concepts and used_candidates:
            key_concepts = [f"{c.chunk.title}: {c.chunk.section}" for c in used_candidates[:3]]

        # 5. Practical guidance
        guidance_match = re.search(r'###\s*(?:Practical Guidance & Code Example|Practical Guidance|Implementation)\s*\n+(.*?)(?=\n###|\Z)', answer, re.DOTALL)
        if guidance_match:
            practical_guidance = guidance_match.group(1).strip()

        # 6. Dataset insights
        ds_match = re.search(r'###\s*(?:Active Dataset Application|Dataset Application|Pipeline Context)\s*\n+(.*?)(?=\n###|\Z)', answer, re.DOTALL)
        if ds_match:
            dataset_insights = ds_match.group(1).strip()
        elif dataset_summary:
            dataset_insights = f"Relevant to active dataset with {dataset_summary.get('rows', '?')} rows."

        structured_output = StructuredRAGOutput(
            summary=summary,
            key_concepts=key_concepts[:5],
            practical_guidance=practical_guidance,
            code_example=code_example,
            dataset_insights=dataset_insights,
            follow_up_questions=follow_up_questions[:4]
        )

        return structured_output, follow_up_questions[:4]

