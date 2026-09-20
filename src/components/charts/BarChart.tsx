export type ChartSeries = { color: string; name: string; values: number[] };

type BarChartProps = {
  ariaLabel: string;
  height?: number;
  labels: string[];
  series: ChartSeries[];
};

const WIDTH = 600;
const PAD = { bottom: 24, left: 30, right: 8, top: 10 };

function niceMax(value: number) {
  if (value <= 5) return 5;
  const step = value <= 20 ? 5 : value <= 50 ? 10 : 25;
  return Math.ceil(value / step) * step;
}

// Grouped bar chart drawn as plain SVG (no chart dependency). One group per
// label, one bar per series.
export function BarChart({ ariaLabel, height = 200, labels, series }: BarChartProps) {
  const plotW = WIDTH - PAD.left - PAD.right;
  const plotH = height - PAD.top - PAD.bottom;
  const max = niceMax(Math.max(0, ...series.flatMap((item) => item.values)));
  const groupW = plotW / Math.max(labels.length, 1);
  const barW = Math.min((groupW * 0.72) / Math.max(series.length, 1), 22);
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg aria-label={ariaLabel} className="h-auto w-full" role="img" viewBox={`0 0 ${WIDTH} ${height}`}>
      {ticks.map((tick) => {
        const y = PAD.top + plotH - tick * plotH;
        return (
          <g key={tick}>
            <line stroke="var(--color-line)" strokeDasharray={tick === 0 ? undefined : "3 4"} x1={PAD.left} x2={WIDTH - PAD.right} y1={y} y2={y} />
            <text fill="var(--color-ink-muted)" fontSize="10" textAnchor="end" x={PAD.left - 6} y={y + 3}>
              {Math.round(tick * max)}
            </text>
          </g>
        );
      })}

      {labels.map((label, groupIndex) => {
        const groupX = PAD.left + groupIndex * groupW;
        const startX = groupX + (groupW - barW * series.length - 2 * (series.length - 1)) / 2;

        return (
          <g key={`${label}-${groupIndex}`}>
            {series.map((item, seriesIndex) => {
              const value = item.values[groupIndex] ?? 0;
              const barH = (value / max) * plotH;

              return (
                <rect
                  fill={item.color}
                  height={Math.max(barH, value > 0 ? 2 : 0)}
                  key={item.name}
                  rx={3}
                  width={barW}
                  x={startX + seriesIndex * (barW + 2)}
                  y={PAD.top + plotH - barH}
                >
                  <title>{`${item.name}: ${value}`}</title>
                </rect>
              );
            })}
            <text fill="var(--color-ink-muted)" fontSize="10" textAnchor="middle" x={groupX + groupW / 2} y={height - 7}>
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
