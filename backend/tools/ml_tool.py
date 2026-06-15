from langchain_core.tools import tool
from tools.upload_tool_data import load_dataframe
import pandas as pd


@tool
def ml_model_selection(filename: str) -> dict:
    """
    Analyze the dataset and recommend AutoML setup:
    possible target column, task type, suitable models, and reasoning.
    This tool does not train models.
    """

    try:
        df = load_dataframe(filename)
    except Exception as e:
        return {"error": "failed to load dataset"}
    recommendations = []

    numeric_columns = df.select_dtypes(include="number").columns.tolist()
    categorical_columns = df.select_dtypes(include=["object", "category"]).columns.tolist()

    possible_target = None
    task_type = None
    suggested_models = []

    #classification
    if categorical_columns:
        possible_target = categorical_columns[-1]
        task_type = "classification"
        suggested_models = [
            "Logistic Regression",
            "Decision Tree Classifier",
            "Random Forest Classifier"
        ]

    #regression
    elif numeric_columns:
        possible_target = numeric_columns[-1]
        task_type = "regression"
        suggested_models = [
            "Linear Regression",
            "Decision Tree Regressor",
            "Random Forest Regressor"
        ]

    else:
        return {
            "message": "No suitable target column found for AutoML."
        }

    recommendations.append({
        "possible_target_column": possible_target,
        "task_type": task_type,
        "recommended_models": suggested_models,
        "reason": (
            f"{possible_target} looks like a suitable target column. "
            f"The detected task type is {task_type}."
        )
    })

    return {
        "automl_recommendation": recommendations
    }