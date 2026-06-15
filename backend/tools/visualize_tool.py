from langchain_core.tools import tool
from tools.upload_tool_data import load_dataframe


def is_id_column(column_name: str) -> bool:
    col = column_name.lower()
    return col == "id" or col.endswith("_id") or col.endswith("id")


@tool
def suggest_visuals(filename: str) -> dict:
    """
    Suggest top 3 meaningful visualizations for any uploaded dataset.
    do not create images, only recommends chart types and columns.
    """

    df = load_dataframe(filename)

    numeric_columns = df.select_dtypes(include="number").columns.tolist()
    categorical_columns = df.select_dtypes(include=["object", "category"]).columns.tolist()

    numeric_columns = [
        col for col in numeric_columns
        if not is_id_column(col) and df[col].nunique() > 1
    ]

    categorical_columns = [
        col for col in categorical_columns
        if 1 < df[col].nunique() <= 20
    ]

    recommendations = []

    if categorical_columns:
        col = categorical_columns[0]
        recommendations.append({
            "chart_type": "bar_chart",
            "columns": [col],
            "reason": f"{col} has limited categories, so a bar chart can show category counts."
        })

    if numeric_columns:
        col = numeric_columns[0]
        recommendations.append({
            "chart_type": "histogram",
            "columns": [col],
            "reason": f"{col} is numeric, so a histogram can show distribution."
        })

    if len(numeric_columns) >= 2:
        recommendations.append({
            "chart_type": "scatter_plot",
            "columns": [numeric_columns[0], numeric_columns[1]],
            "reason": f"{numeric_columns[0]} and {numeric_columns[1]} are numeric, so a scatter plot can show relationship."
        })

    return {
        "total_recommendations": len(recommendations),
        "recommended_visualizations": recommendations[:3]
    }