from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
import os
import uuid
import shutil

from config import UPLOAD_DIR, CLEANED_DIR, MODELS_DIR, REPORTS_DIR

router = APIRouter(
    prefix="/upload"
)

class ClearSessionRequest(BaseModel):
    filename: str

@router.post("/")
async def upload_file(file: UploadFile = File(...)):
    filename = file.filename.lower()

    if not filename.endswith((".csv", ".xlsx", ".xls")):
        raise HTTPException(
            status_code=400,
            detail="Only csv, xlsx, xls files are allowed"
        )

    unique_filename = f"{uuid.uuid4()}_{filename}"
    file_path = f"{UPLOAD_DIR}/{unique_filename}"

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    return {
        "message": "File uploaded successfully",
        "filename": unique_filename
    }

@router.post("/clear-session")
async def clear_session(payload: ClearSessionRequest):
    filename = payload.filename
    if not filename:
        raise HTTPException(status_code=400, detail="Filename is required")

    parts = filename.split("_", 1)
    if not parts or len(parts) < 2:
        raise HTTPException(status_code=400, detail="Invalid filename format")
    uuid_prefix = parts[0]

    deleted_files = []
    folders = [UPLOAD_DIR, CLEANED_DIR, MODELS_DIR, REPORTS_DIR]

    for folder in folders:
        if not os.path.exists(folder):
            continue
        for item in os.listdir(folder):
            if item.startswith(uuid_prefix) or (uuid_prefix in item):
                file_path = os.path.join(folder, item)
                try:
                    if os.path.isdir(file_path):
                        shutil.rmtree(file_path)
                    else:
                        os.remove(file_path)
                    deleted_files.append(item)
                except Exception as e:
                    print(f"Error removing {file_path}: {e}")

    return {
        "status": "success",
        "message": f"Deleted {len(deleted_files)} files related to session",
        "deleted_files": deleted_files
    }