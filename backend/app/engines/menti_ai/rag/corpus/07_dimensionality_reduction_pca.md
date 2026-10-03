# Dimensionality Reduction and Principal Component Analysis (PCA)

## The Curse of Dimensionality
As feature space dimensionality increases:
1. Data points become exponentially sparse in geometric space.
2. Euclidean distances converge to uniform values, impairing distance-based algorithms like KNN and K-Means.
3. Overfitting risk accelerates as models require exponentially more samples to generalize.

## Principal Component Analysis (PCA)
PCA is an unsupervised linear dimensionality reduction technique that transforms correlated features into a smaller set of orthogonal (uncorrelated) variables called Principal Components (PCs).

### How PCA Works Step-by-Step
1. **Standardize Data**: Mean-center and scale features to unit variance (crucial because PCA maximizes variance).
2. **Compute Covariance Matrix**: Calculates pairwise covariances between all standardized features.
3. **Eigendecomposition**: Calculates eigenvalues $\lambda_i$ and eigenvectors $v_i$ of the covariance matrix.
   - Eigenvectors define the principal axes of maximum variation.
   - Eigenvalues quantify the amount of variance explained by each principal axis.
4. **Project onto Top $k$ Components**: Select the top components that achieve a cumulative explained variance ratio (e.g., 90% or 95%).

### Key Properties & Caveats
- **Orthogonality**: Principal components are mutually perpendicular (zero multicollinearity).
- **Interpretability Loss**: PCs are linear combinations of all original features, making individual business interpretation difficult.
- **Linearity**: Captures only linear relationships; non-linear manifolds require t-SNE or UMAP.
