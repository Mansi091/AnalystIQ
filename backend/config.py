import os

UPLOAD_DIR = "uploads"
CLEANED_DIR = "cleaned_data"
MODELS_DIR = "models"
REPORTS_DIR = "reports"

for folder in [UPLOAD_DIR, CLEANED_DIR, MODELS_DIR, REPORTS_DIR]:
    os.makedirs(folder, exist_ok=True)
