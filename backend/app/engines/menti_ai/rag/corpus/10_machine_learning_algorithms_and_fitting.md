# Supervised Machine Learning Algorithms and Model Fitting

## Overview of Supervised Algorithms

### 1. Logistic Regression & Linear Regression
- **Linear Regression**: Fits a hyper-plane minimizing Mean Squared Error (Ordinary Least Squares): $\hat{y} = w^T x + b$.
- **Logistic Regression**: Passes linear combination through the sigmoid activation function $\sigma(z) = \frac{1}{1 + e^{-z}}$ to model probability outcomes for binary classification.
- **Strengths**: Highly interpretable coefficients, fast training, convex optimization guarantees.

### 2. Decision Trees & Random Forest
- **Decision Tree**: Non-parametric algorithm that recursively partitions feature space using greedy threshold splits that maximize Information Gain or Gini Impurity reduction.
- **Random Forest (Bagging Ensemble)**: Builds an ensemble of $B$ de-correlated decision trees, using bootstrap sampling and random feature sub-spacing at each split. Final predictions are obtained by majority voting or average probabilities.
- **Strengths**: Robust against outliers, handles non-linear interactions automatically, requires minimal feature scaling.

### 3. Gradient Boosting (GBDT / XGBoost / LightGBM)
- **Mechanism**: Builds trees sequentially (boosting). Each subsequent tree is trained to predict the negative gradient (pseudo-residuals) of the loss function of all prior trees.
- **Strengths**: State-of-the-art performance on tabular datasets.

### 4. Support Vector Machines (SVM) & K-Nearest Neighbors (KNN)
- **SVM**: Finds the optimal decision boundary (hyperplane) that maximizes the margin between support vectors of different classes. Uses kernel tricks (RBF, Polynomial) for non-linear boundaries.
- **KNN**: Instance-based non-parametric classifier predicting classes based on majority vote of $k$ closest data points.
