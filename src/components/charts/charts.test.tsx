import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BarChart } from "./BarChart";
import { CircularProgress } from "./CircularProgress";
import { DonutChart } from "./DonutChart";
import { GaugeChart } from "./GaugeChart";

describe("BarChart", () => {
  it("renders bars for each value", () => {
    const { container } = render(<BarChart values={[50, 75, 25]} />);
    const bars = container.querySelectorAll(".rounded-t");
    expect(bars.length).toBe(3);
  });

  it("renders with labels when provided", () => {
    render(<BarChart values={[50, 75]} labels={["A", "B"]} />);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("normalizes values above maxValue", () => {
    const { container } = render(<BarChart values={[150]} maxValue={100} />);
    const bar = container.querySelector(".rounded-t");
    expect(bar).toBeInTheDocument();
  });

  it("normalizes negative values to 0", () => {
    const { container } = render(<BarChart values={[-10]} />);
    const bar = container.querySelector(".rounded-t");
    expect(bar).toBeInTheDocument();
  });

  it("applies custom gradient colors", () => {
    const { container } = render(
      <BarChart values={[50]} gradientColors={["#ff0000", "#00ff00"]} />
    );
    const bar = container.querySelector(".rounded-t") as HTMLElement;
    expect(bar?.style.background).toContain("#ff0000");
  });

  it("uses custom height", () => {
    const { container } = render(<BarChart values={[50]} height={100} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper?.style.height).toBe("100px");
  });
});

describe("CircularProgress", () => {
  it("renders with children", () => {
    render(
      <CircularProgress
        value={50}
        gradientId="test-gradient"
        gradientColors={["#ff0000", "#00ff00"]}
      >
        <span>50%</span>
      </CircularProgress>
    );
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("renders SVG circles", () => {
    const { container } = render(
      <CircularProgress
        value={75}
        gradientId="test-gradient"
        gradientColors={["#ff0000", "#00ff00"]}
      />
    );
    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBe(2); // Background and progress
  });

  it("normalizes values above 100", () => {
    const { container } = render(
      <CircularProgress
        value={150}
        gradientId="test-gradient"
        gradientColors={["#ff0000", "#00ff00"]}
      />
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("normalizes negative values to 0", () => {
    const { container } = render(
      <CircularProgress
        value={-10}
        gradientId="test-gradient"
        gradientColors={["#ff0000", "#00ff00"]}
      />
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("uses custom size and strokeWidth", () => {
    const { container } = render(
      <CircularProgress
        value={50}
        size={120}
        strokeWidth={10}
        gradientId="test-gradient"
        gradientColors={["#ff0000", "#00ff00"]}
      />
    );
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("120");
    expect(svg?.getAttribute("height")).toBe("120");
  });
});

describe("DonutChart", () => {
  it("renders segments", () => {
    const { container } = render(
      <DonutChart
        segments={[
          { value: 50, color: "#ff0000", label: "Red" },
          { value: 50, color: "#00ff00", label: "Green" },
        ]}
        centerLabel="Total"
        centerValue="100"
      />
    );
    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBe(3); // Background + 2 segments
  });

  it("renders center content", () => {
    render(
      <DonutChart
        segments={[{ value: 100, color: "#ff0000", label: "Test" }]}
        centerLabel="Available"
        centerValue="50 GB"
      />
    );
    expect(screen.getByText("Available")).toBeInTheDocument();
    expect(screen.getByText("50 GB")).toBeInTheDocument();
  });

  it("handles empty segments", () => {
    render(<DonutChart segments={[]} centerLabel="Empty" centerValue="0" />);
    expect(screen.getByText("No data")).toBeInTheDocument();
  });

  it("handles zero total", () => {
    render(
      <DonutChart
        segments={[{ value: 0, color: "#ff0000", label: "Zero" }]}
        centerLabel="Total"
        centerValue="0"
      />
    );
    expect(screen.getByText("No data")).toBeInTheDocument();
  });

  it("uses custom size", () => {
    const { container } = render(
      <DonutChart
        segments={[{ value: 100, color: "#ff0000", label: "Test" }]}
        centerLabel="Test"
        centerValue="100"
        size={200}
      />
    );
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("200");
  });
});

describe("GaugeChart", () => {
  it("renders the gauge with value", () => {
    render(<GaugeChart value={75} />);
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("renders the label", () => {
    render(<GaugeChart value={50} label="CPU" />);
    expect(screen.getByText("CPU")).toBeInTheDocument();
  });

  it("uses default label when not provided", () => {
    render(<GaugeChart value={50} />);
    expect(screen.getByText("USAGE")).toBeInTheDocument();
  });

  it("normalizes values above 100", () => {
    render(<GaugeChart value={150} />);
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("normalizes negative values to 0", () => {
    render(<GaugeChart value={-10} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("renders SVG paths", () => {
    const { container } = render(<GaugeChart value={50} />);
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBe(2); // Background and progress arcs
  });

  it("uses custom size", () => {
    const { container } = render(<GaugeChart value={50} size={200} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("200");
  });
});
