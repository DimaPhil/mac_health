import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSystemStore } from "./systemStore";

// Mock Tauri APIs
vi.mock("../lib/tauri", () => ({
  getRamInfo: vi.fn().mockResolvedValue({
    total_bytes: 17179869184,
    used_bytes: 10737418240,
    available_bytes: 6442450944,
    used_percentage: 62.5,
    pressure_level: "normal",
  }),
  getCpuInfo: vi.fn().mockResolvedValue({
    model_name: "Apple M3",
    total_cores: 8,
    total_usage_percentage: 25.0,
    per_core_usage: [20, 30, 25, 22, 15, 18, 20, 25],
    load_average: { one_minute: 1.5, five_minutes: 1.2, fifteen_minutes: 1.0 },
  }),
  getBatteryInfo: vi.fn().mockResolvedValue({
    percentage: 85,
    is_charging: false,
    is_plugged_in: false,
    power_source: "Battery",
    condition: "Normal",
    max_capacity_percentage: 96,
    cycle_count: 150,
  }),
  getDiskInfo: vi.fn().mockResolvedValue({
    primary: {
      name: "Macintosh HD",
      total_bytes: 500107862016,
      available_bytes: 150000000000,
      used_bytes: 350107862016,
      used_percentage: 70,
    },
    total_used_percentage: 70,
  }),
}));

