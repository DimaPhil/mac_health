import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SetupWizard } from "./SetupWizard";

// Mock Tauri APIs
vi.mock("../../lib/tauri", () => ({
  openSystemSettings: vi.fn().mockResolvedValue(undefined),
}));

describe("SetupWizard", () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the welcome message", () => {
    render(<SetupWizard onComplete={mockOnComplete} />);
    expect(screen.getByText("Welcome to Mac Health")).toBeInTheDocument();
    expect(
      screen.getByText("Grant permissions for full functionality")
    ).toBeInTheDocument();
  });

  it("renders the first step (Full Disk Access)", () => {
    render(<SetupWizard onComplete={mockOnComplete} />);
    expect(screen.getByText("Full Disk Access")).toBeInTheDocument();
    expect(screen.getByText(/analyze storage by category/)).toBeInTheDocument();
  });

  it("renders progress indicators", () => {
    const { container } = render(<SetupWizard onComplete={mockOnComplete} />);
    const dots = container.querySelectorAll(".rounded-full");
    expect(dots.length).toBe(2);
  });

  it("renders Open System Settings button", () => {
    render(<SetupWizard onComplete={mockOnComplete} />);
    expect(screen.getByText("Open System Settings")).toBeInTheDocument();
  });

  it("calls openSystemSettings when button is clicked", async () => {
    const { openSystemSettings } = await import("../../lib/tauri");
    render(<SetupWizard onComplete={mockOnComplete} />);

    const button = screen.getByText("Open System Settings");
    fireEvent.click(button);

    expect(openSystemSettings).toHaveBeenCalledWith("full-disk-access");
  });

  it("shows Next button on first step", () => {
    render(<SetupWizard onComplete={mockOnComplete} />);
    expect(screen.getByText("Next")).toBeInTheDocument();
  });

  it("advances to next step when Next is clicked", () => {
    render(<SetupWizard onComplete={mockOnComplete} />);

    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);

    expect(screen.getByText("Accessibility")).toBeInTheDocument();
    expect(screen.getByText(/force quit unresponsive/)).toBeInTheDocument();
  });

  it("shows Done button on last step", () => {
    render(<SetupWizard onComplete={mockOnComplete} />);

    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);

    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("calls onComplete when Done is clicked", () => {
    render(<SetupWizard onComplete={mockOnComplete} />);

    // Go to last step
    fireEvent.click(screen.getByText("Next"));
    // Click Done
    fireEvent.click(screen.getByText("Done"));

    expect(mockOnComplete).toHaveBeenCalled();
  });

  it("renders Skip setup button", () => {
    render(<SetupWizard onComplete={mockOnComplete} />);
    expect(screen.getByText("Skip setup")).toBeInTheDocument();
  });

  it("calls onComplete when Skip is clicked", () => {
    render(<SetupWizard onComplete={mockOnComplete} />);

    const skipButton = screen.getByText("Skip setup");
    fireEvent.click(skipButton);

    expect(mockOnComplete).toHaveBeenCalled();
  });
});
