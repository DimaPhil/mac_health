import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryDetail } from "./MemoryDetail";

// Mock Tauri APIs
vi.mock("../../lib/tauri", () => ({
  getTopMemoryProcesses: vi.fn().mockResolvedValue([
    {
      pid: 1,
      name: "Safari",
      memory_bytes: 1073741824,
      path: "/Applications/Safari.app",
    },
    {
      pid: 2,
      name: "Chrome",
      memory_bytes: 536870912,
      path: "/Applications/Chrome.app",
    },
  ]),
  purgeMemoryWithAdmin: vi
    .fn()
    .mockResolvedValue({ success: true, freed_bytes: 104857600, message: "" }),
  forceQuitProcess: vi.fn().mockResolvedValue({ success: true, message: "" }),
}));

// Mock Zustand store
const mockRefreshAll = vi.fn();
vi.mock("../../store/systemStore", () => ({
  useSystemStore: vi.fn((selector) => {
    const state = {
      ram: {
        total_bytes: 17179869184,
        used_bytes: 10737418240,
        available_bytes: 6442450944,
        used_percentage: 62.5,
        pressure_level: "normal",
      },
      refreshAll: mockRefreshAll,
    };
    return selector(state);
  }),
}));

// Mock window.confirm
window.confirm = vi.fn().mockReturnValue(true);

describe("MemoryDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the header", () => {
    render(<MemoryDetail />);
    expect(screen.getByText("Memory")).toBeInTheDocument();
  });

  it("renders memory percentage", async () => {
    render(<MemoryDetail />);
    expect(screen.getByText("63%")).toBeInTheDocument();
  });

  it("renders memory pressure level", () => {
    render(<MemoryDetail />);
    expect(screen.getByText("normal")).toBeInTheDocument();
  });

  it("renders the Quick Clean button", () => {
    render(<MemoryDetail />);
    expect(screen.getByText("Quick Clean")).toBeInTheDocument();
  });

  it("renders memory breakdown section", () => {
    render(<MemoryDetail />);
    expect(screen.getByText("Breakdown")).toBeInTheDocument();
    expect(screen.getByText("Used")).toBeInTheDocument();
    expect(screen.getByText("Available")).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();
  });

  it("renders top memory consumers", async () => {
    render(<MemoryDetail />);
    await waitFor(() => {
      expect(screen.getByText("Safari")).toBeInTheDocument();
      expect(screen.getByText("Chrome")).toBeInTheDocument();
    });
  });

  it("shows cleaning state when Quick Clean is clicked", async () => {
    render(<MemoryDetail />);
    const button = screen.getByText("Quick Clean");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Freed/)).toBeInTheDocument();
    });
  });

  it("shows confirmation dialog when force quit is clicked", async () => {
    render(<MemoryDetail />);
    await waitFor(() => {
      expect(screen.getByText("Safari")).toBeInTheDocument();
    });

    const forceQuitButtons = document.querySelectorAll(
      'button[title="Force Quit"]'
    );
    fireEvent.click(forceQuitButtons[0]);

    expect(window.confirm).toHaveBeenCalled();
  });
});
