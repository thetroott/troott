interface AnalyticsLineChartProps {
    points: { date: string; value: number }[];
}

function formatAxisDate(iso: string): string {
    const d = new Date(`${iso}T12:00:00`);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function AnalyticsLineChart({ points }: AnalyticsLineChartProps) {
    const width = 741;
    const height = 223;
    const padding = { top: 8, right: 8, bottom: 24, left: 32 };
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;
    const maxValue = Math.max(100, ...points.map((p) => p.value), 1);
    const yTicks = [0, 20, 40, 60, 80, 100].filter((t) => t <= maxValue || maxValue <= 100);

    const coords = points.map((p, i) => {
        const x =
            padding.left +
            (points.length <= 1 ? 0 : (i / (points.length - 1)) * innerW);
        const y =
            padding.top + innerH - (p.value / maxValue) * innerH;
        return { x, y, ...p };
    });

    const polyline = coords.map((c) => `${c.x},${c.y}`).join(' ');

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-[260px] w-full"
            role="img"
            aria-label="Plays over time"
        >
            {yTicks.map((tick) => {
                const y = padding.top + innerH - (tick / maxValue) * innerH;
                return (
                    <g key={tick}>
                        <line
                            x1={padding.left}
                            y1={y}
                            x2={width - padding.right}
                            y2={y}
                            stroke="#545454"
                            strokeOpacity={0.5}
                        />
                        <text
                            x={padding.left - 6}
                            y={y + 4}
                            textAnchor="end"
                            className="fill-[#eaeaea] text-[10px]"
                        >
                            {tick}
                        </text>
                    </g>
                );
            })}
            <polyline
                fill="none"
                stroke="#7086fd"
                strokeWidth={2}
                points={polyline}
            />
            {coords.map((c) => (
                <circle
                    key={c.date}
                    cx={c.x}
                    cy={c.y}
                    r={3}
                    fill="#7086fd"
                />
            ))}
            {coords.map((c, i) => {
                if (points.length > 14 && i % 2 !== 0 && i !== points.length - 1) {
                    return null;
                }
                return (
                    <text
                        key={`label-${c.date}`}
                        x={c.x}
                        y={height - 4}
                        textAnchor="middle"
                        className="fill-[#eaeaea] text-[10px]"
                    >
                        {formatAxisDate(c.date)}
                    </text>
                );
            })}
        </svg>
    );
}
