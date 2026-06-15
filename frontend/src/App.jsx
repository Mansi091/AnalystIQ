import ChatBox from "./components/ChatBox";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { usePipeline } from "./usePipeline";

const EmptyState = () => (
  <div className="bg-white border border-slate-200 text-center p-12 w-full rounded-none shadow-sm">
    <h3 className="font-semibold text-base text-slate-950">No Dataset Active</h3>
  </div>
);

function App() {
  const {
    filename,
    cleanedFilename,
    analyzing,
    pipelineData,
    gridData,
    trainedModel,
    generatingReport,
    reportResult,
    handleUploadSuccess,
    handleGenerateReport,
    handleClearSession,
  } = usePipeline();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      <Header handleClearSession={handleClearSession} hasActiveDataset={!!pipelineData} />

      <div className="flex-grow flex flex-col lg:flex-row p-6 gap-6 max-w-7xl mx-auto w-full">
        <Sidebar
          handleUploadSuccess={handleUploadSuccess}
          analyzing={analyzing}
          pipelineData={pipelineData}
          cleanedFilename={cleanedFilename}
          trainedModel={trainedModel}
          handleGenerateReport={handleGenerateReport}
          generatingReport={generatingReport}
          reportResult={reportResult}
        />

        <section className="flex-grow flex flex-col min-w-0">
          <div className="flex-grow min-h-0">
            {pipelineData ? (
              <ChatBox filename={filename} pipelineData={pipelineData} gridData={gridData} />
            ) : (
              <EmptyState />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;