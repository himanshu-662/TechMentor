"""Automated feature opportunity detection and conservative recommendation engine."""
from typing import List, Dict, Any
import numpy as np
import pandas as pd
from app.feature_engineering.models import (
    FeatureOpportunity,
    FeatureTypeEnum,
    DatePartEnum,
    CyclicalPeriodEnum,
    DateUnitEnum,
    AggregationFunctionEnum,
    TextStatisticTypeEnum,
    BinningStrategyEnum,
    DivisionByZeroPolicyEnum
)


def scan_feature_opportunities(df: pd.DataFrame) -> List[FeatureOpportunity]:
    """
    Deterministically scan dataset and identify sensible domain feature opportunities.
    """
    opportunities: List[FeatureOpportunity] = []
    total_rows = len(df)
    
    if total_rows == 0:
        return opportunities

    # 1. Detect column types
    numeric_cols: List[str] = []
    datetime_cols: List[str] = []
    categorical_cols: List[str] = []
    text_cols: List[str] = []
    
    for col in df.columns:
        series = df[col]
        # Check numeric
        if pd.api.types.is_numeric_dtype(series):
            # If distinct values are small integers, might be categorical flag
            if series.nunique() > 1:
                numeric_cols.append(col)
        # Check datetime
        elif pd.api.types.is_datetime64_any_dtype(series):
            datetime_cols.append(col)
        else:
            # Check if string can be parsed as datetime
            sample_non_null = series.dropna().head(30)
            if len(sample_non_null) > 0:
                try:
                    parsed = pd.to_datetime(sample_non_null, errors="coerce")
                    if parsed.notna().sum() / len(sample_non_null) >= 0.8:
                        datetime_cols.append(col)
                        continue
                except Exception:
                    pass
            
            # String / Object / Text detection
            cleaned_sample = series.dropna().astype(str)
            if len(cleaned_sample) > 0:
                avg_len = cleaned_sample.str.len().mean()
                avg_words = cleaned_sample.apply(lambda s: len(s.split())).mean()
                if avg_len >= 15 or avg_words >= 2.5 or any(term in col.lower() for term in ["text", "review", "comment", "desc", "note"]):
                    text_cols.append(col)
                else:
                    categorical_cols.append(col)
            else:
                categorical_cols.append(col)

    # --- 2. Datetime Opportunities ---
    for dt_col in datetime_cols:
        # Date Decomposition Opportunity
        opportunities.append(
            FeatureOpportunity(
                opportunity_id=f"opp_dt_decomp_{dt_col}",
                title=f"Extract Calendar & Day-of-Week Components from '{dt_col}'",
                category="Temporal Decomposition",
                feature_type=FeatureTypeEnum.DATETIME_PARTS,
                columns_involved=[dt_col],
                rationale=(
                    f"The column '{dt_col}' contains date/time information. Extracting the day of week, month, or is_weekend "
                    f"flag enables models to capture human calendar rhythms and weekly seasonality."
                ),
                suggested_feature_name=f"{dt_col}_dayofweek",
                suggested_params={
                    "datetime_column": dt_col,
                    "part": DatePartEnum.WEEKDAY.value
                },
                confidence="High",
                educational_concept_id="datetime_features"
            )
        )
        
        # Cyclical Encoding Opportunity
        opportunities.append(
            FeatureOpportunity(
                opportunity_id=f"opp_dt_cyclical_{dt_col}",
                title=f"Cyclical Sine/Cosine Encoding for '{dt_col}'",
                category="Periodic Transformation",
                feature_type=FeatureTypeEnum.CYCLICAL,
                columns_involved=[dt_col],
                rationale=(
                    f"Timestamps in '{dt_col}' wrap around periodic boundaries (e.g. Sunday to Monday or Dec to Jan). "
                    f"Cyclical encoding maps values onto a continuous 2D trigonometric circle."
                ),
                suggested_feature_name=f"{dt_col}_month_sin",
                suggested_params={
                    "datetime_column": dt_col,
                    "period_type": CyclicalPeriodEnum.MONTH_12.value,
                    "harmonic": "sin"
                },
                confidence="Medium",
                educational_concept_id="cyclical_encoding"
            )
        )

    # Date Difference Opportunity if 2+ datetimes
    if len(datetime_cols) >= 2:
        for i in range(len(datetime_cols)):
            for j in range(i + 1, len(datetime_cols)):
                col1, col2 = datetime_cols[i], datetime_cols[j]
                opportunities.append(
                    FeatureOpportunity(
                        opportunity_id=f"opp_datediff_{col1}_{col2}",
                        title=f"Compute Elapsed Duration ({col2} - {col1})",
                        category="Time Duration",
                        feature_type=FeatureTypeEnum.DATE_DIFFERENCE,
                        columns_involved=[col1, col2],
                        rationale=(
                            f"Calculating the elapsed duration between '{col1}' and '{col2}' transforms static dates into "
                            f"an informative operational latency, tenure, or processing speed metric."
                        ),
                        suggested_feature_name=f"duration_{col1}_to_{col2}_days",
                        suggested_params={
                            "start_datetime_column": col1,
                            "end_datetime_column": col2,
                            "unit": DateUnitEnum.DAYS.value
                        },
                        confidence="High",
                        educational_concept_id="date_difference"
                    )
                )

    # --- 3. Categorical Opportunities ---
    for cat_col in categorical_cols:
        n_unique = df[cat_col].nunique()
        # Frequency encoding for medium/high cardinality
        if 5 <= n_unique <= 5000 and n_unique < total_rows * 0.95:
            opportunities.append(
                FeatureOpportunity(
                    opportunity_id=f"opp_freq_{cat_col}",
                    title=f"Frequency Count Encoding for '{cat_col}'",
                    category="Categorical Encoding",
                    feature_type=FeatureTypeEnum.FREQUENCY,
                    columns_involved=[cat_col],
                    rationale=(
                        f"The categorical column '{cat_col}' has {n_unique} distinct levels. Frequency encoding replaces each category "
                        f"with its occurrence popularity without exploding dataset dimensionality."
                    ),
                    suggested_feature_name=f"{cat_col}_freq",
                    suggested_params={
                        "source_column": cat_col,
                        "frequency_type": "count"
                    },
                    confidence="High",
                    educational_concept_id="frequency_features"
                )
            )

    # Grouped Aggregations: Entity ID / Group + Numeric Column
    if len(categorical_cols) > 0 and len(numeric_cols) > 0:
        for cat_col in categorical_cols[:3]:
            n_unique = df[cat_col].nunique()
            if 2 <= n_unique <= 500 and (total_rows / n_unique >= 2.0):
                for num_col in numeric_cols[:2]:
                    opportunities.append(
                        FeatureOpportunity(
                            opportunity_id=f"opp_agg_{cat_col}_{num_col}",
                            title=f"Grouped Mean of '{num_col}' by '{cat_col}'",
                            category="Entity Aggregation",
                            feature_type=FeatureTypeEnum.AGGREGATION,
                            columns_involved=[cat_col, num_col],
                            rationale=(
                                f"Grouping '{num_col}' by '{cat_col}' calculates baseline entity expectations, allowing models "
                                f"to detect when an individual record significantly deviates from its group average."
                            ),
                            suggested_feature_name=f"{num_col}_avg_by_{cat_col}",
                            suggested_params={
                                "group_by_column": cat_col,
                                "target_column": num_col,
                                "agg_func": AggregationFunctionEnum.MEAN.value
                            },
                            confidence="Medium",
                            educational_concept_id="aggregation_features"
                        )
                    )

    # --- 4. Numeric Pair Opportunities (Interactions & Ratios) ---
    if len(numeric_cols) >= 2:
        for i in range(min(4, len(numeric_cols))):
            for j in range(i + 1, min(4, len(numeric_cols))):
                col_a = numeric_cols[i]
                col_b = numeric_cols[j]
                
                # Check for naming patterns suggesting ratios or interactions
                name_a = col_a.lower()
                name_b = col_b.lower()
                
                # Ratio check
                is_natural_ratio = any(term in name_a for term in ["revenue", "price", "income", "cost", "total", "sales", "amount"]) and \
                                   any(term in name_b for term in ["count", "unit", "quantity", "area", "size", "employee", "debt", "sqft", "time"])
                
                if is_natural_ratio:
                    opportunities.append(
                        FeatureOpportunity(
                            opportunity_id=f"opp_ratio_{col_a}_{col_b}",
                            title=f"Calculate Ratio: '{col_a}' per '{col_b}'",
                            category="Rate & Density",
                            feature_type=FeatureTypeEnum.RATIO,
                            columns_involved=[col_a, col_b],
                            rationale=(
                                f"Computing '{col_a} / {col_b}' creates a per-unit density or rate metric that standardizes "
                                f"measurements regardless of entity size scale."
                            ),
                            suggested_feature_name=f"{col_a}_per_{col_b}",
                            suggested_params={
                                "numerator_column": col_a,
                                "denominator_column": col_b,
                                "division_by_zero_policy": DivisionByZeroPolicyEnum.ZERO.value
                            },
                            confidence="High",
                            educational_concept_id="ratio_features"
                        )
                    )
                else:
                    # General interaction cross-product
                    opportunities.append(
                        FeatureOpportunity(
                            opportunity_id=f"opp_interaction_{col_a}_{col_b}",
                            title=f"Interaction Cross-Product: '{col_a}' × '{col_b}'",
                            category="Synergistic Interaction",
                            feature_type=FeatureTypeEnum.INTERACTION,
                            columns_involved=[col_a, col_b],
                            rationale=(
                                f"Multiplying '{col_a}' by '{col_b}' allows linear and tree models to capture non-linear "
                                f"synergies where the impact of one feature depends on the level of the other."
                            ),
                            suggested_feature_name=f"{col_a}_x_{col_b}",
                            suggested_params={
                                "column_a": col_a,
                                "column_b": col_b
                            },
                            confidence="Medium",
                            educational_concept_id="interaction_features"
                        )
                    )

    # --- 5. Text Statistics Opportunities ---
    for txt_col in text_cols:
        opportunities.append(
            FeatureOpportunity(
                opportunity_id=f"opp_text_len_{txt_col}",
                title=f"Extract Word Count & Length Statistics from '{txt_col}'",
                category="Text Structural Signal",
                feature_type=FeatureTypeEnum.TEXT_STATISTICS,
                columns_involved=[txt_col],
                rationale=(
                    f"The text column '{txt_col}' contains unstructured sentences. Word count and character length "
                    f"provide lightweight numerical proxies for message detail and effort."
                ),
                suggested_feature_name=f"{txt_col}_word_count",
                suggested_params={
                    "text_column": txt_col,
                    "statistic_type": TextStatisticTypeEnum.WORD_COUNT.value
                },
                confidence="High",
                educational_concept_id="text_features"
            )
        )

    # --- 6. Numeric Binning for Skewed/Continuous Columns ---
    for num_col in numeric_cols[:2]:
        series = df[num_col].dropna()
        if len(series) > 20 and series.nunique() > 10:
            opportunities.append(
                FeatureOpportunity(
                    opportunity_id=f"opp_binning_{num_col}",
                    title=f"Discretize Continuous '{num_col}' into 4 Equal Buckets",
                    category="Discretization",
                    feature_type=FeatureTypeEnum.BINNING,
                    columns_involved=[num_col],
                    rationale=(
                        f"Converting continuous '{num_col}' into discrete bins allows linear scorecards and business logic "
                        f"to treat intervals as discrete risk or performance tiers."
                    ),
                    suggested_feature_name=f"{num_col}_tier",
                    suggested_params={
                        "source_column": num_col,
                        "strategy": BinningStrategyEnum.EQUAL_WIDTH.value,
                        "num_bins": 4
                    },
                    confidence="Medium",
                    educational_concept_id="feature_binning"
                )
            )

    return opportunities
