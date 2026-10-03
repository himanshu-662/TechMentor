"""Menti.ai Socratic Engine: Zero-Fabrication Pedagogical Prompt Builder.
Synthesizes Socratic prompts incorporating live dataset moments, active ML model weights,
and mathematical proofs to guarantee zero hallucination.
"""
from typing import Optional, Dict, Any, List
from langchain_core.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
    PromptTemplate
)
from app.engines.menti_ai.rag.models.rag_models import QueryTypeEnum


class PromptBuilder:
    """Constructs grounded system and user prompts for educational Socratic Q&A with LangChain."""

    SYSTEM_PROMPT_TEMPLATE = """You are Menti.ai, the DataMentor AI Pedagogical Tutor & Mathematical Prover of TechMentor.
You are an intelligent, transparent, and structured guide for machine learning, data preparation, and statistics.

CORE INSTRUCTIONS:
1. Ground your knowledge-base answers primarily in the RETRIEVED KNOWLEDGE SOURCES provided below.
2. Do not state facts, citations, or formulas that are not supported by the retrieved context or established statistical laws.
3. If the retrieved knowledge is missing or insufficient to answer the question reliably, explicitly state:
   "I couldn't find enough relevant information in the TechMentor knowledge base to answer this reliably."
4. Never fabricate citations, metrics, moments, or hallucinate non-existent dataset records.
5. Provide a STRUCTURED pedagogical response organized with clear Markdown headers:
   - ### Direct Answer (1-2 clear, intuitive sentences)
   - ### Key Concepts & Formulas (bullet-point breakdown of core definitions, math formulas in LaTeX $...$, or theoretical principles)
   - ### Practical Guidance & Code Example (actionable rules of thumb, pitfalls, and a short runnable Python snippet if applicable)
   - ### Active Dataset Application (if active user dataset context is provided, explain the concrete connection with actual moments)
   - ### Suggested Next Questions (2-3 short bullet-pointed Socratic follow-up questions for the learner to explore next)
6. Adopt an encouraging, crystal-clear, intellectually rigorous Socratic tone.
7. Use Markdown formatting (headers, bold text, bullet points, LaTeX math like $E[X]$, and code blocks) for high readability.
"""

    USER_PROMPT_TEMPLATE = """{dataset_section}

{rag_section}

### USER QUESTION ({query_type}):
{question}"""

    @classmethod
    def get_langchain_chat_prompt(cls) -> ChatPromptTemplate:
        """Return a LangChain ChatPromptTemplate instance."""
        return ChatPromptTemplate.from_messages([
            ("system", cls.SYSTEM_PROMPT_TEMPLATE),
            ("human", cls.USER_PROMPT_TEMPLATE)
        ])

    @classmethod
    def build_prompt(
        cls,
        question: str,
        rag_context: str,
        dataset_context: str = "",
        query_type: QueryTypeEnum = QueryTypeEnum.GENERAL_KNOWLEDGE
    ) -> Dict[str, str]:
        """Construct system and user messages using LangChain templates."""
        dataset_section = (
            f"### ACTIVE USER PIPELINE CONTEXT:\n{dataset_context}"
            if dataset_context
            else ""
        )
        rag_section = (
            f"### RETRIEVED KNOWLEDGE SOURCES:\n{rag_context}"
            if rag_context
            else ""
        )

        prompt_template = cls.get_langchain_chat_prompt()
        formatted_messages = prompt_template.format_messages(
            dataset_section=dataset_section,
            rag_section=rag_section,
            query_type=query_type.value,
            question=question
        )

        return {
            "system_prompt": formatted_messages[0].content,
            "user_prompt": formatted_messages[1].content
        }


__all__ = ["PromptBuilder"]
