import { create } from "zustand";
import type {
  ViewType,
  SystemStatus,
  RamInfo,
  CpuInfo,
  BatteryInfo,
  DisksOverview,
} from "../types";
import * as tauri from "../lib/tauri";

interface SystemState {
  // Navigation
  currentView: ViewType;
  previousView: ViewType | null;

  // Data
  ram: RamInfo | null;
  cpu: CpuInfo | null;
  battery: BatteryInfo | null;
  disk: DisksOverview | null;

  // Meta
  lastUpdated: number | null;
  isLoading: boolean;
  error: string | null;

  // Computed
  overallStatus: SystemStatus;
}

interface SystemActions {
  navigate: (view: ViewType) => void;
  goBack: () => void;
  setRam: (data: RamInfo) => void;
  setCpu: (data: CpuInfo) => void;
  setBattery: (data: BatteryInfo | null) => void;
  setDisk: (data: DisksOverview) => void;
  setError: (error: string | null) => void;
  refreshAll: () => Promise<void>;
}

function calculateOverallStatus(state: {
  ram: RamInfo | null;
  cpu: CpuInfo | null;
  battery: BatteryInfo | null;
  disk: DisksOverview | null;
}): SystemStatus {
  const issues: boolean[] = [];

  // Check RAM pressure
  if (state.ram) {
    if (state.ram.pressure_level === "critical") issues.push(true);
    else if (state.ram.pressure_level === "warn") issues.push(false);
  }

  // Check CPU usage
  if (state.cpu && state.cpu.total_usage_percentage > 90) {
    issues.push(true);
  } else if (state.cpu && state.cpu.total_usage_percentage > 70) {
    issues.push(false);
  }

  // Check disk space
  if (state.disk && state.disk.total_used_percentage > 95) {
    issues.push(true);
  } else if (state.disk && state.disk.total_used_percentage > 85) {
    issues.push(false);
  }

  // Check battery
  if (state.battery) {
    if (state.battery.condition !== "Normal") issues.push(false);
    if (!state.battery.is_plugged_in && state.battery.percentage < 10) {
      issues.push(true);
    }
  }

  const criticalCount = issues.filter(Boolean).length;
  const warningCount = issues.filter((v) => !v).length;

  if (criticalCount > 0) return "critical";
  if (warningCount > 0) return "could-be-better";
  return "excellent";
}

export const useSystemStore = create<SystemState & SystemActions>((set) => ({
  // Initial state
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

  // Actions
  navigate: (view) =>
    set((state) => ({
      previousView: state.currentView,
      currentView: view,
    })),

  goBack: () =>
    set((state) => ({
      currentView: state.previousView ?? "dashboard",
      previousView: null,
    })),

  setRam: (data) =>
    set((state) => {
      const newState = { ...state, ram: data };
      return {
        ram: data,
        overallStatus: calculateOverallStatus(newState),
      };
    }),

  setCpu: (data) =>
    set((state) => {
      const newState = { ...state, cpu: data };
      return {
        cpu: data,
        overallStatus: calculateOverallStatus(newState),
      };
    }),

  setBattery: (data) =>
    set((state) => {
      const newState = { ...state, battery: data };
      return {
        battery: data,
        overallStatus: calculateOverallStatus(newState),
      };
    }),

  setDisk: (data) =>
    set((state) => {
      const newState = { ...state, disk: data };
      return {
        disk: data,
        overallStatus: calculateOverallStatus(newState),
      };
    }),

  setError: (error) => set({ error }),

  refreshAll: async () => {
    set({ isLoading: true, error: null });

    try {
      const [ram, cpu, disk] = await Promise.all([
        tauri.getRamInfo(),
        tauri.getCpuInfo(),
        tauri.getDiskInfo(),
      ]);

      // Battery might not be available on desktop Macs
      let battery: BatteryInfo | null = null;
      try {
        battery = await tauri.getBatteryInfo();
      } catch {
        // Ignore battery errors (desktop Mac)
      }

      set((state) => {
        const newState = { ...state, ram, cpu, battery, disk };
        return {
          ram,
          cpu,
          battery,
          disk,
          lastUpdated: Date.now(),
          isLoading: false,
          overallStatus: calculateOverallStatus(newState),
        };
      });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Failed to fetch system info",
        isLoading: false,
      });
    }
  },
}));

// Selectors for optimized re-renders
export const selectCurrentView = (state: SystemState) => state.currentView;
export const selectRam = (state: SystemState) => state.ram;
export const selectCpu = (state: SystemState) => state.cpu;
export const selectBattery = (state: SystemState) => state.battery;
export const selectDisk = (state: SystemState) => state.disk;
export const selectOverallStatus = (state: SystemState) => state.overallStatus;
export const selectIsLoading = (state: SystemState) => state.isLoading;
export const selectError = (state: SystemState) => state.error;
