interface GaugeChartProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  gradientColors?: [string, string];
  label?: string;
}

export function GaugeChart({
  value,
  size = 120,
  strokeWidth = 12,
  gradientColors = ["#3b82f6", "#8b5cf6"],
  label = "USAGE",
}: GaugeChartProps) {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  // Semi-circle arc (180 degrees, from left to right)
  const normalizedValue = Math.min(Math.max(value, 0), 100);

  const gradientId = `gauge-gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 20} className="overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={gradientColors[0]} />
            <stop offset="100%" stopColor={gradientColors[1]} />
          </linearGradient>
        </defs>

        {/* Background arc */}
        <path
          d={describeArc(center, center, radius, 180, 360)}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Progress arc */}
        <path
          d={describeArc(
            center,
            center,
            radius,
            180,
            180 + (normalizedValue / 100) * 180
          )}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="transition-all duration-500"
        />

        {/* Center value */}
        <text
          x={center}
          y={center + 5}
          textAnchor="middle"
          className="fill-white text-2xl font-bold"
          style={{ fontSize: size * 0.2 }}
        >
          {Math.round(normalizedValue)}%
        </text>

        {/* Label */}
        <text
          x={center}
          y={center + 20}
          textAnchor="middle"
          className="fill-white/50 text-xs"
          style={{ fontSize: size * 0.08 }}
        >
          {label}
        </text>
      </svg>
    </div>
  );
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");
}
