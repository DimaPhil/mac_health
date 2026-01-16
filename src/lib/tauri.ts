import { invoke } from "@tauri-apps/api/core";
import type {
  RamInfo,
  ProcessMemoryInfo,
  MemoryCleanResult,
  ForceQuitResult,
  CpuInfo,
  ProcessCpuInfo,
  BatteryInfo,
  DisksOverview,
  StorageCategories,
} from "../types";

// RAM commands
export async function getRamInfo(): Promise<RamInfo> {
  return invoke<RamInfo>("get_ram_info");
}

export async function getTopMemoryProcesses(
  count?: number
): Promise<ProcessMemoryInfo[]> {
  return invoke<ProcessMemoryInfo[]>("get_top_memory_processes", { count });
}

export async function purgeMemoryWithAdmin(): Promise<MemoryCleanResult> {
  return invoke<MemoryCleanResult>("purge_memory_with_admin");
}

export async function forceQuitProcess(pid: number): Promise<ForceQuitResult> {
  return invoke<ForceQuitResult>("force_quit_process", { pid });
}

// CPU commands
export async function getCpuInfo(): Promise<CpuInfo> {
  return invoke<CpuInfo>("get_cpu_info");
}

export async function getTopCpuProcesses(
  count?: number
): Promise<ProcessCpuInfo[]> {
  return invoke<ProcessCpuInfo[]>("get_top_cpu_processes", { count });
}

export async function getSystemUptime(): Promise<number> {
  return invoke<number>("get_system_uptime");
}

export async function openActivityMonitor(): Promise<void> {
  return invoke<void>("open_activity_monitor");
}

// Battery commands
export async function getBatteryInfo(): Promise<BatteryInfo> {
  return invoke<BatteryInfo>("get_battery_info");
}

export async function openEnergySettings(): Promise<void> {
  return invoke<void>("open_energy_settings");
}

// Disk commands
export async function getDiskInfo(): Promise<DisksOverview> {
  return invoke<DisksOverview>("get_disk_info");
}

export async function getStorageCategories(): Promise<StorageCategories> {
  return invoke<StorageCategories>("get_storage_categories");
}

export async function refreshStorageCategories(): Promise<StorageCategories> {
  return invoke<StorageCategories>("refresh_storage_categories");
}

export async function openStorageSettings(): Promise<void> {
  return invoke<void>("open_storage_settings");
}

export async function openSystemSettings(
  panel: "storage" | "privacy" | "accessibility" | "full-disk-access"
): Promise<void> {
  return invoke<void>("open_system_settings", { panel });
}

// Tray commands
export type SystemStatus = "excellent" | "could-be-better" | "critical";

export async function updateTrayStatus(status: SystemStatus): Promise<void> {
  return invoke<void>("update_tray_status", { status });
}
