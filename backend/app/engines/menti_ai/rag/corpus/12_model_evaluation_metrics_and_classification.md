# Model Evaluation Metrics for Classification

## The Confusion Matrix
For binary classification, predictions fall into four quadrants:
- **True Positive (TP)**: Correctly predicted positive instances.
- **True Negative (TN)**: Correctly predicted negative instances.
- **False Positive (FP - Type I Error)**: Negative instances incorrectly classified as positive.
- **False Negative (FN - Type II Error)**: Positive instances incorrectly classified as negative.

## Core Classification Metrics

### 1. Accuracy
$$\text{Accuracy} = \frac{TP + TN}{TP + TN + FP + FN}$$
- **Limitation**: Highly misleading on imbalanced datasets. If 98% of samples are class 0, a naive classifier predicting all 0 achieves 98% accuracy while failing to detect any positives.

### 2. Precision (Positive Predictive Value)
$$\text{Precision} = \frac{TP}{TP + FP}$$
- **Meaning**: "Out of all predicted positive cases, what percentage was actually positive?"
- **Priority Use Case**: When False Positives carry severe penalties (e.g. email spam filtering, critical investment fraud alerts).

### 3. Recall (Sensitivity / True Positive Rate)
$$\text{Recall} = \frac{TP}{TP + FN}$$
- **Meaning**: "Out of all actual positive cases, what percentage did the model successfully catch?"
- **Priority Use Case**: When False Negatives are dangerous or catastrophic (e.g. disease diagnosis, cancer detection, defect inspection).

### 4. F1-Score
The harmonic mean of Precision and Recall:
$$\text{F1} = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}} = \frac{2TP}{2TP + FP + FN}$$
- Balances precision and recall, especially effective for skewed and imbalanced distributions.

### 5. ROC Curve and AUC (Area Under the Curve)
- Plots **True Positive Rate (Recall)** against **False Positive Rate** ($FPR = \frac{FP}{FP + TN}$) across all possible classification probability thresholds ($0.0 \to 1.0$).
- **AUC = 1.0**: Perfect classification ranking.
- **AUC = 0.5**: Random guessing.
- AUC measures ranking capability independently of the chosen decision threshold.
