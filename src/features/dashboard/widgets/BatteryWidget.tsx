import { CircularProgress } from "../../../components/charts";
import type { BatteryInfo } from "../../../types";

interface BatteryWidgetProps {
  data: BatteryInfo | null;
  onClick: () => void;
}

export function BatteryWidget({ data, onClick }: BatteryWidgetProps) {
  const percentage = data?.percentage ?? 0;
  const isCharging = data?.is_charging ?? false;
  const condition = data?.condition ?? "Unknown";

  // Choose gradient based on battery level
  let gradientColors: [string, string] = ["#22c55e", "#14b8a6"];
  if (percentage < 20) {
    gradientColors = ["#ef4444", "#f97316"];
  } else if (percentage < 50) {
    gradientColors = ["#f59e0b", "#eab308"];
  }

  return (
    <button
      className="widget-card flex flex-col items-center gap-3"
      onClick={onClick}
      aria-label={`Battery: ${Math.round(percentage)}%. ${isCharging ? "Charging." : ""} Click for details.`}
    >
      <div className="text-sm font-medium text-white/60">BATTERY</div>
      <CircularProgress
        value={percentage}
        size={72}
        strokeWidth={6}
        gradientId="battery-gradient"
        gradientColors={gradientColors}
      >
        <span className="text-lg font-semibold">{Math.round(percentage)}%</span>
      </CircularProgress>
      <div className="text-center">
        <div className="text-sm font-medium flex items-center justify-center gap-1">
          {isCharging && (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-health-excellent"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          )}
          {condition}
        </div>
        <div className="text-xs text-white/40">
          {isCharging ? "Charging" : (data?.power_source ?? "--")}
        </div>
      </div>
    </button>
  );
}
