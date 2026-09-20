import { useId } from "react";

type LineChartProps = {
  ariaLabel: string;
  height?: number;
  labels?: string[];
  values: number[];
};

const WIDTH = 600;
const PAD = { bottom: 22, left: 12, right: 12, top: 14 };

// Catmull-Rom -> cubic Bezier so the line is smooth without a chart library.
function smoothPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return "";
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return path;
}

// Single-series line + soft gradient area with a dot per point.
export function LineChart({ ariaLabel, height = 140, labels, values }: LineChartProps) {
  const gradientId = `line-fill-${useId().replace(/:/g, "")}`;
  const plotW = WIDTH - PAD.left - PAD.right;
  const plotH = height - PAD.top - PAD.bottom;
  const max = Math.max(1, ...values);
  const stepX = values.length > 1 ? plotW / (values.length - 1) : 0;
  const points = values.map((value, index) => ({
    x: PAD.left + index * stepX,
    y: PAD.top + plotH - (value / max) * plotH,
  }));
  const line = smoothPath(points);
  const baseline = PAD.top + plotH;
  const area = points.length > 0 ? `${line} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z` : "";

  return (
    <svg aria-label={ariaLabel} className="h-auto w-full" role="img" viewBox={`0 0 ${WIDTH} ${height}`}>
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--color-brand-500)" stopOpacity="0.25" />
          <stop offset="1" stopColor="var(--color-brand-500)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line stroke="var(--color-line)" x1={PAD.left} x2={WIDTH - PAD.right} y1={baseline} y2={baseline} />
      {area && <path d={area} fill={`url(#${gradientId})`} />}
      {line && <path d={line} fill="none" stroke="var(--color-brand-600)" strokeLinecap="round" strokeWidth="2.5" />}
      {points.map((point, index) => (
        <circle cx={point.x} cy={point.y} fill="#fff" key={index} r={3.5} stroke="var(--color-brand-600)" strokeWidth="2">
          <title>{`${labels?.[index] ?? index + 1}: ${values[index]}`}</title>
        </circle>
      ))}
      {labels?.map((label, index) => (
        <text fill="var(--color-ink-muted)" fontSize="10" key={`${label}-${index}`} textAnchor="middle" x={points[index]?.x ?? 0} y={height - 6}>
          {label}
        </text>
      ))}
    </svg>
  );
}
