import { useSystemStore } from "../../store/systemStore";
import { StatusBadge } from "../../components/ui";
import { RamWidget, DiskWidget, BatteryWidget, CpuWidget } from "./widgets";

export function Dashboard() {
  const navigate = useSystemStore((s) => s.navigate);
  const overallStatus = useSystemStore((s) => s.overallStatus);
  const ram = useSystemStore((s) => s.ram);
  const disk = useSystemStore((s) => s.disk);
  const battery = useSystemStore((s) => s.battery);
  const cpu = useSystemStore((s) => s.cpu);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="px-4 pt-4 pb-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Mac Health</h1>
        <StatusBadge status={overallStatus} />
      </header>

      {/* Widget Grid */}
      <div className="flex-1 px-4 pb-4">
        <div className="grid grid-cols-2 gap-3 h-full">
          <RamWidget data={ram} onClick={() => navigate("memory")} />
          <DiskWidget data={disk} onClick={() => navigate("storage")} />
          <BatteryWidget data={battery} onClick={() => navigate("battery")} />
          <CpuWidget data={cpu} onClick={() => navigate("cpu")} />
        </div>
      </div>
    </div>
  );
}
