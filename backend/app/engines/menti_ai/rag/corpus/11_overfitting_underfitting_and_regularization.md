# Overfitting, Underfitting, and Regularization

## The Bias-Variance Tradeoff
Generalization error decomposes into three fundamental components:
$$\text{Total Error} = \text{Bias}^2 + \text{Variance} + \text{Irreducible Error}$$

- **Bias (Underfitting)**: Error caused by overly simplistic model assumptions. The model fails to capture underlying patterns in the training data, exhibiting low training accuracy and low test accuracy.
- **Variance (Overfitting)**: Error caused by extreme sensitivity to small fluctuations in the training set. The model fits random noise and idiosyncrasies, exhibiting high training accuracy (e.g., 99%) but poor test accuracy (e.g., 68%).
- **Generalization Gap**: The delta between training score and validation/test score: $\Delta = \text{Score}_{\text{train}} - \text{Score}_{\text{test}}$. A large gap is the diagnostic hallmark of overfitting.

## How to Remedy Overfitting
1. **Regularization**: Penalizes large parameter magnitudes.
   - **L2 Regularization (Ridge / Weight Decay)**: Adds penalty $\lambda \sum w_i^2$. Shrinks weights smoothly toward zero.
   - **L1 Regularization (Lasso)**: Adds penalty $\lambda \sum |w_i|$. Performs sparse feature selection by driving weights to zero.
2. **Pruning & Tree Constraints**: Limit `max_depth`, `min_samples_split`, and `min_samples_leaf` in decision tree ensembles.
3. **Early Stopping**: Halts gradient-boosted training when validation loss stops improving.
4. **Gather More Training Data**: Increases sample diversity and drowns out spurious noise.
5. **Feature Reduction**: Drop uninformative or collinear features through feature selection or PCA.

## How to Remedy Underfitting
1. Increase model complexity (e.g. use Random Forest or Gradient Boosting instead of simple linear models).
2. Engineer informative interaction features and non-linear transformations.
3. Decrease regularization penalties ($\lambda$).
