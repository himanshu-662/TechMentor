# DataMentor — 13-Stage ML Preprocessing Pipeline & Mathematical Specifications

> **Core Philosophy:** "Step inside the black box." Every tabular transformation is deterministic, fully reproducible, mathematically grounded, and accompanied by the **7 Pillars of Explainability**.

---

## 1. The 13 Pipeline Stages

```
[01. Sourcing] ────► [02. Loading] ────► [03. Profiling] ────► [04. Cleaning]
                                                                     │
[08. PCA]      ◄──── [07. Scaling] ◄──── [06. Encoding]  ◄──── [05. Outliers]
    │
    ▼
[09. Selection] ───► [10. Split] ────► [11. Fitting] ────► [12. Prediction] ───► [13. Evaluation]
```

---

## 2. Mathematical Specifications by Stage

### Stage 01: Data Collection & Sourcing
- **Objective:** Ingest raw tabular assets from CSV, Excel, or synthetic domain generators.
- **Validations:** File signature check, byte length bounds ($\le 50\text{ MB}$), MIME-type verification.
- **API Route:** `POST /api/datasets/upload`

### Stage 02: Data Loading & Ingestion
- **Objective:** Parse raw bytes into structured Pandas DataFrame with typed schema inference.
- **Statistical Output:** Row counts, column count, memory footprint, data type distributions (numerical vs categorical).

### Stage 03: Exploratory Data Analysis & Statistical Moments
- **Objective:** Compute fundamental 1st through 4th central moments and summary statistics for every feature:
  - **1st Moment (Mean):** $\mu = \frac{1}{N}\sum_{i=1}^N x_i$
  - **2nd Central Moment (Variance):** $\sigma^2 = \frac{1}{N}\sum_{i=1}^N (x_i - \mu)^2$
  - **3rd Standardized Moment (Skewness):** $\gamma_1 = \frac{\frac{1}{N}\sum (x_i - \mu)^3}{\sigma^3}$
  - **4th Standardized Moment (Kurtosis):** $\gamma_2 = \frac{\frac{1}{N}\sum (x_i - \mu)^4}{\sigma^4} - 3$ (Excess Kurtosis)
- **API Route:** `GET /api/datasets/{dataset_id}/summary`

### Stage 04: Data Cleaning & Missing Value Imputation
- **Techniques:**
  - **Mean Imputation:** $\hat{x}_i = \bar{x}$ (Assumes Missing Completely at Random - MCAR, normal distribution).
  - **Median Imputation:** $\hat{x}_i = \text{Median}(X)$ (Robust to extreme skewness and outliers).
  - **Mode Imputation:** $\hat{x}_i = \text{argmax}_{c} \text{Freq}(c)$ (Standard for categorical missingness).
  - **KNN Imputation:** Imputes weighted average of $k$ Euclidean nearest neighbors: $\hat{x}_i = \frac{\sum w_j x_j}{\sum w_j}$.
  - **Row Deletion:** Complete case analysis.
- **API Route:** `POST /api/cleaning/impute`

### Stage 05: Outlier Detection & Treatment
- **Techniques:**
  - **Tukey's IQR Rule:** Bound at $[Q_1 - 1.5 \cdot \text{IQR}, Q_3 + 1.5 \cdot \text{IQR}]$ where $\text{IQR} = Q_3 - Q_1$.
  - **Z-Score Filter:** $|z_i| = \left|\frac{x_i - \mu}{\sigma}\right| > \theta$ (typically $\theta = 3.0$).
  - **Modified Z-Score (MAD):** $M_i = \frac{0.6745 \cdot (x_i - \tilde{x})}{\text{MAD}}$ where $\text{MAD} = \text{Median}(|x_i - \tilde{x}|)$.
  - **Treatment Actions:** Winsorization (capping to bounds) or Trimming (row removal).
- **API Route:** `POST /api/outliers/detect` & `POST /api/outliers/treat`

### Stage 06: Categorical Encoding
- **Techniques:**
  - **One-Hot Encoding:** Creates binary columns for $k$ categories (with optional $k-1$ dummy variable trap avoidance).
  - **Ordinal Encoding:** Maps ordered categories to discrete integers $\{0, 1, \dots, k-1\}$.
  - **Frequency Encoding:** Maps category $c$ to its empirical probability $P(c) = \frac{n_c}{N}$.
  - **Target Encoding:** Replaces category with mean of target variable: $\hat{x}_c = \alpha \bar{y}_c + (1-\alpha)\bar{y}_{\text{global}}$.
- **API Route:** `POST /api/encoding/apply`

