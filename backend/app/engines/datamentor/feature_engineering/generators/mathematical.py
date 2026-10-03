"""Mathematical feature generation without eval() using strict operation dispatchers."""
from typing import Dict, Any, Tuple, List
import numpy as np
import pandas as pd
from app.feature_engineering.models import MathematicalOperatorEnum


def generate_mathematical_feature(
    df: pd.DataFrame,
    params: Dict[str, Any]
) -> Tuple[pd.Series, str, List[str], List[str]]:
    """
    Generate mathematical feature from DataFrame.
    
    Returns:
        (result_series, formula_human_readable, step_by_step_calculation, warnings)
    """
    operation = params.get("operation", "add").lower()
    column_a = params.get("column_a")
    column_b = params.get("column_b")
    scalar_value = params.get("scalar_value")
    
    if not column_a or column_a not in df.columns:
        raise ValueError(f"Primary column '{column_a}' does not exist in dataset.")
    
    warnings: List[str] = []
    step_steps: List[str] = []
    
    series_a = pd.to_numeric(df[column_a], errors="coerce")
    
    # Binary operations: column_a with column_b or scalar_value
    if operation in [MathematicalOperatorEnum.ADD.value, "add", "+"]:
        if column_b:
            if column_b not in df.columns:
                raise ValueError(f"Secondary column '{column_b}' not found in dataset.")
            series_b = pd.to_numeric(df[column_b], errors="coerce")
            result = series_a + series_b
            formula = f"{column_a} + {column_b}"
            step_steps = [
                f"1. Extract numerical values from '{column_a}' and '{column_b}'",
                f"2. Apply element-wise addition: [{column_a}] + [{column_b}]",
                f"3. Assign resulting sum vector to new feature."
            ]
        elif scalar_value is not None:
            scalar = float(scalar_value)
            result = series_a + scalar
            formula = f"{column_a} + {scalar}"
            step_steps = [
                f"1. Extract numerical values from '{column_a}'",
                f"2. Add constant scalar value {scalar} to each element.",
                f"3. Assign resulting offset vector to new feature."
            ]
        else:
            raise ValueError("Addition requires either 'column_b' or 'scalar_value'.")

    elif operation in [MathematicalOperatorEnum.SUBTRACT.value, "subtract", "-"]:
        if column_b:
            if column_b not in df.columns:
                raise ValueError(f"Secondary column '{column_b}' not found in dataset.")
            series_b = pd.to_numeric(df[column_b], errors="coerce")
            result = series_a - series_b
            formula = f"{column_a} - {column_b}"
            step_steps = [
                f"1. Extract numerical values from '{column_a}' and '{column_b}'",
                f"2. Apply element-wise subtraction: [{column_a}] - [{column_b}]",
                f"3. Assign resulting difference vector to new feature."
            ]
        elif scalar_value is not None:
            scalar = float(scalar_value)
            result = series_a - scalar
            formula = f"{column_a} - {scalar}"
            step_steps = [
                f"1. Extract numerical values from '{column_a}'",
                f"2. Subtract constant scalar value {scalar} from each element.",
                f"3. Assign resulting difference vector to new feature."
            ]
        else:
            raise ValueError("Subtraction requires either 'column_b' or 'scalar_value'.")

    elif operation in [MathematicalOperatorEnum.MULTIPLY.value, "multiply", "*"]:
        if column_b:
            if column_b not in df.columns:
                raise ValueError(f"Secondary column '{column_b}' not found in dataset.")
            series_b = pd.to_numeric(df[column_b], errors="coerce")
            result = series_a * series_b
            formula = f"{column_a} * {column_b}"
            step_steps = [
                f"1. Extract numerical values from '{column_a}' and '{column_b}'",
                f"2. Multiply corresponding row pairs: [{column_a}] × [{column_b}]",
                f"3. Assign cross-product vector to new feature."
            ]
        elif scalar_value is not None:
            scalar = float(scalar_value)
            result = series_a * scalar
            formula = f"{column_a} * {scalar}"
            step_steps = [
                f"1. Extract numerical values from '{column_a}'",
                f"2. Scale each element by multiplier {scalar}.",
                f"3. Assign scaled vector to new feature."
            ]
        else:
            raise ValueError("Multiplication requires either 'column_b' or 'scalar_value'.")

    elif operation in [MathematicalOperatorEnum.DIVIDE.value, "divide", "/"]:
        div_zero_policy = params.get("division_by_zero_policy", "nan").lower()
        custom_div_val = params.get("custom_value", 0.0)
        
        if column_b:
            if column_b not in df.columns:
                raise ValueError(f"Secondary column '{column_b}' not found in dataset.")
            series_b = pd.to_numeric(df[column_b], errors="coerce")
            
            zero_denom_mask = (series_b == 0) | (np.isclose(series_b, 0.0, atol=1e-12))
            zero_count = int(zero_denom_mask.sum())
            if zero_count > 0:
                warnings.append(f"Division by zero detected in {zero_count} rows. Applied policy: '{div_zero_policy}'.")
            
            with np.errstate(divide='ignore', invalid='ignore'):
                raw_div = series_a / series_b
                
            if div_zero_policy == "zero":
                raw_div = raw_div.mask(zero_denom_mask, 0.0)
            elif div_zero_policy == "custom_value":
                raw_div = raw_div.mask(zero_denom_mask, float(custom_div_val))
            else: # nan
                raw_div = raw_div.mask(zero_denom_mask, np.nan)
                
            result = raw_div.replace([np.inf, -np.inf], np.nan if div_zero_policy == "nan" else (0.0 if div_zero_policy == "zero" else float(custom_div_val)))
            formula = f"{column_a} / {column_b}"
            step_steps = [
                f"1. Extract numerator '{column_a}' and denominator '{column_b}'",
                f"2. Perform safe element-wise division with policy '{div_zero_policy}' for zero denominators.",
                f"3. Output resulting quotient vector."
            ]
        elif scalar_value is not None:
            scalar = float(scalar_value)
            if np.isclose(scalar, 0.0):
                raise ValueError("Cannot divide by scalar constant zero.")
            result = series_a / scalar
            formula = f"{column_a} / {scalar}"
            step_steps = [
                f"1. Extract numerical values from '{column_a}'",
                f"2. Divide each element by scalar divisor {scalar}.",
                f"3. Output resulting scaled vector."
            ]
        else:
            raise ValueError("Division requires either 'column_b' or 'scalar_value'.")

    elif operation in [MathematicalOperatorEnum.ABS.value, "abs"]:
        result = series_a.abs()
        formula = f"|{column_a}|"
        step_steps = [
            f"1. Extract numerical values from '{column_a}'",
            f"2. Apply absolute value transformation: |x|",
            f"3. Return non-negative magnitude vector."
        ]

    elif operation in [MathematicalOperatorEnum.SQUARE.value, "square"]:
        result = series_a ** 2
        formula = f"({column_a})^2"
        step_steps = [
            f"1. Extract numerical values from '{column_a}'",
            f"2. Square each value: x^2",
            f"3. Return quadratic power vector."
        ]

    elif operation in [MathematicalOperatorEnum.SQRT.value, "sqrt"]:
        neg_mask = series_a < 0
        neg_count = int(neg_mask.sum())
        if neg_count > 0:
            warnings.append(f"Square root encountered {neg_count} negative numbers. Negative values were set to NaN.")
        
        safe_a = series_a.copy()
        safe_a[neg_mask] = np.nan
        result = np.sqrt(safe_a)
        formula = f"sqrt({column_a})"
        step_steps = [
            f"1. Extract numerical values from '{column_a}'",
            f"2. Filter negative values to NaN to prevent imaginary numbers.",
            f"3. Calculate principal square root: sqrt(x)"
        ]

    elif operation in [MathematicalOperatorEnum.LOG1P.value, "log1p"]:
        invalid_mask = series_a <= -1.0
        invalid_count = int(invalid_mask.sum())
        if invalid_count > 0:
            warnings.append(f"log1p encountered {invalid_count} values <= -1. Invalid domain values were set to NaN.")
        
        safe_a = series_a.copy()
        safe_a[invalid_mask] = np.nan
        result = np.log1p(safe_a)
        formula = f"log(1 + {column_a})"
        step_steps = [
            f"1. Extract numerical values from '{column_a}'",
            f"2. Compute natural log of (1 + x) for variance stabilization.",
            f"3. Return transformed continuous scale."
        ]

    else:
        raise ValueError(f"Unsupported mathematical operator: '{operation}'")

    return result, formula, step_steps, warnings
