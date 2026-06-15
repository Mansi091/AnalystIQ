from langchain_core.tools import tool
import os
import pandas as pd

from tools.upload_tool_data import load_dataframe


from config import CLEANED_DIR


@tool
def apply_cleaning(filename: str) -> dict:
    """
    Apply automatic cleaning on a dataset:
    - Fill numeric missing values using median
    - Fill categorical missing values using mode
    - Remove duplicate rows
    - Remove numeric outliers using IQR bounds
    - Save cleaned dataset
    """

    df = load_dataframe(filename)

    actions_applied = []

    #filling missing values
    for column in df.columns:

        if df[column].isnull().sum() == 0:
            continue

        #numerical columns
        if pd.api.types.is_numeric_dtype(df[column]):
            median_value = df[column].median()

            df[column] = df[column].fillna(median_value)

            actions_applied.append(
                f"filled missing values in '{column}' using median ({median_value})"
            )

        #categorical columns
        else:
            mode_value = df[column].mode()

            if not mode_value.empty:
                mode_value = mode_value[0]

                df[column] = df[column].fillna(mode_value)

                actions_applied.append(
                    f"filled missing values in '{column}' using mode ({mode_value})"
                )

    #removing duplicates
    duplicate_count = int(df.duplicated().sum())

    if duplicate_count > 0:
        df = df.drop_duplicates()

        actions_applied.append(
            f"removed {duplicate_count} duplicate rows"
        )

    #remove numeric outliers using IQR bounds
    numeric_columns = df.select_dtypes(include="number").columns
    for column in numeric_columns:
        q1 = df[column].quantile(0.25)
        q3 = df[column].quantile(0.75)
        iqr = q3 - q1

        if iqr == 0:
            continue

        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr

        outlier_mask = (df[column] < lower_bound) | (df[column] > upper_bound)
        outlier_count = int(outlier_mask.sum())

        if outlier_count > 0:
            before_rows = df.shape[0]
            df = df.loc[~outlier_mask].reset_index(drop=True)
            removed_rows = before_rows - df.shape[0]
            actions_applied.append(
                f"removed {removed_rows} row(s) with outliers in '{column}' using IQR bounds [{lower_bound:.2f}, {upper_bound:.2f}]"
            )

    #saving cleaned dataset
    cleaned_filename = f"cleaned_{filename}"

    cleaned_path = os.path.join(
        CLEANED_DIR,
        cleaned_filename
    )

    if filename.endswith(".csv"):
        df.to_csv(cleaned_path, index=False)

    else:
        df.to_excel(cleaned_path, index=False)

    return {
        "message": "cleaning completed successfully",
        "cleaned_filename": cleaned_filename,
        "rows_after_cleaning": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "actions_applied": actions_applied
    }


@tool
def remove_outliers(filename: str) -> dict:
    """
    Remove outliers from numerical columns using IQR limits.
    """
    df = load_dataframe(filename)
    actions_applied = []

    numeric_columns = df.select_dtypes(include="number").columns
    for column in numeric_columns:
        q1 = df[column].quantile(0.25)
        q3 = df[column].quantile(0.75)
        iqr = q3 - q1

        if iqr == 0:
            continue

        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr

        outlier_mask = (df[column] < lower_bound) | (df[column] > upper_bound)
        outlier_count = int(outlier_mask.sum())

        if outlier_count > 0:
            before_rows = df.shape[0]
            df = df.loc[~outlier_mask].reset_index(drop=True)
            removed_rows = before_rows - df.shape[0]
            actions_applied.append(
                f"removed {removed_rows} row(s) with outliers in '{column}' using IQR bounds [{lower_bound:.2f}, {upper_bound:.2f}]"
            )

    cleaned_filename = f"cleaned_{filename}"
    cleaned_path = os.path.join(
        CLEANED_DIR,
        cleaned_filename
    )

    if filename.endswith(".csv"):
        df.to_csv(cleaned_path, index=False)
    else:
        df.to_excel(cleaned_path, index=False)

    return {
        "message": "outlier removal completed successfully",
        "cleaned_filename": cleaned_filename,
        "rows_after_cleaning": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "actions_applied": actions_applied
    }