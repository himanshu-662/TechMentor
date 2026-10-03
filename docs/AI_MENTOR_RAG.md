# AIMentor — Grounded RAG Pipeline & Retrieval Architecture

> **Studio Mission:** A visual and inspectable workbench for engineering, benchmarking, and debugging production-grade Retrieval-Augmented Generation (RAG) pipelines.

---

## 1. RAG Pipeline Topology

```
┌─────────────────┐      ┌───────────────────────────┐      ┌───────────────────────────┐
│ Raw Data Slices │ ───► │ Semantic / AST Chunking   │ ───► │ Dual-Stream Indexing      │
│ MD, PDF, Code   │      │ Dynamic Overlap & Headers │      │ Dense Vector + Sparse BM25│
└─────────────────┘      └───────────────────────────┘      └─────────────┬─────────────┘
                                                                          │
                                                                          ▼
┌─────────────────┐      ┌───────────────────────────┐      ┌───────────────────────────┐
│ Grounding Gate  │ ◄─── │ LLM Generation            │ ◄─── │ Reciprocal Rank Fusion    │
│ RAG Triad Guard │      │ KaTeX Math + Citations    │      │ Hybrid RRF Re-ranking     │
└─────────────────┘      └───────────────────────────┘      └───────────────────────────┘
```

---

## 2. Ingestion & Semantic Chunking Engine

AIMentor implements structure-aware and AST-driven text segmentation:
1. **Markdown Header Splitters:** Preserves logical hierarchy (`#`, `##`, `###`) to ensure chunks retain topical context.
2. **Dynamic Sliding Windows:** Chunks are constructed with window size $W \in [256, 512]\text{ tokens}$ and overlap $\delta \approx 10\%-15\%$.
3. **Metadata Enrichment:** Each chunk is tagged with source document ID, section hierarchy path, token count, and domain taxonomy tags.

---

## 3. Hybrid Search: Dense Vectors + Sparse BM25

### 3.1 Sparse Term-Frequency Retrieval (BM25)
Provides exact keyword matching for domain-specific terminology, function names, and statistical equations:
$$\text{Score}_{\text{BM25}}(D, Q) = \sum_{i=1}^n \text{IDF}(q_i) \cdot \frac{f(q_i, D) \cdot (k_1 + 1)}{f(q_i, D) + k_1 \cdot \left(1 - b + b \cdot \frac{|D|}{\text{avgdl}}\right)}$$

### 3.2 Dense Semantic Embeddings
Captures conceptual similarity and semantic intent across varied phrasing:
$$\text{Sim}_{\text{Dense}}(q, d) = \frac{\mathbf{e}_q \cdot \mathbf{e}_d}{\|\mathbf{e}_q\| \|\mathbf{e}_d\|}$$

---

## 4. Reciprocal Rank Fusion (RRF) Re-Ranking

To combine heterogeneous score distributions from Sparse BM25 and Dense Vector search without manual calibration, AIMentor utilizes **Reciprocal Rank Fusion**:

$$\text{RRF\_Score}(d \in D) = \sum_{m \in M} \frac{1}{k + r_m(d)}$$

Where:
- $M = \{\text{BM25}, \text{Dense}\}$ is the set of retrieval models.
- $r_m(d)$ is the rank position of document $d$ within retriever $m$ (1-indexed).
- $k$ is the smoothing constant (default: $k = 60$).

---

## 5. The RAG Triad & Grounding Gate

Every retrieved context chunk and generated completion passes through the automated **RAG Triad Verification**:

```
                  ┌──────────────────────┐
                  │    User Query (Q)    │
                  └──────────┬───────────┘
                             │
            Context Relevance│Answer Relevance
                             │
     ┌───────────────────────┴───────────────────────┐
     ▼                                               ▼
┌──────────────┐          Groundedness         ┌──────────────┐
│ Context (C)  │ ────────────────────────────► │ Response (A) │
└──────────────┘                               └──────────────┘
```

1. **Context Relevance:** Does the retrieved context $C$ contain the necessary information to address Query $Q$?
2. **Groundedness (Faithfulness):** Is every factual assertion and mathematical formula in Response $A$ directly supported by Context $C$?
3. **Answer Relevance:** Does Response $A$ directly answer Query $Q$ without extraneous or off-topic tangents?
