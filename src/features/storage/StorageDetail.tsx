import { useEffect, useState } from "react";
import { BackButton } from "../../components/ui";
import { DonutChart } from "../../components/charts";
import { useSystemStore } from "../../store/systemStore";
import { formatGB, formatBytes } from "../../lib/formatters";
import { openStorageSettings, getStorageCategories } from "../../lib/tauri";
import type { StorageCategories } from "../../types";

export function StorageDetail() {
  const disk = useSystemStore((s) => s.disk);
  const primary = disk?.primary;
  const [categories, setCategories] = useState<StorageCategories | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use primary disk data (more accurate than aggregated totals)
  const totalBytes = primary?.total_bytes ?? 0;
  const availableBytes = primary?.available_bytes ?? 0;
  const usedBytes = primary?.used_bytes ?? 0;

  useEffect(() => {
    let mounted = true;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    const fetchCategories = async () => {
      try {
        const data = await getStorageCategories();
        if (mounted) {
          setCategories(data);

          // If we got empty data, poll for updates (background calculation in progress)
          if (data.categories.length === 0 && !pollInterval) {
            pollInterval = setInterval(async () => {
              const updated = await getStorageCategories();
              if (mounted && updated.categories.length > 0) {
                setCategories(updated);
                if (pollInterval) {
                  clearInterval(pollInterval);
                  pollInterval = null;
                }
              }
            }, 2000);
          }
        }
      } catch (err) {
        console.error("Failed to get storage categories:", err);
        if (mounted) {
          setError(String(err));
        }
      }
    };

    fetchCategories();

    return () => {
      mounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  const handleOpenSettings = async () => {
    try {
      await openStorageSettings();
    } catch (error) {
      console.error("Failed to open storage settings:", error);
    }
  };

  // Build donut chart segments from categories
  const segments =
    categories?.categories
      .filter((cat) => cat.bytes > 0)
      .sort((a, b) => b.bytes - a.bytes)
      .map((cat) => ({
        value: cat.bytes,
        color: cat.color,
        label: cat.name,
      })) ?? [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="px-4 pt-4 pb-3 flex items-center gap-3">
        <BackButton />
        <h1 className="text-lg font-semibold">Storage</h1>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 pb-4 space-y-4 overflow-y-auto">
        {/* Donut Chart */}
        <div className="card flex flex-col items-center py-4">
          <DonutChart
            segments={
              segments.length > 0
                ? segments
                : [{ value: usedBytes || 1, color: "#8b5cf6", label: "Used" }]
            }
            centerLabel="Available"
            centerValue={formatGB(availableBytes)}
            size={140}
            strokeWidth={18}
          />
          <div className="mt-3 text-center">
            <div className="text-sm text-white/60">
              {formatGB(totalBytes)} Total
            </div>
          </div>
        </div>

        {/* Storage Categories Legend */}
        <div className="card">
          <h2 className="text-sm font-medium text-white/60 mb-3">
            Storage Breakdown
          </h2>
          {error ? (
            <div className="text-sm text-red-400">
              Unable to analyze: {error}
            </div>
          ) : categories && categories.categories.length > 0 ? (
            <div className="space-y-2">
              {categories.categories
                .filter((cat) => cat.bytes > 0)
                .sort((a, b) => b.bytes - a.bytes)
                .map((category) => (
                  <div
                    key={category.name}
                    className="flex justify-between text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </span>
                    <span className="text-white/60">
                      {formatBytes(category.bytes)}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-sm text-white/40 flex items-center gap-2">
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
              Calculating folder sizes...
            </div>
          )}
        </div>

        {/* Primary Disk Info */}
        {primary && (
          <div className="card">
            <h2 className="text-sm font-medium text-white/60 mb-3">
              Primary Disk
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Name</span>
                <span>{primary.name || "Macintosh HD"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">File System</span>
                <span>{primary.file_system}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Used</span>
                <span>{formatGB(primary.used_bytes)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Available</span>
                <span>{formatGB(primary.available_bytes)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button onClick={handleOpenSettings} className="btn-primary w-full">
          Open Storage Settings
        </button>
      </div>
    </div>
  );
}
