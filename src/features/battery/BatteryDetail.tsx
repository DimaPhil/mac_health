import { BackButton, StatCard } from "../../components/ui";
import { CircularProgress } from "../../components/charts";
import { useSystemStore } from "../../store/systemStore";
import { formatTimeRemaining } from "../../lib/formatters";
import { openEnergySettings } from "../../lib/tauri";

// Icons
function HeartIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-pink-400"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-blue-400"
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 21h5v-5" />
    </svg>
  );
}

export function BatteryDetail() {
  const battery = useSystemStore((s) => s.battery);

  const percentage = battery?.percentage ?? 0;
  const isCharging = battery?.is_charging ?? false;
  const condition = battery?.condition ?? "Unknown";

  // Choose gradient based on battery level
  let gradientColors: [string, string] = ["#22c55e", "#14b8a6"];
  if (percentage < 20) {
    gradientColors = ["#ef4444", "#f97316"];
  } else if (percentage < 50) {
    gradientColors = ["#f59e0b", "#eab308"];
  }

  const conditionColor =
    condition === "Normal"
      ? "text-health-excellent"
      : condition === "Service Recommended"
        ? "text-health-warning"
        : "text-health-critical";

  const handleOpenEnergySettings = async () => {
    try {
      await openEnergySettings();
    } catch (error) {
      console.error("Failed to open energy settings:", error);
    }
  };

  if (!battery) {
    return (
      <div className="flex flex-col h-full">
        <header className="px-4 pt-4 pb-3 flex items-center gap-3">
          <BackButton />
          <h1 className="text-lg font-semibold">Battery</h1>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white/40">
            <div className="text-lg mb-2">No Battery Detected</div>
            <div className="text-sm">This Mac doesn't have a battery</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="px-4 pt-4 pb-3 flex items-center gap-3">
        <BackButton />
        <h1 className="text-lg font-semibold">Battery</h1>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 pb-4 space-y-4 overflow-y-auto">
        {/* Main Status */}
        <div className="card flex items-center gap-4">
          <CircularProgress
            value={percentage}
            size={80}
            strokeWidth={8}
            gradientId="battery-detail-gradient"
            gradientColors={gradientColors}
          >
            <span className="text-xl font-bold">{Math.round(percentage)}%</span>
          </CircularProgress>
          <div>
            <div className="text-sm text-white/60">Battery Status</div>
            <div className="text-lg font-semibold flex items-center gap-2">
              {isCharging && (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-health-excellent"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              )}
              {isCharging ? "Charging" : battery.power_source}
            </div>
            <div className="text-sm text-white/40">
              {isCharging
                ? formatTimeRemaining(battery.time_to_full_minutes)
                  ? `${formatTimeRemaining(battery.time_to_full_minutes)} to full`
                  : "Calculating..."
                : formatTimeRemaining(battery.time_to_empty_minutes)
                  ? `${formatTimeRemaining(battery.time_to_empty_minutes)} remaining`
                  : "Calculating..."}
            </div>
          </div>
        </div>

        {/* Health & Cycles Cards */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<HeartIcon />}
            label="Health"
            value={`${Math.round(battery.max_capacity_percentage)}%`}
            iconBgColor="bg-pink-500/20"
          />
          <StatCard
            icon={<RefreshIcon />}
            label="Cycles"
            value={battery.cycle_count?.toString() ?? "--"}
            iconBgColor="bg-blue-500/20"
          />
        </div>

        {/* Condition */}
        <div className="card">
          <h2 className="text-sm font-medium text-white/60 mb-3">Condition</h2>
          <div className="flex justify-between items-center">
            <span className="text-white/60">Battery Condition</span>
            <span className={`font-medium ${conditionColor}`}>{condition}</span>
          </div>
        </div>

        {/* Additional Info */}
        <div className="card">
          <h2 className="text-sm font-medium text-white/60 mb-3">
            Additional Info
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Power Source</span>
              <span>{battery.power_source}</span>
            </div>
            {battery.temperature_celsius && (
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Temperature</span>
                <span>{battery.temperature_celsius.toFixed(1)}°C</span>
              </div>
            )}
            {battery.voltage_volts && (
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Voltage</span>
                <span>{battery.voltage_volts.toFixed(2)} V</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleOpenEnergySettings}
          className="btn-primary w-full"
        >
          Open Energy Settings
        </button>
      </div>
    </div>
  );
}
