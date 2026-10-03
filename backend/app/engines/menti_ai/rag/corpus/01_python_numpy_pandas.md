# Python, NumPy, and Pandas Fundamentals

## Overview of Python in Data Science
Python is the premier programming language for data science, machine learning, and numerical analysis. Its readability, dynamic typing, and massive ecosystem of specialized libraries make it ideal for exploratory data science and production engineering.

## NumPy Numerical Computing
NumPy (Numerical Python) is the foundational package for scientific computing in Python. It provides:
- **ndarray**: Fast, memory-efficient n-dimensional arrays with vectorized operations.
- **Broadcasting**: Element-wise mathematical operations across arrays of varying compatible shapes without explicit Python loops.
- **Linear Algebra**: Matrix multiplications, decompositions (SVD, QR), eigenvalues, and inversions.

Vectorized operations in NumPy execute in pre-compiled C routines, achieving orders-of-magnitude speedups compared to traditional Python `for` loops.

## Pandas Data Manipulation
Pandas provides two primary high-level data structures:
1. **Series**: A 1-dimensional labeled array capable of holding any data type.
2. **DataFrame**: A 2-dimensional tabular data structure with heterogeneous typed columns and labeled axes (rows and columns).

### Core Pandas Workflows
- **Indexing & Slicing**: `.loc[]` for label-based indexing and `.iloc[]` for integer-positional indexing.
- **Aggregation**: `.groupby()`, `.agg()`, and `.pivot_table()` for summarizing metrics across categorical dimensions.
- **Reshaping**: `.melt()` for unpivoting wide tables and `.pivot()` for reshaping long formats.
- **Merging & Joining**: `pd.merge()` for relational SQL-like joins (inner, outer, left, right).
