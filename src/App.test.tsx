import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import App from "./App";

// Mock Tauri APIs
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn().mockImplementation((cmd: string) => {
    switch (cmd) {
      case "get_ram_info":
        return Promise.resolve({
          total_bytes: 17179869184,
          used_bytes: 10737418240,
          available_bytes: 6442450944,
          used_percentage: 62.5,
          pressure_level: "normal",
        });
      case "get_cpu_info":
        return Promise.resolve({
          model_name: "Apple M3",
          total_cores: 8,
          total_usage_percentage: 25.0,
          per_core_usage: [20, 30, 25, 22, 15, 18, 20, 25],
          load_average: {
            one_minute: 1.5,
            five_minutes: 1.2,
            fifteen_minutes: 1.0,
          },
        });
      case "get_battery_info":
        return Promise.resolve({
          percentage: 85,
          is_charging: false,
          is_plugged_in: false,
          power_source: "Battery",
          condition: "Normal",
          max_capacity_percentage: 96,
          cycle_count: 150,
          time_to_full_minutes: null,
          time_to_empty_minutes: 180,
          temperature_celsius: 32.5,
          voltage_volts: 12.4,
        });
      case "get_disk_info":
        return Promise.resolve({
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
        });
      default:
        return Promise.resolve(null);
    }
  }),
}));

vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: vi.fn(() => ({
    onFocusChanged: vi.fn(() => Promise.resolve(() => {})),
    hide: vi.fn(),
    show: vi.fn(),
  })),
}));

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the app title in header", async () => {
    render(<App />);
    expect(await screen.findByText("Mac Health")).toBeInTheDocument();
  });

  it("renders dashboard widgets", async () => {
    render(<App />);
    expect(await screen.findByText("RAM")).toBeInTheDocument();
    expect(await screen.findByText("DISK")).toBeInTheDocument();
    expect(await screen.findByText("BATTERY")).toBeInTheDocument();
    expect(await screen.findByText("CPU")).toBeInTheDocument();
  });
});
