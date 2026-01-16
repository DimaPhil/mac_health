import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CpuDetail } from "./CpuDetail";

// Mock Tauri APIs
vi.mock("../../lib/tauri", () => ({
  getTopCpuProcesses: vi.fn().mockResolvedValue([
    { pid: 1, name: "Safari", cpu_percentage: 25.5 },
    { pid: 2, name: "Chrome", cpu_percentage: 15.2 },
  ]),
  getSystemUptime: vi.fn().mockResolvedValue(86400), // 1 day
  openActivityMonitor: vi.fn().mockResolvedValue(undefined),
}));

// Mock Zustand store
vi.mock("../../store/systemStore", () => ({
  useSystemStore: vi.fn((selector) => {
    const state = {
      cpu: {
        model_name: "Apple M3",
        total_cores: 8,
        total_usage_percentage: 25.0,
        per_core_usage: [20, 30, 25, 22, 15, 18, 20, 25],
        load_average: {
          one_minute: 1.5,
          five_minutes: 1.2,
          fifteen_minutes: 1.0,
        },
      },
    };
    return selector(state);
  }),
}));

describe("CpuDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the header", () => {
    render(<CpuDetail />);
    expect(screen.getByText("CPU")).toBeInTheDocument();
  });

  it("renders CPU usage percentage", () => {
    render(<CpuDetail />);
    expect(screen.getByText("25%")).toBeInTheDocument();
  });

  it("renders CPU model name", () => {
    render(<CpuDetail />);
    expect(screen.getByText("Apple M3")).toBeInTheDocument();
  });

  it("renders core count", () => {
    render(<CpuDetail />);
    expect(screen.getByText("8 cores")).toBeInTheDocument();
  });

  it("renders per-core usage section", () => {
    render(<CpuDetail />);
    expect(screen.getByText("Per-Core Usage")).toBeInTheDocument();
  });

  it("renders system info section", () => {
    render(<CpuDetail />);
    expect(screen.getByText("System Info")).toBeInTheDocument();
    expect(screen.getByText("Uptime")).toBeInTheDocument();
    expect(screen.getByText("Load Average (1m)")).toBeInTheDocument();
    expect(screen.getByText("1.50")).toBeInTheDocument();
    expect(screen.getByText("Load Average (5m)")).toBeInTheDocument();
    expect(screen.getByText("1.20")).toBeInTheDocument();
  });

  it("renders top CPU consumers", async () => {
    render(<CpuDetail />);
    await waitFor(() => {
      expect(screen.getByText("Safari")).toBeInTheDocument();
      expect(screen.getByText("Chrome")).toBeInTheDocument();
    });
  });

  it("renders Open Activity Monitor button", () => {
    render(<CpuDetail />);
    expect(screen.getByText("Open Activity Monitor")).toBeInTheDocument();
  });

  it("calls openActivityMonitor when button is clicked", async () => {
    const { openActivityMonitor } = await import("../../lib/tauri");
    render(<CpuDetail />);

    const button = screen.getByText("Open Activity Monitor");
    fireEvent.click(button);

    expect(openActivityMonitor).toHaveBeenCalled();
  });
});
