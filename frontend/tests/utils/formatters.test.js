import { describe, expect, it } from "vitest";
import {
  formatCurrency,
  formatHours,
  formatPercent,
  formatReviewWindow,
  formatScore,
  humanizeSlug,
  statusPill,
  riskLabel,
} from "../../src/utils/formatters";

describe("formatCurrency", () => {
  it("formats numbers with INR locale", () => {
    expect(formatCurrency(1234567)).toContain("12,34,567");
  });

  it("returns INR 0 for null", () => {
    expect(formatCurrency(null)).toBe("INR 0");
  });

  it("returns INR 0 for undefined", () => {
    expect(formatCurrency(undefined)).toBe("INR 0");
  });

  it("rounds to whole number", () => {
    expect(formatCurrency(1234.56)).toContain("1,235");
  });
});

describe("formatPercent", () => {
  it("formats 0.75 as 0.8%", () => {
    expect(formatPercent(0.75)).toBe("0.8%");
  });

  it("formats 0.7534 with 2 digits as 0.75%", () => {
    expect(formatPercent(0.7534, 2)).toBe("0.75%");
  });

  it("returns 0% for null", () => {
    expect(formatPercent(null)).toBe("0%");
  });

  it("returns -- for NaN", () => {
    expect(formatPercent(NaN)).toBe("--");
  });
});

describe("formatScore", () => {
  it("formats to 3 decimal places", () => {
    expect(formatScore(0.1234567)).toBe("0.123");
  });

  it("returns -- for null", () => {
    expect(formatScore(null)).toBe("--");
  });
});

describe("formatHours", () => {
  it("formats hour counts to rounded h labels", () => {
    expect(formatHours(18.3)).toBe("18h");
  });

  it("returns <1h for short windows", () => {
    expect(formatHours(0.4)).toBe("<1h");
  });

  it("returns -- for null", () => {
    expect(formatHours(null)).toBe("--");
  });
});

describe("formatReviewWindow", () => {
  it("formats future deadlines as due in", () => {
    expect(formatReviewWindow(5.2)).toBe("Due in 5h");
  });

  it("formats negative deadlines as overdue", () => {
    expect(formatReviewWindow(-2.2)).toBe("Overdue by 2h");
  });

  it("returns -- for null", () => {
    expect(formatReviewWindow(null)).toBe("--");
  });
});

describe("humanizeSlug", () => {
  it("converts snake_case to Title Case", () => {
    expect(humanizeSlug("south_delhi")).toBe("South Delhi");
  });

  it("handles multiple underscores", () => {
    expect(humanizeSlug("heavy_rain_warning")).toBe("Heavy Rain Warning");
  });

  it("handles empty string", () => {
    expect(humanizeSlug("")).toBe("");
  });

  it("handles null/undefined", () => {
    expect(humanizeSlug(null)).toBe("");
    expect(humanizeSlug(undefined)).toBe("");
  });
});

describe("statusPill", () => {
  it("returns approved pill style", () => {
    expect(statusPill("approved")).toContain("badge-active");
  });

  it("returns delayed pill style", () => {
    expect(statusPill("delayed")).toContain("badge-pending");
  });

  it("returns rejected pill style", () => {
    expect(statusPill("rejected")).toContain("badge-error");
  });

  it("returns default for unknown status", () => {
    expect(statusPill("unknown")).toContain("surface-container-high");
  });
});

describe("riskLabel", () => {
  it("returns Stable for score < 0.25", () => {
    expect(riskLabel(0.1)).toEqual({ label: "Stable", tone: "text-primary" });
  });

  it("returns Guarded for score between 0.25 and 0.5", () => {
    expect(riskLabel(0.35)).toEqual({ label: "Guarded", tone: "text-on-tertiary-container" });
  });

  it("returns Elevated for score between 0.5 and 0.75", () => {
    expect(riskLabel(0.6)).toEqual({ label: "Elevated", tone: "text-secondary" });
  });

  it("returns Critical for score >= 0.75", () => {
    expect(riskLabel(0.8)).toEqual({ label: "Critical", tone: "text-error" });
  });

  it("handles null as Stable", () => {
    expect(riskLabel(null).label).toBe("Stable");
  });
});
