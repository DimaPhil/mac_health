import type { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  iconBgColor?: string;
}

export function StatCard({
  icon,
  label,
  value,
  iconBgColor = "bg-blue-500/20",
}: StatCardProps) {
  return (
    <div className="card flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBgColor}`}
      >
        {icon}
      </div>
      <div>
        <div className="text-xs text-white/50">{label}</div>
        <div className="text-lg font-semibold">{value}</div>
      </div>
    </div>
  );
}
