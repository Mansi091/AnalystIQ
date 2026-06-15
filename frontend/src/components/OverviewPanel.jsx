import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";

function OverviewPanel({ pipelineData }) {
  if (!pipelineData) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-slate-550">Total Rows</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 font-mono">{pipelineData.basic_details.rows}</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-slate-550">Total Columns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 font-mono">{pipelineData.basic_details.columns}</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-slate-550">Duplicate Rows</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 font-mono">{pipelineData.basic_details.duplicate_rows}</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-slate-550">Quality Issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 font-mono">{pipelineData.quality_issues.total_issues}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schema Table */}
        <Card className="bg-white border-slate-200 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base text-slate-900">Dataset Schema Overview</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[300px] overflow-y-auto">
            <table className="w-full text-left text-sm text-slate-800">
              <thead className="bg-slate-50 text-slate-650 text-xs font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Column Name</th>
                  <th className="p-2.5">Data Type</th>
                  <th className="p-2.5">Missing Values</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pipelineData.basic_details.column_names.map((col) => (
                  <tr key={col}>
                    <td className="p-2.5 font-mono text-xs text-slate-900 truncate">{col}</td>
                    <td className="p-2.5 text-xs">
                      <span className="px-2 py-0.5 rounded-none bg-slate-100 border border-slate-200 text-slate-600 text-[10px]">
                        {pipelineData.basic_details.dtypes[col] || "object"}
                      </span>
                    </td>
                    <td className="p-2.5 text-xs font-mono text-slate-550">
                      {pipelineData.basic_details.missing_values[col] || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Quality Alerts & Clean Steps */}
        <div className="space-y-6">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-slate-900">Auto-Cleaning Logs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-700 max-h-[120px] overflow-y-auto">
              {pipelineData.cleaning.actions_applied.length === 0 ? (
                <p className="text-slate-500">No cleaning steps needed.</p>
              ) : (
                pipelineData.cleaning.actions_applied.map((act, idx) => (
                  <div key={idx} className="flex items-start space-x-1">
                    <span className="text-emerald-600">✓</span>
                    <span>{act}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default OverviewPanel;
