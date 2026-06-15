import { useState } from "react";

function ScatterChartSVG({ chartData, xColumn, yColumn, svgWidth = 600, svgHeight = 300 }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const topMargin = 30;
  const rightMargin = 30;
  const bottomMargin = 50;
  const leftMargin = 55;

  const plotWidth = svgWidth - leftMargin - rightMargin;
  const plotHeight = svgHeight - topMargin - bottomMargin;

  if (chartData.length === 0) return null;

  const xVals = chartData.map((p) => p.x);
  const yVals = chartData.map((p) => p.y);

  let rawMinX = Math.min(...xVals);
  let rawMaxX = Math.max(...xVals);
  let rawMinY = Math.min(...yVals);
  let rawMaxY = Math.max(...yVals);

  const xRange = (rawMaxX - rawMinX) || 1;
  const yRange = (rawMaxY - rawMinY) || 1;

  const minX = rawMinX - xRange * 0.08;
  const maxX = rawMaxX + xRange * 0.08;
  const minY = rawMinY - yRange * 0.08;
  const maxY = rawMaxY + yRange * 0.08;

  const scaleX = maxX - minX;
  const scaleY = maxY - minY;

  const yGrid = Array.from({ length: 5 }, (_, i) => {
    const val = minY + (i / 4) * scaleY;
    const y = topMargin + plotHeight - (i / 4) * plotHeight;
    return { val, y };
  });

  const xGrid = Array.from({ length: 5 }, (_, i) => {
    const val = minX + (i / 4) * scaleX;
    const x = leftMargin + (i / 4) * plotWidth;
    return { val, x };
  });

  return (
    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full">
      {/* Horizontal Grid */}
      {yGrid.map((tick, idx) => (
        <g key={idx}>
          <line x1={leftMargin} y1={tick.y} x2={svgWidth - rightMargin} y2={tick.y} stroke="#e2e8f0" strokeDasharray="3 3" />
          <text x={leftMargin - 10} y={tick.y + 4} textAnchor="end" fill="#64748b" fontSize={9} className="font-mono">{tick.val.toFixed(1)}</text>
        </g>
      ))}

      {/* Vertical Ticks */}
      {xGrid.map((tick, idx) => (
        <g key={idx}>
          <line x1={tick.x} y1={topMargin} x2={tick.x} y2={topMargin + plotHeight} stroke="#e2e8f0" strokeOpacity={0.5} />
          <text x={tick.x} y={topMargin + plotHeight + 15} textAnchor="middle" fill="#64748b" fontSize={9} className="font-mono">{tick.val.toFixed(1)}</text>
        </g>
      ))}

      {/* Dots */}
      {chartData.map((d, idx) => {
        const cx = leftMargin + ((d.x - minX) / scaleX) * plotWidth;
        const cy = topMargin + plotHeight - ((d.y - minY) / scaleY) * plotHeight;
        const isHovered = hoveredPoint === idx;

        return (
          <circle
            key={idx}
            cx={cx}
            cy={cy}
            r={isHovered ? 7 : 4}
            fill={isHovered ? "#be123c" : "#e11d48"}
            fillOpacity={isHovered ? 1.0 : 0.7}
            stroke={isHovered ? "#fff" : "none"}
            strokeWidth={1}
            onMouseEnter={() => setHoveredPoint(idx)}
            onMouseLeave={() => setHoveredPoint(null)}
            className="transition-all cursor-pointer"
          />
        );
      })}

      {/* Axes */}
      <line x1={leftMargin} y1={topMargin + plotHeight} x2={svgWidth - rightMargin} y2={topMargin + plotHeight} stroke="#cbd5e1" strokeWidth={1.5} />
      <line x1={leftMargin} y1={topMargin} x2={leftMargin} y2={topMargin + plotHeight} stroke="#cbd5e1" strokeWidth={1.5} />

      {/* Hover Tooltip */}
      {hoveredPoint !== null && (
        <text x={svgWidth / 2} y={topMargin - 10} textAnchor="middle" fill="#be123c" fontSize={11} className="font-semibold">
          {xColumn}: {chartData[hoveredPoint].x.toFixed(2)}, {yColumn}: {chartData[hoveredPoint].y.toFixed(2)}
        </text>
      )}
    </svg>
  );
}

export default ScatterChartSVG;
