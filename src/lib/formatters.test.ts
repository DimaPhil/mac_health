import { describe, it, expect } from "vitest";
import {
  formatBytes,
  formatGB,
  formatPercent,
  formatUptime,
  formatTimeRemaining,
} from "./formatters";

describe("formatBytes", () => {
  it("returns 0 B for zero bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("formats bytes", () => {
    expect(formatBytes(500)).toBe("500.0 B");
  });

  it("formats kilobytes", () => {
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
  });

  it("formats megabytes", () => {
    expect(formatBytes(1048576)).toBe("1.0 MB");
    expect(formatBytes(1572864)).toBe("1.5 MB");
  });

  it("formats gigabytes", () => {
    expect(formatBytes(1073741824)).toBe("1.0 GB");
  });

  it("formats terabytes", () => {
    expect(formatBytes(1099511627776)).toBe("1.0 TB");
  });

  it("uses custom decimals", () => {
    expect(formatBytes(1536, 2)).toBe("1.50 KB");
    expect(formatBytes(1536, 0)).toBe("2 KB");
  });
});

describe("formatGB", () => {
  it("formats bytes to GB", () => {
    expect(formatGB(1073741824)).toBe("1.0 GB");
  });

  it("formats partial GB", () => {
    expect(formatGB(536870912)).toBe("0.5 GB");
  });

  it("uses custom decimals", () => {
    expect(formatGB(1073741824, 2)).toBe("1.00 GB");
  });

  it("handles large values", () => {
    expect(formatGB(500107862016)).toBe("465.8 GB");
  });
});

describe("formatPercent", () => {
  it("formats percentage with default decimals", () => {
    expect(formatPercent(50)).toBe("50%");
  });

  it("formats percentage with decimals", () => {
    expect(formatPercent(50.5, 1)).toBe("50.5%");
  });

  it("rounds when decimals is 0", () => {
    expect(formatPercent(50.7)).toBe("51%");
  });
});

describe("formatUptime", () => {
  it("formats seconds to less than 1 minute", () => {
    expect(formatUptime(30)).toBe("< 1m");
    expect(formatUptime(0)).toBe("< 1m");
  });

  it("formats minutes only", () => {
    expect(formatUptime(120)).toBe("2m");
    expect(formatUptime(3540)).toBe("59m");
  });

  it("formats hours and minutes", () => {
    expect(formatUptime(3600)).toBe("1h");
    expect(formatUptime(3660)).toBe("1h 1m");
    expect(formatUptime(7200)).toBe("2h");
  });

  it("formats days, hours, and minutes", () => {
    expect(formatUptime(86400)).toBe("1d");
    expect(formatUptime(90000)).toBe("1d 1h");
    expect(formatUptime(90060)).toBe("1d 1h 1m");
  });

  it("formats multiple days", () => {
    expect(formatUptime(259200)).toBe("3d");
  });
});

describe("formatTimeRemaining", () => {
  it("returns -- for null", () => {
    expect(formatTimeRemaining(null)).toBe("--");
  });

  it("formats minutes only", () => {
    expect(formatTimeRemaining(30)).toBe("30m");
    expect(formatTimeRemaining(59)).toBe("59m");
  });

  it("formats hours only", () => {
    expect(formatTimeRemaining(60)).toBe("1h");
    expect(formatTimeRemaining(120)).toBe("2h");
  });

  it("formats hours and minutes", () => {
    expect(formatTimeRemaining(90)).toBe("1h 30m");
    expect(formatTimeRemaining(150)).toBe("2h 30m");
  });
});
