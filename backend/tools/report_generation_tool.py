import os
from langchain_core.tools import tool
from tools.upload_tool_data import create_basic_details
from tools.quality_checking_tool import analyze_quality_and_recommend_cleaning
from tools.visualize_tool import suggest_visuals

from config import REPORTS_DIR


@tool
def generate_markdown_report(
    filename: str,
    target_column: str = None,
    cleaning_actions: list = None,
    trained_model_info: dict = None
) -> dict:
    """
    Generate a comprehensive markdown report for the uploaded dataset.
    Includes overview, quality recommendations, visualization suggestions, and model training results.
    """
    try:
        #fetch data characteristics
        basic = create_basic_details.func(filename)
        quality = analyze_quality_and_recommend_cleaning.func(filename)
        visuals = suggest_visuals.func(filename)
    except Exception as e:
        return {"error": f"Failed to gather dataset details: {str(e)}"}

    report_filename = f"report_{os.path.splitext(filename)[0]}.md"
    report_path = os.path.join(REPORTS_DIR, report_filename)

    content = f"""# Dataset Analysis Report

## Source File
`{filename}`

---

##dataset overview
- **Rows:** {basic["rows"]}
- **Columns:** {basic["columns"]}
- **Duplicate Rows:** {basic["duplicate_rows"]}

---

##columns
| Column Name | Data Type | Missing Values |
|---|---|---|
"""

    for column in basic["column_names"]:
        dtype = basic["dtypes"].get(column, "unknown")
        missing = basic["missing_values"].get(column, 0)
        content += f"| {column} | {dtype} | {missing} |\n"

    content += """
---

##data quality
"""

    issues = quality.get("issues_and_recommendations", [])
    if not issues:
        content += "No major data quality issues were found.\n"
    else:
        for issue in issues:
            content += f"""
### {issue.get("issue_type", "Issue").replace("_", " ").title()}
- **Column:** {issue.get("column", "N/A")}
- **Issue:** {issue.get("issue", "N/A")}
- **Recommendation:** {issue.get("recommendation", "N/A")}
"""

    content += """
---

##data cleaning
"""
    if cleaning_actions:
        for action in cleaning_actions:
            content += f"- {action}\n"
    else:
        content += "No automatic cleaning actions have been applied yet.\n"

    content += """
---

##recommended visuals
"""

    recommended_visuals = visuals.get("recommended_visualizations", [])
    if not recommended_visuals:
        content += "No visualization recommendations available.\n"
    else:
        for chart in recommended_visuals:
            cols = ", ".join(chart.get("columns", []))
            content += f"""
### {chart.get("chart_type", "chart").replace("_", " ").title()}
- **Columns:** {cols}
- **Reason:** {chart.get("reason", "N/A")}
"""

    content += """
---

##ml models
"""
    if trained_model_info:
        content += f"""
- **Suggested Target Column:** {target_column or 'N/A'}
- **Task Type:** {trained_model_info.get('task_type', 'N/A').title()}
- **Best Model Found:** {trained_model_info.get('best_algorithm', 'N/A')}
- **Evaluation Score ({trained_model_info.get('metric', 'Metric')}):** {trained_model_info.get('score', 'N/A')}
- **Saved Model File Name:** {trained_model_info.get('saved_model', 'N/A')}
"""
    else:
        content += "No machine learning model has been trained for this dataset yet.\n"

    content += """
---

##summary
This report provides an automated analysis of the uploaded dataset. 
You can use the recommended visualization schemas to understand distribution patterns or deploy the trained model for prediction.
"""

    with open(report_path, "w", encoding="utf-8") as f:
        f.write(content)

    return {
        "message": "Markdown report generated successfully",
        "report_filename": report_filename,
        "saved_path": report_path
    }
