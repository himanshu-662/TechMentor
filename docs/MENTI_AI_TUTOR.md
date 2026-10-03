# Menti.ai — Pedagogical Socratic Framework & Zero-Fabrication Architecture

> **Tutoring Persona:** Socratic mentor and mathematical prover designed to guide students from intuition to rigorous formal proofs without hallucination or passive spoon-feeding.

---

## 1. Pedagogical Pillars

```
                     ┌──────────────────────────────┐
                     │     User Inbound Prompt      │
                     └──────────────┬───────────────┘
                                    │
                                    ▼
                     ┌──────────────────────────────┐
                     │    Socratic Intent Router    │
                     │ (Concept, Math, What-If, RAG)│
                     └──────────────┬───────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│ Active Dataset   │       │ Curated Textbook │       │ Structured       │
│ Live Moments     │       │ Knowledge Slice  │       │ Response Schema  │
│ (Mean, Var, Skew)│       │ (Scikit / Stats) │       │ (KaTeX + Code)   │
└────────┬─────────┘       └────────┬─────────┘       └────────┬─────────┘
         │                          │                          │
         └──────────────────────────┼──────────────────────────┘
                                    ▼
                     ┌──────────────────────────────┐
                     │ Zero-Fabrication Synthesis   │
                     │ Injects exact empirical state│
                     └──────────────┬───────────────┘
                                    │
                                    ▼
                     ┌──────────────────────────────┐
                     │  KaTeX Math + Step Proofs    │
                     │  Color Theme: Purple #9333EA │
                     └──────────────────────────────┘
```

---

## 2. Zero-Fabrication Prompt Engineering

To ensure the AI tutor never invents non-existent statistics or hallucinates column values, the backend dynamically calculates and injects the **empirical ground truth** into the system prompt at inference time:

```python
dataset_context = f"""
[ACTIVE DATASET CONTEXT - ZERO-FABRICATION CONTRACT]
- Dataset: '{active_dataset.filename}' (Rows: {df.shape[0]}, Cols: {df.shape[1]})
- Active Column: '{column_name}'
- Type: {col_type}
- 1st Moment (Mean): {df[column_name].mean():.4f}
- 2nd Moment (Variance): {df[column_name].var():.4f} (Std: {df[column_name].std():.4f})
- 3rd Moment (Skewness): {df[column_name].skew():.4f}
- 4th Moment (Kurtosis): {df[column_name].kurt():.4f}
- Missingness: {df[column_name].isnull().sum()} / {len(df)} ({df[column_name].isnull().mean()*100:.2f}%)
- Outliers (IQR Method): {outlier_count} detected [{lower_bound:.2f}, {upper_bound:.2f}]
"""
```

---

## 3. The 7 Explainability Pillars Contract

Every substantive response and transformation review delivered by Menti.ai adheres strictly to the 7 Explainability Pillars:

1. **What Happened:** Concrete, plain-language description of the operation.
2. **Why It Happened:** Statistical trigger (e.g. skewness $> 1.5$, nulls $> 5\%$, collinearity $> 0.85$).
3. **Technique & Formula:** Formal mathematical equation rendered in KaTeX.
4. **Selection Rationale:** Why this specific technique out-performed competing approaches.
5. **Quantified Delta:** Before vs After moment shifts ($\Delta\mu, \Delta\sigma^2$).
6. **Alternative Trade-Offs:** Discussion of alternative approaches (e.g. Mean vs Median vs KNN).
7. **When to Apply:** Practical rule-of-thumb guidance for real-world production data science.

---

## 4. UI & Mathematical Rendering Contract

- **LaTeX Delimiters:** Standard `$ ... $` for inline math and `$$ ... $$` for display equations.
- **Theme Color Contract:** Single-colour `#9333EA` (Purple-600) for all Menti.ai interface elements, header badges, FAB triggers, and message highlights.
