# DataMentor AI — Learning-First & Explainability Framework

## 1. Core Product Principle

> **"This is NOT a black-box preprocessing tool. It is a learning-first platform."**

Traditional AutoML and data wrangling tools often obscure transformations behind high-level flags (e.g. `auto_clean=True`). While convenient for advanced practitioners, this approach leaves learners and data science students in the dark about:
- Why certain data was dropped or modified
- How mathematical techniques operate under the hood
- What alternatives were available and why they were rejected
- How to make informed preprocessing decisions in real-world data science roles

DataMentor AI re-imagines data preparation as an **interactive educational apprenticeship**.

---

## 2. The 7 Pillars of Explainable Data Operations

Every automated and semi-automated operation in DataMentor AI must satisfy the following 7 explainability criteria:

| Pillar | Focus | Question Answered | Example Implementation |
|---|---|---|---|
| **1** | **Action Summary** | *What happened?* | "Imputed 42 missing numerical entries in column 'MonthlyIncome' with $4,250." |
| **2** | **Diagnostic Trigger** | *Why did it happen?* | "The column exhibited 3.8% null entries with severe right-skewness (skewness index 2.14)." |
| **3** | **Technique & Method** | *Which technique was used?* | "Median Imputation (Non-parametric central tendency estimation)." |
| **4** | **Selection Rationale** | *Why was that technique selected?* | "The median is robust to extreme right-tail values, whereas the mean would pull imputed values upward." |
| **5** | **Quantified Impact** | *What changed in the data?* | "Zero missing values remain. Mean changed from $4,890 to $4,510; variance decreased by 5.7%." |
| **6** | **Alternative Methods** | *What alternatives exist?* | "Mean imputation, KNN imputation, Iterative/MICE imputation, or row deletion." |
| **7** | **Application Guidance** | *When should this be used?* | "Best for skewed continuous data with low-to-moderate missingness (<10%) where computation speed is valued." |

---

## 3. The `OperationExplanation` Domain Contract

In the backend (`app.models.explanation`), all services will return explanation payloads conforming to `OperationExplanation`:

```python
class OperationExplanation(BaseModel):
    operation_id: str
    module_name: str
    what_happened: str
    why_it_happened: str
    technique_used: str
    selection_rationale: str
    metrics_before: Dict[str, Any]
    metrics_after: Dict[str, Any]
    impact_summary: str
    alternatives: List[AlternativeTechnique]
    when_to_use: str
    learning_concept_tag: Optional[str]
```

---

## 4. Grounded AI Mentorship & RAG

To prevent AI hallucinations, the planned **AI Mentor Chatbot** will be grounded using:
1. **Dynamic Dataset State:** Real-time column profiles, data types, null rates, and distribution statistics.
2. **Operation Explanations:** The exact deterministic output produced by the backend execution engine.
3. **Curated Statistical Knowledge Base (RAG):** Peer-reviewed data science literature, scikit-learn documentation standards, and statistical textbooks.
