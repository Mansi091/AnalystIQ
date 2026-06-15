import os
import pickle
import pandas as pd

from flaml import AutoML
from langchain_core.tools import tool
from sklearn.model_selection import train_test_split

from tools.upload_tool_data import load_dataframe


from config import MODELS_DIR


@tool
def train_with_flaml(
    filename: str,
    target_column: str,
    time_budget_seconds: int = 30
) -> dict:
    """
    Train an optimal ML model automatically using FLAML AutoML.
    Detects task type, trains multiple models,
    tunes hyperparameters, and saves the best model.
    """

    try:
        df = load_dataframe(filename)

    except Exception as e:
        return {
            "error": f"Failed to load dataset: {str(e)}"
        }

    if target_column not in df.columns:
        return {
            "error": f"Target column '{target_column}' not found in dataset."
        }

    #remove rows where target is missing
    df = df.dropna(subset=[target_column])

    X = df.drop(columns=[target_column])
    y = df[target_column]

    #fill numeric missing values
    numeric_columns = X.select_dtypes(include="number").columns

    for column in numeric_columns:
        X[column] = X[column].fillna(
            X[column].median()
        )

    #fill categorical missing values
    categorical_columns = X.select_dtypes(
        exclude="number"
    ).columns

    for column in categorical_columns:

        mode_values = X[column].mode()

        if not mode_values.empty:
            fill_value = mode_values.iloc[0]
        else:
            fill_value = "Unknown"

        X[column] = X[column].fillna(fill_value)

        X[column] = X[column].astype("category")

    #task classifying
    if (
        pd.api.types.is_numeric_dtype(y)
        and y.nunique() > 10
    ):
        task = "regression"
    else:
        task = "classification"

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42
    )

    automl = AutoML()

    settings = {
        "time_budget": time_budget_seconds,
        "metric": "auto",
        "task": task,
        "verbose": 0,
        "log_file_name": ""
    }

    try:
        automl.fit(
            X_train=X_train,
            y_train=y_train,
            **settings
        )

    except Exception as e:
        return {
            "error": f"FLAML training failed: {str(e)}"
        }

    #best model details
    best_model = automl.best_estimator
    best_config = automl.best_config
    best_loss = automl.best_loss

    #saving model
    safe_filename = os.path.splitext(filename)[0]
    safe_target = target_column.replace(" ", "_")

    model_filename = (
        f"model_{safe_filename}_{safe_target}.pkl"
    )

    model_path = os.path.join(
        MODELS_DIR,
        model_filename
    )

    with open(model_path, "wb") as f:
        pickle.dump(automl, f)

    return {
        "message": "FLAML AutoML training completed successfully",
        "task_type": task,
        "target_column": target_column,
        "best_algorithm": str(best_model),
        "best_validation_loss": float(best_loss),
        "best_hyperparameters": best_config,
        "saved_model": model_filename,
        "saved_path": model_path
    }