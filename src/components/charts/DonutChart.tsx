interface Segment {
  value: number;
  color: string;
  label: string;
}

interface DonutChartProps {
  segments: Segment[];
  centerLabel: string;
  centerValue: string;
  size?: number;
  strokeWidth?: number;
}

export function DonutChart({
  segments,
  centerLabel,
  centerValue,
  size = 140,
  strokeWidth = 16,
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate total and normalize segments
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);
  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-white/40">No data</span>
      </div>
    );
  }

  // Build segment arcs
  let cumulativePercent = 0;
  const segmentArcs = segments.map((segment) => {
    const percent = segment.value / total;
    const startPercent = cumulativePercent;
    cumulativePercent += percent;

    return {
      ...segment,
      startPercent,
      percent,
    };
  });

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />

        {/* Segment arcs */}
        {segmentArcs.map((segment, index) => {
          const dashLength = segment.percent * circumference;
          const dashOffset = segment.startPercent * circumference;
          const gapSize = segments.length > 1 ? 4 : 0;

          return (
            <circle
              key={index}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashLength - gapSize} ${circumference}`}
              strokeDashoffset={-dashOffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          );
        })}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs text-white/50 uppercase tracking-wide">
          {centerLabel}
        </span>
        <span className="text-xl font-bold">{centerValue}</span>
      </div>
    </div>
  );
}
