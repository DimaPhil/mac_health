import { useEffect, useState } from "react";
import { BackButton } from "../../components/ui";
import { CircularProgress } from "../../components/charts";
import { useSystemStore } from "../../store/systemStore";
import { formatGB, formatBytes } from "../../lib/formatters";
import {
  getTopMemoryProcesses,
  purgeMemoryWithAdmin,
  forceQuitProcess,
} from "../../lib/tauri";
import type { ProcessMemoryInfo } from "../../types";

export function MemoryDetail() {
  const ram = useSystemStore((s) => s.ram);
  const refreshAll = useSystemStore((s) => s.refreshAll);
  const [processes, setProcesses] = useState<ProcessMemoryInfo[]>([]);
  const [cleaning, setCleaning] = useState(false);
  const [cleanResult, setCleanResult] = useState<string | null>(null);
  const [killingPid, setKillingPid] = useState<number | null>(null);

  const loadProcesses = () => {
    getTopMemoryProcesses(8).then(setProcesses).catch(console.error);
  };

  useEffect(() => {
    loadProcesses();
  }, []);

  const handleFreeUp = async () => {
    setCleaning(true);
    setCleanResult(null);
    try {
      const result = await purgeMemoryWithAdmin();
      if (result.success) {
        const freedMB = (result.freed_bytes / (1024 * 1024)).toFixed(1);
        setCleanResult(`Freed ${freedMB} MB`);
        // Refresh data after cleanup
        await refreshAll();
        loadProcesses();
      } else {
        setCleanResult(result.message);
      }
    } catch (error) {
      setCleanResult("Failed to free memory");
      console.error(error);
    } finally {
      setCleaning(false);
      // Clear result after 3 seconds
      setTimeout(() => setCleanResult(null), 3000);
    }
  };

  const handleForceQuit = async (pid: number, name: string) => {
    if (!confirm(`Force quit "${name}"?`)) return;

    setKillingPid(pid);
    try {
      const result = await forceQuitProcess(pid);
      if (result.success) {
        setCleanResult(`Terminated ${name}`);
        // Refresh process list
        setTimeout(loadProcesses, 500);
      } else {
        setCleanResult(result.message);
      }
    } catch (error) {
      setCleanResult("Failed to terminate process");
      console.error(error);
    } finally {
      setKillingPid(null);
      setTimeout(() => setCleanResult(null), 3000);
    }
  };

  const percentage = ram?.used_percentage ?? 0;
  const pressureLevel = ram?.pressure_level ?? "normal";
  const totalBytes = ram?.total_bytes ?? 0;

  const pressureColor = {
    normal: "text-health-excellent",
    warn: "text-health-warning",
    critical: "text-health-critical",
  }[pressureLevel];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="px-4 pt-4 pb-3 flex items-center gap-3">
        <BackButton />
        <h1 className="text-lg font-semibold">Memory</h1>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 pb-4 space-y-4 overflow-y-auto">
        {/* Pressure Gauge */}
        <div className="card flex items-center gap-4">
          <CircularProgress
            value={percentage}
            size={80}
            strokeWidth={8}
            gradientId="memory-detail-gradient"
            gradientColors={["#3b82f6", "#8b5cf6"]}
          >
            <span className="text-xl font-bold">{Math.round(percentage)}%</span>
          </CircularProgress>
          <div>
            <div className="text-sm text-white/60">Memory Pressure</div>
            <div
              className={`text-lg font-semibold capitalize ${pressureColor}`}
            >
              {pressureLevel}
            </div>
            <div className="text-sm text-white/40">
              {formatGB(ram?.used_bytes ?? 0)} /{" "}
              {formatGB(ram?.total_bytes ?? 0)}
            </div>
          </div>
        </div>

        {/* Quick Clean Button */}
        <button
          onClick={handleFreeUp}
          disabled={cleaning}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {cleaning ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Cleaning...
            </>
          ) : (
            <>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 21h5v-5" />
              </svg>
              Quick Clean
            </>
          )}
        </button>

        {/* Clean Result Toast */}
        {cleanResult && (
          <div className="bg-white/10 rounded-lg px-4 py-2 text-center text-sm">
            {cleanResult}
          </div>
        )}

        {/* Memory Breakdown */}
        <div className="card">
          <h2 className="text-sm font-medium text-white/60 mb-3">Breakdown</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Used</span>
              <span>{formatGB(ram?.used_bytes ?? 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Available</span>
              <span>{formatGB(ram?.available_bytes ?? 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Total</span>
              <span>{formatGB(ram?.total_bytes ?? 0)}</span>
            </div>
          </div>
        </div>

        {/* Top Processes */}
        <div className="card">
          <h2 className="text-sm font-medium text-white/60 mb-3">
            Top Memory Consumers
          </h2>
          <div className="space-y-3">
            {processes.map((process) => {
              const memoryPercent =
                totalBytes > 0 ? (process.memory_bytes / totalBytes) * 100 : 0;

              return (
                <div key={process.pid} className="group" title={process.path}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate flex-1 mr-2">{process.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white/60 shrink-0">
                        {formatBytes(process.memory_bytes)}
                      </span>
                      <button
                        onClick={() =>
                          handleForceQuit(process.pid, process.name)
                        }
                        disabled={killingPid === process.pid}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                        title="Force Quit"
                      >
                        {killingPid === process.pid ? (
                          <svg
                            className="w-4 h-4 animate-spin"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                        ) : (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-red-400"
                          >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                      style={{ width: `${Math.min(memoryPercent * 5, 100)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-white/40 mt-0.5">
                    {memoryPercent.toFixed(1)}% of total RAM
                  </div>
                </div>
              );
            })}
            {processes.length === 0 && (
              <div className="text-sm text-white/40">Loading...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
