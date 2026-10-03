# LangChain Fundamentals and Advanced RAG Architectures

## Overview of LangChain
LangChain is an open-source framework designed to simplify the construction of applications powered by Large Language Models (LLMs). It provides standardized modular abstractions to chain together components such as prompts, models, vector stores, memory systems, and tools.

## Core LangChain Primitives

### 1. Prompts and PromptTemplates
- **PromptTemplate**: Formats dynamic user inputs and variables into reproducible instructions for LLMs.
- **ChatPromptTemplate**: Structures conversations into clear message roles (`system`, `human`, `ai`).
- **FewShotPromptTemplate**: Injects illustrative demonstration examples directly into the prompt to guide complex reasoning.

### 2. LCEL (LangChain Expression Language)
LCEL is a declarative orchestration protocol utilizing unix-pipe syntax (`|`) to compose chains with built-in streaming, batching, asynchronous execution, and fallback handling:
```python
chain = prompt | model | StrOutputParser()
response = chain.invoke({"topic": "Data Cleaning"})
```

## LangChain RAG (Retrieval-Augmented Generation) Pipeline

```text
Documents ──> DocumentLoader ──> TextSplitter ──> Embeddings ──> VectorStore
                                                                    │
User Query ──> Retriever ──> Retrieved Chunks ──> LLM Context ──> Grounded Answer
```

### 1. Document Loaders
Extract raw text and rich metadata from disparate storage formats (e.g. `PyPDFLoader`, `CSVLoader`, `UnstructuredHTMLLoader`, `TextLoader`).

### 2. Text Splitters & Chunking
- **RecursiveCharacterTextSplitter**: Recursively splits text on natural boundaries `["\n\n", "\n", " ", ""]` to preserve semantic cohesion while staying within chunk token limits.
- **TokenTextSplitter**: Splits text strictly based on model tokenizer tokens.
- **ParentDocumentRetriever**: Stores small chunks for accurate vector retrieval, but retrieves larger parent documents or full sections to provide richer context to the LLM.

### 3. Vector Stores and Retrievers
- **Vector Stores**: FAISS (in-memory index), ChromaDB (persisted embedded storage), Pinecone, and Qdrant.
- **EnsembleRetriever**: Implements Reciprocal Rank Fusion (RRF) combining dense semantic search and sparse BM25 keyword search.
- **MultiQueryRetriever**: Generates multiple variant formulations of the user's question using an LLM to overcome lexical and phrasing limitations.
- **ContextualCompressionRetriever**: Extracts only the query-relevant sentences from retrieved passages before passing them to the final context window.

## Memory and State Management
- **ConversationBufferMemory**: Retains the entire raw message history.
- **ConversationSummaryMemory**: Summarizes earlier dialogue turns using an LLM to conserve context window budgets across long interactions.

## Agents and Tools
- **ReAct (Reasoning + Acting)**: An agentic loop where the LLM iteratively reasons about the user's intent, selects an external tool (e.g. SQL Database, Calculator, Python REPL), executes the tool, observes output, and formulates the final answer.
- **Tool Calling**: Native JSON schema bindings allowing LLMs to invoke verified backend functions deterministically.

## RAG Triad and Evaluation Metrics
1. **Context Relevance (Precision)**: Is the retrieved context focused and free of distracting noise?
2. **Groundedness (Faithfulness)**: Is every factual claim in the generated answer strictly supported by the retrieved context?
3. **Answer Relevance**: Does the final response directly address the user's original question?
