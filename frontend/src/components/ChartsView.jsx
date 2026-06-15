import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import BarChartSVG from "./BarChartSVG";
import ScatterChartSVG from "./ScatterChartSVG";

function ChartsView({ recommendations, datasetData }) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const charts = recommendations?.recommended_visualizations || [];
  const activeChart = charts[selectedIdx];

  const chartData = useMemo(() => {
    if (!activeChart || !datasetData || datasetData.length === 0) return [];
    const type = activeChart.chart_type;
    const cols = activeChart.columns;

    if (type === "bar_chart" && cols.length >= 1) {
      const col = cols[0];
      const counts = {};
      datasetData.forEach((row) => {
        const val = row[col] !== null ? String(row[col]) : "null";
        counts[val] = (counts[val] || 0) + 1;
      });
      return Object.entries(counts).map(([name, count]) => ({ name, count }));
    }

    if (type === "histogram" && cols.length >= 1) {
      const col = cols[0];
      const vals = datasetData.map((row) => Number(row[col])).filter((val) => !isNaN(val));
      if (vals.length === 0) return [];
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const binCount = 8;
      const step = (max - min) / binCount || 1;

      const bins = Array.from({ length: binCount }, (_, i) => ({
        name: `${(min + i * step).toFixed(1)}-${(min + (i + 1) * step).toFixed(1)}`,
        count: 0,
      }));
      vals.forEach((v) => {
        const idx = Math.min(Math.floor((v - min) / step), binCount - 1);
        if (idx >= 0 && idx < binCount) bins[idx].count++;
      });
      return bins;
    }

    if (type === "scatter_plot" && cols.length >= 2) {
      const xCol = cols[0];
      const yCol = cols[1];
      return datasetData.map((row) => ({
        x: Number(row[xCol]),
        y: Number(row[yCol]),
      }));
    }
    return [];
  }, [activeChart, datasetData]);

  if (charts.length === 0) {
    return (
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="p-6 text-center text-slate-500">
          No chart recommendations available.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white border-slate-200 shadow-sm">
      <CardHeader className="space-y-3">
        <CardTitle className="text-base text-slate-900">Recommended Visualizations</CardTitle>
        <div className="flex flex-wrap gap-2">
          {charts.map((chart, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIdx(idx)}
              className={`px-3 py-1 rounded-none text-xs transition-colors border ${
                selectedIdx === idx
                  ? "bg-slate-900 border-slate-900 text-white"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {chart.chart_type.replace("_", " ")} ({chart.columns.join(", ")})
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {activeChart && <p className="text-xs text-slate-550 italic">{activeChart.reason}</p>}

        <div className="h-[300px] w-full bg-slate-50 p-4 rounded-none border border-slate-200">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">Failed to build chart data</div>
          ) : activeChart.chart_type === "bar_chart" || activeChart.chart_type === "histogram" ? (
            <BarChartSVG chartData={chartData} />
          ) : (
            <ScatterChartSVG
              chartData={chartData}
              xColumn={activeChart.columns[0]}
              yColumn={activeChart.columns[1]}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ChartsView;
