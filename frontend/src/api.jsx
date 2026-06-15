import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

export async function uploadDataset(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(`${API_BASE_URL}/upload/`, formData);
  return response.data;
}

export async function askAgent(filename, question) {
  const response = await axios.post(`${API_BASE_URL}/agent/ask`, {
    filename,
    question,
  });
  return response.data;
}

export async function analyzeDataset(filename) {
  const response = await axios.post(`${API_BASE_URL}/agent/analyze`, {
    filename,
  });
  return response.data;
}

export async function trainModel(filename, targetColumn, timeBudgetSeconds = 30) {
  const response = await axios.post(`${API_BASE_URL}/agent/train`, {
    filename,
    target_column: targetColumn,
    time_budget_seconds: timeBudgetSeconds,
  });
  return response.data;
}

export async function generateReport(filename, targetColumn, cleaningActions, trainedModelInfo) {
  const response = await axios.post(`${API_BASE_URL}/agent/report`, {
    filename,
    target_column: targetColumn,
    cleaning_actions: cleaningActions,
    trained_model_info: trainedModelInfo,
  });
  return response.data;
}

export async function predictModel(modelFilename, inputData) {
  const response = await axios.post(`${API_BASE_URL}/agent/predict`, {
    model_filename: modelFilename,
    input_data: inputData,
  });
  return response.data;
}

export async function getDatasetData(filename) {
  const response = await axios.get(`${API_BASE_URL}/agent/data/${filename}`);
  return response.data;
}

export async function clearSession(filename) {
  const response = await axios.post(`${API_BASE_URL}/upload/clear-session`, {
    filename,
  });
  return response.data;
}