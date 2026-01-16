// View types
export type ViewType = "dashboard" | "memory" | "storage" | "battery" | "cpu";
export type SystemStatus = "excellent" | "could-be-better" | "critical";

// RAM types
export interface RamInfo {
  total_bytes: number;
  used_bytes: number;
  available_bytes: number;
  used_percentage: number;
  pressure_level: "normal" | "warn" | "critical";
}

export interface ProcessMemoryInfo {
  pid: number;
  name: string;
  path: string;
  memory_bytes: number;
  memory_percentage: number;
}

export interface MemoryCleanResult {
  success: boolean;
  freed_bytes: number;
  message: string;
}

export interface ForceQuitResult {
  success: boolean;
  message: string;
}

// CPU types
export interface CpuInfo {
  model_name: string;
  total_cores: number;
  total_usage_percentage: number;
  per_core_usage: number[];
  load_average: LoadAverage;
}

export interface LoadAverage {
  one_minute: number;
  five_minutes: number;
  fifteen_minutes: number;
}

export interface ProcessCpuInfo {
  pid: number;
  name: string;
  cpu_percentage: number;
}

// Battery types
export interface BatteryInfo {
  percentage: number;
  is_charging: boolean;
  is_plugged_in: boolean;
  power_source: string;
  condition: string;
  max_capacity_percentage: number;
  cycle_count: number | null;
  time_to_full_minutes: number | null;
  time_to_empty_minutes: number | null;
  temperature_celsius: number | null;
  voltage_volts: number | null;
}

// Disk types
export interface DiskInfo {
  name: string;
  mount_point: string;
  total_bytes: number;
  available_bytes: number;
  used_bytes: number;
  used_percentage: number;
  file_system: string;
  is_removable: boolean;
}

export interface DisksOverview {
  primary: DiskInfo | null;
  all_disks: DiskInfo[];
  total_space_bytes: number;
  total_available_bytes: number;
  total_used_bytes: number;
  total_used_percentage: number;
}

export interface StorageCategory {
  name: string;
  bytes: number;
  color: string;
}

export interface StorageCategories {
  categories: StorageCategory[];
  total_categorized: number;
}
