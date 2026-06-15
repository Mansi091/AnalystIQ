from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import os

from config import CLEANED_DIR, MODELS_DIR, REPORTS_DIR

router = APIRouter(
    prefix="/download",
    tags=["Download"]
)


def send_file(folder: str, filename: str, error_message: str):
    file_path = os.path.join(folder, filename)

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail=error_message
        )

    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/octet-stream"
    )


@router.get("/cleaned/{filename}")
def download_cleaned_file(filename: str):
    return send_file(
        CLEANED_DIR,
        filename,
        "Cleaned file not found"
    )


@router.get("/model/{filename}")
def download_trained_model(filename: str):
    return send_file(
        MODELS_DIR,
        filename,
        "Trained model file not found"
    )


@router.get("/report/{filename}")
def download_report_file(filename: str):
    return send_file(
        REPORTS_DIR,
        filename,
        "Report file not found"
    )