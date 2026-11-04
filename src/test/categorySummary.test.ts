import { describe, expect, it } from "vitest";
import { summarizeCategories } from "../lib/dashboardData";

describe("category summary", () => {
  it("does not include seguro among flagged categories", () => {
    const summary = summarizeCategories([
      { name: "seguro", value: 2558 },
      { name: "phishing", value: 711 },
      { name: "incerto", value: 30 },
    ]);
    expect(summary.flagged).toEqual([{ name: "phishing", value: 711 }, { name: "incerto", value: 30 }]);
    expect(summary.safeTotal).toBe(2558);
    expect(summary.flaggedTotal).toBe(741);
    expect(summary.analyzedTotal).toBe(3299);
  });
});