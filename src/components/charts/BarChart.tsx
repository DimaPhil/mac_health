interface BarChartProps {
  values: number[];
  maxValue?: number;
  height?: number;
  gradientColors?: [string, string];
  labels?: string[];
}

export function BarChart({
  values,
  maxValue = 100,
  height = 60,
  gradientColors = ["#3b82f6", "#8b5cf6"],
  labels,
}: BarChartProps) {
  const labelHeight = labels ? 16 : 0;
  const barAreaHeight = height - labelHeight;

  return (
    <div style={{ height }}>
      <div className="flex items-end gap-1" style={{ height: barAreaHeight }}>
        {values.map((value, index) => {
          const normalizedValue = Math.min(Math.max(value, 0), maxValue);
          const barHeight = (normalizedValue / maxValue) * barAreaHeight;

          return (
            <div key={index} className="flex-1 flex items-end justify-center">
              <div
                className="w-full rounded-t transition-all duration-300"
                style={{
                  height: Math.max(barHeight, 2),
                  background: `linear-gradient(to top, ${gradientColors[0]}, ${gradientColors[1]})`,
                }}
              />
            </div>
          );
        })}
      </div>
      {labels && (
        <div className="flex gap-1" style={{ height: labelHeight }}>
          {labels.map((label, index) => (
            <div key={index} className="flex-1 text-center">
              <span className="text-[10px] text-white/40">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
