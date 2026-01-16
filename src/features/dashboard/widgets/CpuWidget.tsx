import { CircularProgress } from "../../../components/charts";
import type { CpuInfo } from "../../../types";

interface CpuWidgetProps {
  data: CpuInfo | null;
  onClick: () => void;
}

export function CpuWidget({ data, onClick }: CpuWidgetProps) {
  const percentage = data?.total_usage_percentage ?? 0;
  const modelName = data?.model_name ?? "Unknown";

  // Shorten model name for display
  const shortModelName = modelName
    .replace("Apple ", "")
    .replace("Intel(R) Core(TM) ", "")
    .split(" ")[0];

  return (
    <button
      className="widget-card flex flex-col items-center gap-3"
      onClick={onClick}
      aria-label={`CPU: ${Math.round(percentage)}% usage. ${modelName}. Click for details.`}
    >
      <div className="text-sm font-medium text-white/60">CPU</div>
      <CircularProgress
        value={percentage}
        size={72}
        strokeWidth={6}
        gradientId="cpu-gradient"
        gradientColors={["#ec4899", "#8b5cf6"]}
      >
        <span className="text-lg font-semibold">{Math.round(percentage)}%</span>
      </CircularProgress>
      <div className="text-center">
        <div className="text-sm font-medium">{shortModelName}</div>
        <div className="text-xs text-white/40">
          {data?.total_cores ?? "--"} cores
        </div>
      </div>
    </button>
  );
}
