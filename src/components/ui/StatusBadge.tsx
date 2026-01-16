import type { SystemStatus } from "../../types";

interface StatusBadgeProps {
  status: SystemStatus;
}

const statusConfig = {
  excellent: {
    label: "Excellent",
    className: "status-badge-excellent",
  },
  "could-be-better": {
    label: "Could Be Better",
    className: "status-badge-warning",
  },
  critical: {
    label: "Critical",
    className: "status-badge-critical",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return <span className={config.className}>{config.label}</span>;
}
