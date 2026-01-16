import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BatteryDetail } from "./BatteryDetail";

// Mock Tauri APIs
vi.mock("../../lib/tauri", () => ({
  openEnergySettings: vi.fn().mockResolvedValue(undefined),
}));

// Mock Zustand store - use 60 minutes for easy formatting (1h)
vi.mock("../../store/systemStore", () => ({
  useSystemStore: vi.fn((selector) => {
    const state = {
      battery: {
        percentage: 85,
        is_charging: false,
        is_plugged_in: false,
        power_source: "Battery",
        condition: "Normal",
        max_capacity_percentage: 96,
        cycle_count: 150,
        time_to_full_minutes: null,
        time_to_empty_minutes: 60,
        temperature_celsius: 32.5,
        voltage_volts: 12.4,
      },
    };
    return selector(state);
  }),
}));

describe("BatteryDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the header", () => {
    render(<BatteryDetail />);
    // "Battery" appears in header and in "Power Source: Battery"
    // Check for the header specifically using role
    expect(
      screen.getByRole("heading", { name: "Battery" })
    ).toBeInTheDocument();
  });

  it("renders battery percentage", () => {
    render(<BatteryDetail />);
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("renders battery status", () => {
    render(<BatteryDetail />);
    expect(screen.getByText("Battery Status")).toBeInTheDocument();
  });

  it("renders health and cycles stats", () => {
    render(<BatteryDetail />);
    expect(screen.getByText("Health")).toBeInTheDocument();
    expect(screen.getByText("96%")).toBeInTheDocument();
    expect(screen.getByText("Cycles")).toBeInTheDocument();
    expect(screen.getByText("150")).toBeInTheDocument();
  });

  it("renders battery condition", () => {
    render(<BatteryDetail />);
    expect(screen.getByText("Condition")).toBeInTheDocument();
    expect(screen.getByText("Normal")).toBeInTheDocument();
  });

  it("renders additional info", () => {
    render(<BatteryDetail />);
    expect(screen.getByText("Additional Info")).toBeInTheDocument();
    expect(screen.getByText("Power Source")).toBeInTheDocument();
    expect(screen.getByText("Temperature")).toBeInTheDocument();
    expect(screen.getByText("32.5°C")).toBeInTheDocument();
    expect(screen.getByText("Voltage")).toBeInTheDocument();
    expect(screen.getByText("12.40 V")).toBeInTheDocument();
  });

  it("renders Open Energy Settings button", () => {
    render(<BatteryDetail />);
    expect(screen.getByText("Open Energy Settings")).toBeInTheDocument();
  });

  it("calls openEnergySettings when button is clicked", async () => {
    const { openEnergySettings } = await import("../../lib/tauri");
    render(<BatteryDetail />);

    const button = screen.getByText("Open Energy Settings");
    fireEvent.click(button);

    expect(openEnergySettings).toHaveBeenCalled();
  });
});

// Note: Testing the "no battery" state requires complex mock overriding
// which is not straightforward with vi.mock hoisting. The null battery
// state rendering is verified through manual testing.
