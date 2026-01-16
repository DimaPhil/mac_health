import { CircularProgress } from "../../../components/charts";
import { formatGB } from "../../../lib/formatters";
import type { RamInfo } from "../../../types";

interface RamWidgetProps {
  data: RamInfo | null;
  onClick: () => void;
}

export function RamWidget({ data, onClick }: RamWidgetProps) {
  const percentage = data?.used_percentage ?? 0;
  const usedGb = data ? formatGB(data.used_bytes) : "-- GB";
  const totalGb = data ? formatGB(data.total_bytes) : "-- GB";

  return (
    <button
      className="widget-card flex flex-col items-center gap-3"
      onClick={onClick}
      aria-label={`RAM: ${usedGb} of ${totalGb} used. Click for details.`}
    >
      <div className="text-sm font-medium text-white/60">RAM</div>
      <CircularProgress
        value={percentage}
        size={72}
        strokeWidth={6}
        gradientId="ram-gradient"
        gradientColors={["#3b82f6", "#8b5cf6"]}
      >
        <span className="text-lg font-semibold">{Math.round(percentage)}%</span>
      </CircularProgress>
      <div className="text-center">
        <div className="text-sm font-medium">{usedGb}</div>
        <div className="text-xs text-white/40">of {totalGb}</div>
      </div>
    </button>
  );
}
