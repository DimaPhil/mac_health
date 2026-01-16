import { useEffect, useState } from "react";
import { BackButton } from "../../components/ui";
import { GaugeChart, BarChart } from "../../components/charts";
import { useSystemStore } from "../../store/systemStore";
import { formatUptime } from "../../lib/formatters";
import {
  getTopCpuProcesses,
  getSystemUptime,
  openActivityMonitor,
} from "../../lib/tauri";
import type { ProcessCpuInfo } from "../../types";

export function CpuDetail() {
  const cpu = useSystemStore((s) => s.cpu);
  const [processes, setProcesses] = useState<ProcessCpuInfo[]>([]);
  const [uptime, setUptime] = useState<number>(0);

  useEffect(() => {
    getTopCpuProcesses(8).then(setProcesses).catch(console.error);
    getSystemUptime().then(setUptime).catch(console.error);
  }, []);

  const percentage = cpu?.total_usage_percentage ?? 0;
  const modelName = cpu?.model_name ?? "Unknown";

  const handleOpenActivityMonitor = async () => {
    try {
      await openActivityMonitor();
    } catch (error) {
      console.error("Failed to open Activity Monitor:", error);
    }
  };

  // Generate labels for cores
  const coreLabels = cpu?.per_core_usage?.map((_, i) => String(i + 1)) ?? [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="px-4 pt-4 pb-3 flex items-center gap-3">
        <BackButton />
        <h1 className="text-lg font-semibold">CPU</h1>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 pb-4 space-y-4 overflow-y-auto">
        {/* Main Gauge */}
        <div className="card flex flex-col items-center py-4">
          <GaugeChart
            value={percentage}
            size={140}
            strokeWidth={14}
            gradientColors={["#ec4899", "#8b5cf6"]}
            label="USAGE"
          />
          <div className="mt-2 text-center">
            <div className="text-sm text-white/60">{modelName}</div>
            <div className="text-xs text-white/40">
              {cpu?.total_cores ?? "--"} cores
            </div>
          </div>
        </div>

        {/* Per-Core Usage */}
        {cpu?.per_core_usage && cpu.per_core_usage.length > 0 && (
          <div className="card">
            <h2 className="text-sm font-medium text-white/60 mb-3">
              Per-Core Usage
            </h2>
            <BarChart
              values={cpu.per_core_usage}
              maxValue={100}
              height={60}
              gradientColors={["#ec4899", "#8b5cf6"]}
              labels={coreLabels}
            />
          </div>
        )}

        {/* System Info */}
        <div className="card">
          <h2 className="text-sm font-medium text-white/60 mb-3">
            System Info
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Uptime</span>
              <span>{formatUptime(uptime)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Load Average (1m)</span>
              <span>{cpu?.load_average.one_minute.toFixed(2) ?? "--"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Load Average (5m)</span>
              <span>{cpu?.load_average.five_minutes.toFixed(2) ?? "--"}</span>
            </div>
          </div>
        </div>

        {/* Top Processes */}
        <div className="card">
          <h2 className="text-sm font-medium text-white/60 mb-3">
            Top CPU Consumers
          </h2>
          <div className="space-y-2">
            {processes.map((process) => (
              <div
                key={process.pid}
                className="flex items-center justify-between text-sm"
              >
                <span className="truncate flex-1 mr-2">{process.name}</span>
                <span className="text-white/60 shrink-0">
                  {process.cpu_percentage.toFixed(1)}%
                </span>
              </div>
            ))}
            {processes.length === 0 && (
              <div className="text-sm text-white/40">Loading...</div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleOpenActivityMonitor}
          className="btn-primary w-full"
        >
          Open Activity Monitor
        </button>
      </div>
    </div>
  );
}
