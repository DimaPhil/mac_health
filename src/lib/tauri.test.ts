import { describe, it, expect, vi, beforeEach } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import {
  getRamInfo,
  getTopMemoryProcesses,
  purgeMemoryWithAdmin,
  forceQuitProcess,
  getCpuInfo,
  getTopCpuProcesses,
  getSystemUptime,
  openActivityMonitor,
  getBatteryInfo,
  openEnergySettings,
  getDiskInfo,
  getStorageCategories,
  refreshStorageCategories,
  openStorageSettings,
  openSystemSettings,
  updateTrayStatus,
} from "./tauri";

// Mock Tauri invoke
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

describe("tauri lib", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("RAM commands", () => {
    it("getRamInfo calls invoke with correct command", async () => {
      vi.mocked(invoke).mockResolvedValue({ used_bytes: 1000 });
      await getRamInfo();
      expect(invoke).toHaveBeenCalledWith("get_ram_info");
    });

    it("getTopMemoryProcesses calls invoke with count", async () => {
      vi.mocked(invoke).mockResolvedValue([]);
      await getTopMemoryProcesses(5);
      expect(invoke).toHaveBeenCalledWith("get_top_memory_processes", {
        count: 5,
      });
    });

    it("purgeMemoryWithAdmin calls invoke", async () => {
      vi.mocked(invoke).mockResolvedValue({ success: true });
      await purgeMemoryWithAdmin();
      expect(invoke).toHaveBeenCalledWith("purge_memory_with_admin");
    });

    it("forceQuitProcess calls invoke with pid", async () => {
      vi.mocked(invoke).mockResolvedValue({ success: true });
      await forceQuitProcess(1234);
      expect(invoke).toHaveBeenCalledWith("force_quit_process", { pid: 1234 });
    });
  });

  describe("CPU commands", () => {
    it("getCpuInfo calls invoke with correct command", async () => {
      vi.mocked(invoke).mockResolvedValue({ total_usage_percentage: 25 });
      await getCpuInfo();
      expect(invoke).toHaveBeenCalledWith("get_cpu_info");
    });

    it("getTopCpuProcesses calls invoke with count", async () => {
      vi.mocked(invoke).mockResolvedValue([]);
      await getTopCpuProcesses(8);
      expect(invoke).toHaveBeenCalledWith("get_top_cpu_processes", {
        count: 8,
      });
    });

    it("getSystemUptime calls invoke", async () => {
      vi.mocked(invoke).mockResolvedValue(86400);
      const result = await getSystemUptime();
      expect(invoke).toHaveBeenCalledWith("get_system_uptime");
      expect(result).toBe(86400);
    });

    it("openActivityMonitor calls invoke", async () => {
      vi.mocked(invoke).mockResolvedValue(undefined);
      await openActivityMonitor();
      expect(invoke).toHaveBeenCalledWith("open_activity_monitor");
    });
  });

  describe("Battery commands", () => {
    it("getBatteryInfo calls invoke", async () => {
      vi.mocked(invoke).mockResolvedValue({ percentage: 85 });
      await getBatteryInfo();
      expect(invoke).toHaveBeenCalledWith("get_battery_info");
    });

    it("openEnergySettings calls invoke", async () => {
      vi.mocked(invoke).mockResolvedValue(undefined);
      await openEnergySettings();
      expect(invoke).toHaveBeenCalledWith("open_energy_settings");
    });
  });

  describe("Disk commands", () => {
    it("getDiskInfo calls invoke", async () => {
      vi.mocked(invoke).mockResolvedValue({ primary: {} });
      await getDiskInfo();
      expect(invoke).toHaveBeenCalledWith("get_disk_info");
    });

    it("getStorageCategories calls invoke", async () => {
      vi.mocked(invoke).mockResolvedValue({ categories: [] });
      await getStorageCategories();
      expect(invoke).toHaveBeenCalledWith("get_storage_categories");
    });

    it("refreshStorageCategories calls invoke", async () => {
      vi.mocked(invoke).mockResolvedValue({ categories: [] });
      await refreshStorageCategories();
      expect(invoke).toHaveBeenCalledWith("refresh_storage_categories");
    });

    it("openStorageSettings calls invoke", async () => {
      vi.mocked(invoke).mockResolvedValue(undefined);
      await openStorageSettings();
      expect(invoke).toHaveBeenCalledWith("open_storage_settings");
    });

    it("openSystemSettings calls invoke with panel", async () => {
      vi.mocked(invoke).mockResolvedValue(undefined);
      await openSystemSettings("full-disk-access");
      expect(invoke).toHaveBeenCalledWith("open_system_settings", {
        panel: "full-disk-access",
      });
    });
  });

  describe("Tray commands", () => {
    it("updateTrayStatus calls invoke with status", async () => {
      vi.mocked(invoke).mockResolvedValue(undefined);
      await updateTrayStatus("excellent");
      expect(invoke).toHaveBeenCalledWith("update_tray_status", {
        status: "excellent",
      });
    });

    it("updateTrayStatus handles different statuses", async () => {
      vi.mocked(invoke).mockResolvedValue(undefined);

      await updateTrayStatus("could-be-better");
      expect(invoke).toHaveBeenCalledWith("update_tray_status", {
        status: "could-be-better",
      });

      await updateTrayStatus("critical");
      expect(invoke).toHaveBeenCalledWith("update_tray_status", {
        status: "critical",
      });
    });
  });
});
