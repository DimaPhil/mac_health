import { CircularProgress } from "../../../components/charts";
import { formatGB } from "../../../lib/formatters";
import type { DisksOverview } from "../../../types";

interface DiskWidgetProps {
  data: DisksOverview | null;
  onClick: () => void;
}

export function DiskWidget({ data, onClick }: DiskWidgetProps) {
  // Use primary disk data for accurate display
  const primary = data?.primary;
  const percentage = primary?.used_percentage ?? 0;
  const freeGb = primary ? formatGB(primary.available_bytes) : "-- GB";
  const totalGb = primary ? formatGB(primary.total_bytes) : "-- GB";

  return (
    <button
      className="widget-card flex flex-col items-center gap-3"
      onClick={onClick}
      aria-label={`Disk: ${freeGb} free of ${totalGb}. Click for details.`}
    >
      <div className="text-sm font-medium text-white/60">DISK</div>
      <CircularProgress
        value={percentage}
        size={72}
        strokeWidth={6}
        gradientId="disk-gradient"
        gradientColors={["#f59e0b", "#ef4444"]}
      >
        <span className="text-lg font-semibold">{Math.round(percentage)}%</span>
      </CircularProgress>
      <div className="text-center">
        <div className="text-sm font-medium">{freeGb} free</div>
        <div className="text-xs text-white/40">of {totalGb}</div>
      </div>
    </button>
  );
}
