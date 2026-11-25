import { describe, it, expect } from "vitest";
import { renderStudioHtml } from "../src/studio/ui.js";
import { ProcessQualityMetricsSchema } from "../src/contracts/metrics.js";
import { FinOpsSummarySchema } from "../src/contracts/finops.js";

/**
 * The dashboard script and the API contracts drifted apart once without any test
 * noticing: the page read `metrics.firstPassYieldPercentage` and `finops.totalCostUsd`,
 * neither of which the API returns, and an empty `catch` hid the failure.
 * These checks tie every field the page reads to the Zod contract of the endpoint.
 */
function fieldsRead(html: string, variable: string): string[] {
  const found = new Set<string>();
  for (const m of html.matchAll(new RegExp(`\\b${variable}\\.([A-Za-z_][A-Za-z0-9_]*)`, "g"))) {
    found.add(m[1]!);
  }
  return [...found].sort();
}

describe("Studio dashboard ↔ API contract", () => {
  const html = renderStudioHtml("CONTRACT_TEST_TOKEN");

  it("reads only /api/metrics fields that exist in ProcessQualityMetricsSchema", () => {
    const read = fieldsRead(html, "metrics");
    expect(read.length).toBeGreaterThanOrEqual(4);
    const known = Object.keys(ProcessQualityMetricsSchema.shape);
    for (const field of read) {
      expect(known, `metrics.${field} is not in the /api/metrics contract`).toContain(field);
    }
  });

  it("reads only /api/finops fields that exist in FinOpsSummarySchema", () => {
    const read = fieldsRead(html, "finops");
    expect(read.length).toBeGreaterThanOrEqual(5);
    const known = Object.keys(FinOpsSummarySchema.shape);
    for (const field of read) {
      expect(known, `finops.${field} is not in the /api/finops contract`).toContain(field);
    }
  });

  it("ships no invented default values: every KPI tile starts as 'not measured'", () => {
    const tiles = [...html.matchAll(/<div id="(kpi-[a-z-]+)" class="metric-value[^"]*">([^<]*)<\/div>/g)];
    expect(tiles.length).toBeGreaterThanOrEqual(9);
    for (const [, id, initial] of tiles) {
      expect(initial, `${id} has a hardcoded initial value`).toBe("not measured");
    }
  });
});
