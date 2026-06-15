# 📊 AnalystIQ

AnalystIQ is an interactive automated Data Science platform that combines a data-cleaning pipeline, AutoML, and an AI-powered conversational analyst. Upload tabular datasets, perform quick diagnostics, automatically train models, and chat with your data in real-time.

---

## 🚀 Key Features

* **Data Cleaning:** Auto-imputes missing values, resolves duplicates, and filters statistical outliers.
* **Data Diagnostics:** Flags missing values, duplicates, redundant features, and outlier distributions on upload.
* **AutoML Engine:** Uses FLAML to automatically classify ML tasks and train optimized models within a 30-second budget.
* **AI Chatbot:** Chat naturally with your data (powered by LangChain & LangGraph with Groq Llama-3.1).
* **Automated Reports:** Recommends charts and generates downloadable Markdown summaries of your datasets.

---

## 🛠️ Technology Stack

* **Backend:** FastAPI, LangChain, LangGraph, FLAML, Scikit-Learn, Pandas.
* **Frontend:** React (Vite), Tailwind CSS, Axios.

---

## 💻 Getting Started

### 1. Setup Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and install dependencies:
   ```bash
   uv venv
   .venv/Scripts/activate
   uv pip install -r requirements.txt
   ```
3. Create a `.env` file and add your Groq API Key:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```
4. Start the server:
   ```bash
   uv run uvicorn main:app --reload
   ```

### 2. Setup Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies and run the server:
   ```bash
   npm install
   npm run dev
   ```
