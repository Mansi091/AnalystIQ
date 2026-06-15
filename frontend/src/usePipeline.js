import { useState, useEffect } from "react";
import { analyzeDataset, trainModel, generateReport, getDatasetData, clearSession } from "./api";

const initialSession = {
  filename: "",
  cleanedFilename: "",
  pipelineData: null,
  gridData: null,
  targetColumn: "",
  trainedModel: null,
  reportResult: null,
  reportMarkdown: "",
};

export function usePipeline() {
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem("da_session");
    return saved ? JSON.parse(saved) : initialSession;
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [training, setTraining] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("da_active_tab") || "overview");

  useEffect(() => {
    localStorage.setItem("da_session", JSON.stringify(session));
    localStorage.setItem("da_active_tab", activeTab);
  }, [session, activeTab]);

  const handleUploadSuccess = async (uploadedName) => {
    setAnalyzing(true);
    setSession({ ...initialSession, filename: uploadedName });
    setActiveTab("overview");

    try {
      const data = await analyzeDataset(uploadedName);
      if (data.error) {
        alert("Pipeline failed: " + data.error);
        setAnalyzing(false);
        return;
      }
      const grid = await getDatasetData(data.cleaned_filename);
      const suggestedTarget = data.ml_recommendations?.automl_recommendation?.[0]?.possible_target_column || "";

      setSession({
        filename: uploadedName,
        cleanedFilename: data.cleaned_filename,
        pipelineData: data,
        gridData: grid,
        targetColumn: suggestedTarget,
        trainedModel: null,
        reportResult: null,
        reportMarkdown: "",
      });
    } catch (error) {
      console.error(error);
      alert("Failed to execute data pipeline.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTrainModel = async () => {
    if (!session.targetColumn) return;
    setTraining(true);
    try {
      const result = await trainModel(session.cleanedFilename, session.targetColumn);
      if (result.error) {
        alert("Training failed: " + result.error);
      } else {
        setSession(s => ({ ...s, trainedModel: result }));
        alert("Model training successfully completed");
      }
    } catch (error) {
      console.error(error);
      alert("Training error.");
    } finally {
      setTraining(false);
    }
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const actions = session.pipelineData?.cleaning?.actions_applied || [];
      const result = await generateReport(session.filename, session.targetColumn, actions, session.trainedModel);
      if (result.error) {
        alert("Report generation failed: " + result.error);
      } else {
        const res = await fetch(`http://127.0.0.1:8000/download/report/${result.report_filename}`);
        const text = await res.text();
        setSession(s => ({ ...s, reportResult: result, reportMarkdown: text }));
      }
    } catch (error) {
      console.error(error);
      alert("Failed to compile report.");
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleClearSession = async () => {
    if (session.filename) {
      try {
        await clearSession(session.filename);
      } catch (error) {
        console.error("Failed to delete session files:", error);
      }
    }
    localStorage.clear();
    setSession(initialSession);
    setActiveTab("overview");
  };

  return {
    ...session,
    analyzing,
    training,
    generatingReport,
    activeTab,
    setActiveTab,
    setTargetColumn: (col) => setSession(s => ({ ...s, targetColumn: col })),
    setTrainedModel: (m) => setSession(s => ({ ...s, trainedModel: m })),
    handleUploadSuccess,
    handleTrainModel,
    handleGenerateReport,
    handleClearSession,
  };
}
