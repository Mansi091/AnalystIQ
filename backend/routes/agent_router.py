import os
import pickle
import pandas as pd
from fastapi import APIRouter
from pydantic import BaseModel

from config import MODELS_DIR, CLEANED_DIR, UPLOAD_DIR
from agents.analyst_agent import data_analyst_agent
from tools.upload_tool_data import create_basic_details
from tools.quality_checking_tool import analyze_quality_and_recommend_cleaning
from tools.cleaning_data_tool import apply_cleaning, remove_outliers
from tools.visualize_tool import suggest_visuals
from tools.ml_tool import ml_model_selection
from tools.flaml_ml_tool import train_with_flaml
from tools.report_generation_tool import generate_markdown_report

router = APIRouter(
    prefix="/agent",
    tags=["Data Analyst Agent"]
)

class AgentRequest(BaseModel):
    filename: str
    question: str

class AnalyzeRequest(BaseModel):
    filename: str

class TrainRequest(BaseModel):
    filename: str
    target_column: str
    time_budget_seconds: int = 30

class RemoveOutliersRequest(BaseModel):
    filename: str

class ReportRequest(BaseModel):
    filename: str
    target_column: str = None
    cleaning_actions: list = None
    trained_model_info: dict = None

@router.post("/ask")
def ask_agent(request: AgentRequest):
    from fastapi.responses import StreamingResponse

    user_message = f"Filename: {request.filename}\n\nUser question:\n{request.question}"

    config = {
        "configurable": {
            "thread_id": request.filename
        }
    }

    def event_generator():
        events = data_analyst_agent.stream(
            {"messages": [{"role": "user", "content": user_message}]},
            config=config,
            stream_mode="messages"
        )

        for chunk, metadata in events:
            if metadata.get("langgraph_node") == "model" and chunk.content:
                yield chunk.content

    return StreamingResponse(event_generator(), media_type="text/plain")

@router.post("/analyze")
def analyze_dataset(request: AnalyzeRequest):
    basic = create_basic_details.func(request.filename)
    if "error" in basic:
        return {"error": basic["error"]}
    quality = analyze_quality_and_recommend_cleaning.func(request.filename)
    cleaned = apply_cleaning.func(request.filename)
    if "error" in cleaned:
        return {"error": cleaned["error"]}
    cleaned_filename = cleaned["cleaned_filename"]
    visuals = suggest_visuals.func(cleaned_filename)
    ml_recs = ml_model_selection.func(cleaned_filename)
    return {
        "basic_details": basic,
        "quality_issues": quality,
        "cleaning": cleaned,
        "visuals": visuals,
        "ml_recommendations": ml_recs,
        "cleaned_filename": cleaned_filename
    }

@router.post("/train")
def train_model(request: TrainRequest):
    return train_with_flaml.func(
        filename=request.filename,
        target_column=request.target_column,
        time_budget_seconds=request.time_budget_seconds
    )

@router.post("/remove-outliers")
def remove_outliers_endpoint(request: RemoveOutliersRequest):
    return remove_outliers.func(request.filename)

@router.post("/report")
def generate_report(request: ReportRequest):
    return generate_markdown_report.func(
        filename=request.filename,
        target_column=request.target_column,
        cleaning_actions=request.cleaning_actions,
        trained_model_info=request.trained_model_info
    )

class PredictRequest(BaseModel):
    model_filename: str
    input_data: dict

@router.post("/predict")
def predict_model(request: PredictRequest):
    try:
        model_path = os.path.join(MODELS_DIR, request.model_filename)
        if not os.path.exists(model_path):
            return {"error": f"Model file '{request.model_filename}' not found."}
        with open(model_path, "rb") as f:
            model = pickle.load(f)
        df_input = pd.DataFrame([request.input_data])
        prediction = model.predict(df_input)
        val = prediction[0]
        result = val.item() if hasattr(val, "item") else str(val)
        return {"prediction": result}
    except Exception as e:
        return {"error": f"Prediction failed: {str(e)}"}

@router.get("/data/{filename}")
def get_dataset_data(filename: str):
    try:
        from tools.upload_tool_data import load_dataframe
        df = load_dataframe(filename).fillna("")
        return {
            "columns": df.columns.tolist(),
            "data": df.head(500).to_dict(orient="records")
        }
    except Exception as e:
        return {"error": f"Failed to read data: {str(e)}"}