describe("systemStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    useSystemStore.setState({
      currentView: "dashboard",
      previousView: null,
      ram: null,
      cpu: null,
      battery: null,
      disk: null,
      lastUpdated: null,
      isLoading: false,
      error: null,
      overallStatus: "excellent",
    });
    vi.clearAllMocks();
  });

  describe("navigation", () => {
    it("navigate changes view and stores previous", () => {
      const store = useSystemStore.getState();
      store.navigate("memory");

      const state = useSystemStore.getState();
      expect(state.currentView).toBe("memory");
      expect(state.previousView).toBe("dashboard");
    });

    it("goBack returns to previous view", () => {
      const store = useSystemStore.getState();
      store.navigate("memory");
      store.goBack();

      const state = useSystemStore.getState();
      expect(state.currentView).toBe("dashboard");
      expect(state.previousView).toBe(null);
    });

    it("goBack returns to dashboard when no previous", () => {
      const store = useSystemStore.getState();
      store.goBack();

      const state = useSystemStore.getState();
      expect(state.currentView).toBe("dashboard");
    });
  });

  describe("setters", () => {
    it("setRam updates ram state", () => {
      const store = useSystemStore.getState();
      const ramData = {
        total_bytes: 17179869184,
        used_bytes: 10737418240,
        available_bytes: 6442450944,
        used_percentage: 62.5,
        pressure_level: "normal" as const,
      };
      store.setRam(ramData);

      const state = useSystemStore.getState();
      expect(state.ram).toEqual(ramData);
    });

    it("setCpu updates cpu state", () => {
      const store = useSystemStore.getState();
      const cpuData = {
        model_name: "Apple M3",
        total_cores: 8,
        total_usage_percentage: 25.0,
        per_core_usage: [20, 30, 25, 22, 15, 18, 20, 25],
        load_average: {
          one_minute: 1.5,
          five_minutes: 1.2,
          fifteen_minutes: 1.0,
        },
      };
      store.setCpu(cpuData);

      const state = useSystemStore.getState();
      expect(state.cpu).toEqual(cpuData);
    });

    it("setBattery updates battery state", () => {
      const store = useSystemStore.getState();
      const batteryData = {
        percentage: 85,
        is_charging: false,
        is_plugged_in: false,
        power_source: "Battery",
        condition: "Normal",
        max_capacity_percentage: 96,
        cycle_count: 150,
        time_to_full_minutes: null,
        time_to_empty_minutes: 180,
        temperature_celsius: null,
        voltage_volts: null,
      };
      store.setBattery(batteryData);

      const state = useSystemStore.getState();
      expect(state.battery).toEqual(batteryData);
    });

    it("setDisk updates disk state", () => {
      const store = useSystemStore.getState();
      const diskData = {
        primary: {
          name: "Macintosh HD",
          mount_point: "/",
          total_bytes: 500107862016,
          available_bytes: 150000000000,
          used_bytes: 350107862016,
          used_percentage: 70,
          file_system: "APFS",
          is_removable: false,
        },
        all_disks: [],
        total_space_bytes: 500107862016,
        total_available_bytes: 150000000000,
        total_used_bytes: 350107862016,
        total_used_percentage: 70,
      };
      store.setDisk(diskData);

      const state = useSystemStore.getState();
      expect(state.disk).toEqual(diskData);
    });

    it("setError updates error state", () => {
      const store = useSystemStore.getState();
      store.setError("Something went wrong");

      const state = useSystemStore.getState();
      expect(state.error).toBe("Something went wrong");
    });
  });

  describe("refreshAll", () => {
    it("fetches all system data", async () => {
      const store = useSystemStore.getState();
      await store.refreshAll();

      const state = useSystemStore.getState();
      expect(state.ram).not.toBeNull();
      expect(state.cpu).not.toBeNull();
      expect(state.disk).not.toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.lastUpdated).not.toBeNull();
    });

    it("sets isLoading during fetch", async () => {
      const store = useSystemStore.getState();
      const promise = store.refreshAll();

      // State might briefly be loading
      expect(useSystemStore.getState().isLoading).toBe(true);

      await promise;
      expect(useSystemStore.getState().isLoading).toBe(false);
    });
  });

  describe("calculateOverallStatus", () => {
    it("returns excellent when all metrics are good", () => {
      const store = useSystemStore.getState();
      store.setRam({
        total_bytes: 17179869184,
        used_bytes: 10737418240,
        available_bytes: 6442450944,
        used_percentage: 62.5,
        pressure_level: "normal",
      });
      store.setCpu({
        model_name: "Apple M3",
        total_cores: 8,
        total_usage_percentage: 25.0,
        per_core_usage: [],
        load_average: {
          one_minute: 1.0,
          five_minutes: 1.0,
          fifteen_minutes: 1.0,
        },
      });

      expect(useSystemStore.getState().overallStatus).toBe("excellent");
    });

    it("returns critical when RAM is critical", () => {
      const store = useSystemStore.getState();
      store.setRam({
        total_bytes: 17179869184,
        used_bytes: 16000000000,
        available_bytes: 1000000000,
        used_percentage: 93,
        pressure_level: "critical",
      });

      expect(useSystemStore.getState().overallStatus).toBe("critical");
    });

    it("returns could-be-better when RAM is warn", () => {
      const store = useSystemStore.getState();
      store.setRam({
        total_bytes: 17179869184,
        used_bytes: 14000000000,
        available_bytes: 3000000000,
        used_percentage: 82,
        pressure_level: "warn",
      });

      expect(useSystemStore.getState().overallStatus).toBe("could-be-better");
    });

    it("returns critical when CPU is over 90%", () => {
      const store = useSystemStore.getState();
      store.setCpu({
        model_name: "Apple M3",
        total_cores: 8,
        total_usage_percentage: 95.0,
        per_core_usage: [],
        load_average: {
          one_minute: 5.0,
          five_minutes: 4.0,
          fifteen_minutes: 3.0,
        },
      });

      expect(useSystemStore.getState().overallStatus).toBe("critical");
    });

    it("returns could-be-better when CPU is between 70-90%", () => {
      const store = useSystemStore.getState();
      store.setCpu({
        model_name: "Apple M3",
        total_cores: 8,
        total_usage_percentage: 80.0,
        per_core_usage: [],
        load_average: {
          one_minute: 3.0,
          five_minutes: 2.5,
          fifteen_minutes: 2.0,
        },
      });

      expect(useSystemStore.getState().overallStatus).toBe("could-be-better");
    });

    it("returns critical when battery is low and not plugged in", () => {
      const store = useSystemStore.getState();
      store.setBattery({
        percentage: 5,
        is_charging: false,
        is_plugged_in: false,
        power_source: "Battery",
        condition: "Normal",
        max_capacity_percentage: 96,
        cycle_count: 150,
        time_to_full_minutes: null,
        time_to_empty_minutes: 10,
        temperature_celsius: null,
        voltage_volts: null,
      });

      expect(useSystemStore.getState().overallStatus).toBe("critical");
    });
  });
});
