import { describe, expect, it } from "vitest";
import { getDisruptionTone } from "../../src/utils/toneHelpers";

describe("getDisruptionTone", () => {
  it("returns red tone for high disruption (>= 0.7)", () => {
    const tone = getDisruptionTone(0.75);
    expect(tone.border).toContain("red");
    expect(tone.progress).toContain("red");
    expect(tone.pill).toContain("badge-error");
  });

  it("returns amber tone for medium disruption (>= 0.4, < 0.7)", () => {
    const tone = getDisruptionTone(0.5);
    expect(tone.border).toContain("amber");
    expect(tone.progress).toContain("amber");
    expect(tone.pill).toContain("badge-pending");
  });

  it("returns primary tone for low disruption (< 0.4)", () => {
    const tone = getDisruptionTone(0.2);
    expect(tone.border).toContain("primary");
    expect(tone.progress).toContain("primary");
    expect(tone.pill).toContain("badge-active");
  });

  it("returns exactly red at boundary 0.7", () => {
    const tone = getDisruptionTone(0.7);
    expect(tone.border).toContain("red");
  });

  it("returns exactly amber at boundary 0.4", () => {
    const tone = getDisruptionTone(0.4);
    expect(tone.border).toContain("amber");
  });

  it("handles edge case of 0", () => {
    const tone = getDisruptionTone(0);
    expect(tone.border).toContain("primary");
  });

  it("handles edge case of 1", () => {
    const tone = getDisruptionTone(1);
    expect(tone.border).toContain("red");
  });
});
