import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";

function ModelTrainingPanel({
  pipelineData,
  targetColumn,
  setTargetColumn,
  handleTrainModel,
  training,
  trainedModel,
  setTrainedModel,
}) {
  if (!pipelineData) return null;

  return (
    <div className="space-y-6">
      {!trainedModel ? (
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-slate-900">AutoML Model Training</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-w-md">
            <div className="space-y-2">
              <label className="text-xs text-slate-600 block font-semibold">
                Target Column:
              </label>
              <select
                value={targetColumn}
                onChange={(e) => setTargetColumn(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-none bg-white border border-slate-200 text-slate-850 focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                <option value="">-- Choose Target --</option>
                {pipelineData.basic_details.column_names.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={handleTrainModel}
              disabled={training || !targetColumn}
              className="w-full bg-slate-900 hover:bg-slate-850 text-white font-semibold"
            >
              {training ? "Training ML Model..." : "Train ML Model"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="max-w-md w-full mx-auto">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-slate-100">
              <CardTitle className="text-base text-slate-900">Model Evaluation</CardTitle>
              <Button
                variant="outline"
                onClick={() => setTrainedModel(null)}
                className="text-xs h-7 px-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
              >
                Train New Model
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 text-sm">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 text-xs">Best Model:</span>
                  <strong className="text-teal-700 font-bold font-mono">{trainedModel.best_algorithm}</strong>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-100">
                  <span className="text-slate-500 text-xs">Accuracy / Score:</span>
                  <strong className="text-emerald-700 font-bold font-mono">{trainedModel.score}</strong>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-slate-500 text-xs font-semibold block">Best Hyperparameters:</span>
                  <pre className="text-[10px] text-slate-800 bg-slate-50 p-2.5 rounded-none border border-slate-200 max-h-40 overflow-y-auto font-mono whitespace-pre-wrap">
                    {JSON.stringify(trainedModel.best_hyperparameters, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`http://127.0.0.1:8000/download/model/${trainedModel.saved_model}`}
                  download
                  className="flex items-center justify-center w-full px-4 py-2 text-sm font-semibold rounded-none bg-slate-900 hover:bg-slate-850 text-white transition-colors"
                >
                  Download Model (.pkl)
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ModelTrainingPanel;