### Stage 07: Feature Scaling & Mathematical Transformations
- **Techniques:**
  - **StandardScaler:** $z = \frac{x - \mu}{\sigma}$ (Forces $\mu=0, \sigma=1$).
  - **MinMaxScaler:** $x_{\text{scaled}} = \frac{x - x_{\min}}{x_{\max} - x_{\min}} \cdot (b - a) + a$.
  - **RobustScaler:** $x_{\text{robust}} = \frac{x - \text{Median}(X)}{\text{IQR}(X)}$ (Resistant to outlier distortion).
  - **Log1p Transform:** $y = \ln(1 + x)$ (Compacts heavy right tails for $x \ge 0$).
  - **Box-Cox & Yeo-Johnson:** Power transform family maximizing normality log-likelihood.
- **API Route:** `POST /api/transformations/apply`

### Stage 08: Dimensionality Reduction (PCA)
- **Techniques:**
  - Standardize matrix $X \in \mathbb{R}^{N \times D}$.
  - Compute Covariance Matrix $\Sigma = \frac{1}{N-1} X^T X$.
  - Eigendecomposition $\Sigma v_i = \lambda_i v_i$ or Singular Value Decomposition (SVD) $X = U \Sigma V^T$.
  - Select top $k$ principal components based on cumulative explained variance ratio: $\frac{\sum_{i=1}^k \lambda_i}{\sum_{j=1}^D \lambda_j} \ge \text{Threshold}$.
- **API Route:** `POST /api/dimensionality/pca`

### Stage 09: Feature Selection
- **Techniques:**
  - **Variance Threshold:** Drops features with $\text{Var}(X) \le \tau$.
  - **SelectKBest (ANOVA F-Value):** $F = \frac{\text{Between-group variance}}{\text{Within-group variance}}$ for classification.
  - **Mutual Information:** $I(X; Y) = \iint p(x, y) \log \frac{p(x, y)}{p(x)p(y)} dx dy$ capturing non-linear dependencies.
- **API Route:** `POST /api/feature-selection/apply`

### Stage 10: Train-Test Partitioning
- **Techniques:**
  - Stratified split preserving class proportions for classification.
  - Random shuffle split with deterministic seed (`random_state=42`).
  - **Data Leakage Guarantee:** Scalers and transformers are fitted strictly on $X_{\text{train}}$ and transformed on $X_{\text{test}}$.
- **API Route:** `POST /api/split/apply`

### Stage 11: Model Fitting & Convergence
- **Algorithms:**
  - **Linear Regression (OLS):** Closed-form $\hat{\beta} = (X^T X)^{-1} X^T y$ or Gradient Descent.
  - **Logistic Regression:** Minimizing binary cross-entropy loss $J(\theta) = -\frac{1}{N}\sum [y \ln \hat{p} + (1-y)\ln(1-\hat{p})]$.
- **Visuals:** Epoch loss curves, convergence diagnostics, and extracted weight coefficients.
- **API Route:** `POST /api/modeling/train`

### Stage 12: Real-Time What-If Prediction & Inference
- **Deterministic Inference:**
  - Linear Model: $\hat{y} = \beta_0 + \sum_{j=1}^p \beta_j x_j$.
  - Logistic Model: $\hat{p} = \sigma(z) = \frac{1}{1 + e^{-(\beta_0 + \sum \beta_j x_j)}}$.
- **Interactive UI:** Dynamic feature sliders providing real-time probability outputs and decision boundary highlights.
- **API Route:** `POST /api/modeling/predict`

### Stage 13: Model Evaluation & Diagnostics
- **Regression Metrics:**
  - $\text{MSE} = \frac{1}{N}\sum (y_i - \hat{y}_i)^2$
  - $\text{RMSE} = \sqrt{\text{MSE}}$
  - $\text{MAE} = \frac{1}{N}\sum |y_i - \hat{y}_i|$
  - $R^2 = 1 - \frac{\sum (y_i - \hat{y}_i)^2}{\sum (y_i - \bar{y})^2}$
- **Classification Metrics:**
  - Confusion Matrix ($TP, FP, TN, FN$)
  - $\text{Accuracy} = \frac{TP + TN}{TP + TN + FP + FN}$
  - $\text{Precision} = \frac{TP}{TP + FP}$
  - $\text{Recall (Sensitivity)} = \frac{TP}{TP + FN}$
  - $F_1\text{-Score} = 2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$
  - ROC-AUC Curve & Area Under Curve score.
- **API Route:** `POST /api/modeling/evaluate`
