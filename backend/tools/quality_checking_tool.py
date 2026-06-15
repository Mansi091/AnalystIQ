from langchain_core.tools import tool
import pandas as pd

from tools.upload_tool_data import load_dataframe


@tool
def analyze_quality_and_recommend_cleaning(filename: str) -> dict:
    """
    Analyze dataset quality and recommend cleaning actions.
    Detects missing values, duplicate rows, outliers, and constant columns.
    """

    df = load_dataframe(filename)

    issues_and_recommendations = []

    #finding missing values
    for column in df.columns:
        missing_count = int(df[column].isnull().sum())

        if missing_count > 0:
            if pd.api.types.is_numeric_dtype(df[column]):
                recommendation = "Fill missing values using median"
                action = "fill_missing_median"
            else:
                recommendation = "Fill missing values using mode"
                action = "fill_missing_mode"

            issues_and_recommendations.append({
                "issue_type": "missing_values",
                "column": column,
                "issue": f"{column} has {missing_count} missing values",
                "recommendation": recommendation,
                "action": action
            })

    #finding duplicate rows
    duplicate_count = int(df.duplicated().sum())

    if duplicate_count > 0:
        issues_and_recommendations.append({
            "issue_type": "duplicate_rows",
            "column": None,
            "issue": f"Dataset has {duplicate_count} duplicate rows",
            "recommendation": "Remove duplicate rows",
            "action": "drop_duplicates"
        })

    #columns having only one unique value
    for column in df.columns:
        unique_count = df[column].nunique(dropna=False)

        if unique_count == 1:
            issues_and_recommendations.append({
                "issue_type": "constant_column",
                "column": column,
                "issue": f"{column} has only one unique value",
                "recommendation": "Consider dropping this column",
                "action": "drop_column"
            })

    #finding outliers
    numeric_columns = df.select_dtypes(include="number").columns

    for column in numeric_columns:
        q1 = df[column].quantile(0.25)
        q3 = df[column].quantile(0.75)
        iqr = q3 - q1

        if iqr == 0:
            continue

        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr

        outlier_count = int(
            ((df[column] < lower_bound) | (df[column] > upper_bound)).sum()
        )

        if outlier_count > 0:
            issues_and_recommendations.append({
                "issue_type": "outliers",
                "column": column,
                "issue": f"{column} has {outlier_count} possible outliers",
                "recommendation": "Remove outliers using IQR limits",
                "action": "remove_outliers_iqr",
                "lower_bound": float(lower_bound),
                "upper_bound": float(upper_bound)
            })

    return {
        "total_issues": len(issues_and_recommendations),
        "issues_and_recommendations": issues_and_recommendations
    }