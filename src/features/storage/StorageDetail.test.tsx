import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { StorageDetail } from "./StorageDetail";

// Mock Tauri APIs
vi.mock("../../lib/tauri", () => ({
  openStorageSettings: vi.fn().mockResolvedValue(undefined),
  getStorageCategories: vi.fn().mockResolvedValue({
    categories: [
      { name: "Apps", bytes: 50000000000, color: "#ef4444" },
      { name: "Documents", bytes: 30000000000, color: "#3b82f6" },
      { name: "System", bytes: 20000000000, color: "#8b5cf6" },
    ],
    total_categorized: 100000000000,
  }),
}));

// Mock Zustand store
vi.mock("../../store/systemStore", () => ({
  useSystemStore: vi.fn((selector) => {
    const state = {
      disk: {
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
      },
    };
    return selector(state);
  }),
}));

describe("StorageDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the header", () => {
    render(<StorageDetail />);
    expect(screen.getByText("Storage")).toBeInTheDocument();
  });

  it("renders available space in center", () => {
    render(<StorageDetail />);
    // "Available" appears in both the donut chart center and the disk info section
    const availableElements = screen.getAllByText("Available");
    expect(availableElements.length).toBeGreaterThan(0);
  });

  it("renders storage breakdown section", async () => {
    render(<StorageDetail />);
    expect(screen.getByText("Storage Breakdown")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Apps")).toBeInTheDocument();
      expect(screen.getByText("Documents")).toBeInTheDocument();
      expect(screen.getByText("System")).toBeInTheDocument();
    });
  });

  it("renders primary disk info", () => {
    render(<StorageDetail />);
    expect(screen.getByText("Primary Disk")).toBeInTheDocument();
    expect(screen.getByText("Macintosh HD")).toBeInTheDocument();
    expect(screen.getByText("APFS")).toBeInTheDocument();
  });

  it("renders Open Storage Settings button", () => {
    render(<StorageDetail />);
    expect(screen.getByText("Open Storage Settings")).toBeInTheDocument();
  });

  it("calls openStorageSettings when button is clicked", async () => {
    const { openStorageSettings } = await import("../../lib/tauri");
    render(<StorageDetail />);

    const button = screen.getByText("Open Storage Settings");
    fireEvent.click(button);

    expect(openStorageSettings).toHaveBeenCalled();
  });
});

describe("StorageDetail with empty categories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state when categories are empty", async () => {
    const { getStorageCategories } = await import("../../lib/tauri");
    vi.mocked(getStorageCategories).mockResolvedValueOnce({
      categories: [],
      total_categorized: 0,
    });

    render(<StorageDetail />);

    await waitFor(() => {
      expect(
        screen.getByText("Calculating folder sizes...")
      ).toBeInTheDocument();
    });
  });
});
