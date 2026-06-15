import { useState } from "react";

function BarChartSVG({ chartData, svgWidth = 600, svgHeight = 300 }) {
  const [hoveredBar, setHoveredBar] = useState(null);

  const topMargin = 30;
  const rightMargin = 30;
  const bottomMargin = 50;
  const leftMargin = 55;

  const plotWidth = svgWidth - leftMargin - rightMargin;
  const plotHeight = svgHeight - topMargin - bottomMargin;

  if (chartData.length === 0) return null;
  const maxCount = Math.max(...chartData.map((d) => d.count), 1);
  const n = chartData.length;
  const colWidth = plotWidth / n;
  const barWidth = colWidth * 0.7;
  const gap = colWidth * 0.3;

  const yTicks = 4;
  const yTickLines = Array.from({ length: yTicks }, (_, i) => {
    const val = Math.round((maxCount * i) / (yTicks - 1));
    const y = topMargin + plotHeight - (i / (yTicks - 1)) * plotHeight;
    return { val, y };
  });

  return (
    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full">
      {yTickLines.map((tick, idx) => (
        <g key={idx}>
          <line x1={leftMargin} y1={tick.y} x2={svgWidth - rightMargin} y2={tick.y} stroke="#e2e8f0" strokeDasharray="3 3" />
          <text x={leftMargin - 10} y={tick.y + 4} textAnchor="end" fill="#64748b" fontSize={10} className="font-mono">{tick.val}</text>
        </g>
      ))}

      {chartData.map((d, idx) => {
        const x = leftMargin + idx * colWidth + gap / 2;
        const h = (d.count / maxCount) * plotHeight;
        const y = topMargin + plotHeight - h;
        const isHovered = hoveredBar === idx;

        return (
          <g key={idx}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={h}
              fill={isHovered ? "#0f766e" : "#0d9488"}
              rx={2}
              onMouseEnter={() => setHoveredBar(idx)}
              onMouseLeave={() => setHoveredBar(null)}
              className="transition-colors cursor-pointer"
            />
            <text x={x + barWidth / 2} y={topMargin + plotHeight + 18} textAnchor="middle" fill="#64748b" fontSize={9}>
              {d.name.length > 10 ? d.name.slice(0, 8) + ".." : d.name}
            </text>
          </g>
        );
      })}

      <line x1={leftMargin} y1={topMargin + plotHeight} x2={svgWidth - rightMargin} y2={topMargin + plotHeight} stroke="#cbd5e1" strokeWidth={1.5} />
      <line x1={leftMargin} y1={topMargin} x2={leftMargin} y2={topMargin + plotHeight} stroke="#cbd5e1" strokeWidth={1.5} />

      {hoveredBar !== null && (
        <text x={svgWidth / 2} y={topMargin - 10} textAnchor="middle" fill="#0f766e" fontSize={11} className="font-semibold">
          {chartData[hoveredBar].name}: {chartData[hoveredBar].count} occurrences
        </text>
      )}
    </svg>
  );
}

export default BarChartSVG;
