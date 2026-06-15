import FileUploader from "./FileUploader";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

function Sidebar({
  handleUploadSuccess,
  analyzing,
  pipelineData,
  cleanedFilename,
  trainedModel,
  handleGenerateReport,
  generatingReport,
  reportResult,
}) {
  return (
    <aside className="w-full lg:w-80 flex flex-col space-y-6 shrink-0">
      <FileUploader onUploadSuccess={handleUploadSuccess} />

      {analyzing && (
        <Card className="bg-white border-teal-500 border animate-pulse">
          <CardContent className="p-6 text-center text-teal-650 text-sm font-semibold">
            Running initial analysis pipeline...
          </CardContent>
        </Card>
      )}

      {pipelineData && (
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Dataset Downloads
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 block font-medium">Cleaned Dataset:</span>
              <a
                href={`http://127.0.0.1:8000/download/cleaned/${cleanedFilename}`}
                download
                className="flex items-center justify-center w-full px-3 py-2 text-xs font-semibold rounded-none bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors"
              >
                Download Cleaned CSV
              </a>
            </div>

            {/* Generate or Download Analysis Report */}
            <div className="space-y-1.5 pt-3 border-t border-slate-100">
              <span className="text-[10px] text-slate-500 block font-medium">Analysis Report:</span>
              {!reportResult ? (
                <Button
                  onClick={handleGenerateReport}
                  disabled={generatingReport}
                  className="w-full text-xs py-1.5 h-8 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-none"
                >
                  {generatingReport ? "Compiling..." : "Generate Report"}
                </Button>
              ) : (
                <a
                  href={`http://127.0.0.1:8000/download/report/${reportResult.report_filename}`}
                  download
                  className="flex items-center justify-center w-full px-3 py-2 text-xs font-semibold rounded-none bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                >
                  Download Report (.md)
                </a>
              )}
            </div>

            {trainedModel && (
              <div className="space-y-1.5 pt-3 border-t border-slate-100">
                <span className="text-[10px] text-slate-500 block font-medium">Trained Model:</span>
                <a
                  href={`http://127.0.0.1:8000/download/model/${trainedModel.saved_model}`}
                  download
                  className="flex items-center justify-center w-full px-3 py-2 text-xs font-semibold rounded-none bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors"
                >
                  Download Model (.pkl)
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </aside>
  );
}

export default Sidebar;
