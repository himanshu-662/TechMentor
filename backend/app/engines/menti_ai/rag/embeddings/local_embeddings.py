"""Local deterministic semantic embedding provider for Phase 16 RAG Knowledge Base.
Generates 384-dimensional normalized dense vectors using subword projection and hashing.
Zero external API key or network dependency required.
"""
import re
import math
import hashlib
from typing import List
import numpy as np
from app.engines.menti_ai.rag.embeddings.base_provider import EmbeddingProvider


class LocalEmbeddingProvider(EmbeddingProvider):
    """Deterministic, offline semantic embedding generator with fixed 384 dimensions."""

    def __init__(self, dimension: int = 384):
        self._dimension = dimension
        self._rnd = np.random.RandomState(42)
        # Pre-seed projection buckets for subwords
        self._num_buckets = 8192
        self._projection = self._rnd.normal(0.0, 1.0 / math.sqrt(self._dimension), (self._num_buckets, self._dimension))

    @property
    def dimension(self) -> int:
        return self._dimension

    @property
    def provider_name(self) -> str:
        return "local_deterministic_384"

    # Semantic concept clusters mapping domain synonyms to shared embedding tokens
    CONCEPT_CLUSTERS = {
        "overfitting": ["variance", "generalization", "noise", "memorization", "regularization"],
        "underfitting": ["bias", "capacity", "simplicity", "learning"],
        "recall": ["sensitivity", "true_positive_rate", "positive_class", "detection"],
        "precision": ["positive_predictive_value", "false_positive_rate", "exactness"],
        "scaling": ["normalization", "standardization", "minmax", "zscore", "scale"],
        "outlier": ["anomaly", "tukey", "iqr", "isolation", "deviation"],
        "encoding": ["onehot", "dummy", "ordinal", "categorical"],
        "pca": ["eigenvalues", "eigenvectors", "dimensionality", "components", "variance"],
        "cross_validation": ["kfold", "split", "stratified", "validation", "holdout"],
        "langchain": ["prompt", "chain", "retriever", "vectorstore", "agent", "tool", "memory"]
    }

    def _expand_tokens(self, tokens: List[str]) -> List[str]:
        expanded = list(tokens)
        for t in tokens:
            if t in self.CONCEPT_CLUSTERS:
                expanded.extend(self.CONCEPT_CLUSTERS[t])
        return expanded

    def embed_text(self, text: str) -> List[float]:
        """Generate a single 384-dim normalized vector."""
        if not text or not text.strip():
            return [0.0] * self._dimension

        vec = np.zeros(self._dimension, dtype=np.float32)
        base_tokens = self._tokenize(text)
        if not base_tokens:
            return [0.0] * self._dimension

        tokens = self._expand_tokens(base_tokens)

        # Accumulate token and n-gram subword projections with inverse frequency decay
        for idx, token in enumerate(tokens):
            bucket = int(hashlib.md5(token.encode('utf-8')).hexdigest()[:8], 16) % self._num_buckets
            # Weight primary tokens higher than expanded cluster terms
            weight = 1.0 if idx < len(base_tokens) else 0.4
            vec += self._projection[bucket] * weight

            # Subword 3-grams
            if len(token) >= 3:
                for i in range(len(token) - 2):
                    sub = token[i:i + 3]
                    sub_bucket = int(hashlib.md5(sub.encode('utf-8')).hexdigest()[:8], 16) % self._num_buckets
                    vec += self._projection[sub_bucket] * 0.3 * weight

        # L2 Normalization
        norm = np.linalg.norm(vec)
        if norm > 1e-8:
            vec = vec / norm
        else:
            vec = np.zeros(self._dimension, dtype=np.float32)

        return vec.tolist()

    def embed_documents(self, documents: List[str]) -> List[List[float]]:
        """Batch embedding generation."""
        return [self.embed_text(doc) for doc in documents]

    def _tokenize(self, text: str) -> List[str]:
        """Extract clean alphanumeric tokens."""
        clean = text.lower()
        return re.findall(r'\b[a-z0-9_\-]{2,}\b', clean)
