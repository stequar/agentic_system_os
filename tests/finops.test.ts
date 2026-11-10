import { describe, it, expect, beforeEach } from "vitest";
import {
  FinOpsEngine,
  DEFAULT_MODEL_RATE_CARDS,
} from "../src/core/finops-engine.js";
import { BudgetWatchdog } from "../src/core/budget-watchdog.js";
import {
  MultiTierTokenUsageRecordSchema,
  FinOpsSummarySchema,
} from "../src/contracts/finops.js";

describe("Sprint 11 — FinOps Engine & Multi-Tier Token Tracking", () => {
  let engine: FinOpsEngine;

  beforeEach(() => {
    engine = new FinOpsEngine();
    engine.reset();
  });

  it("calcola correttamente il costo effettivo e il risparmio netto per token serviti da cache (Anthropic 90% discount)", () => {
    // 10.000 token totali: 2.000 non cachati + 8.000 letti da cache + 1.000 output
    const model = "claude-3-5-sonnet";
    const usage = {
      uncachedInputTokens: 2_000,
      cacheReadTokens: 8_000,
      cacheWriteTokens: 0,
      outputTokens: 1_000,
    };

    const rate = DEFAULT_MODEL_RATE_CARDS[model];
    // Baseline: (2000 + 8000) * 3.0 / 1M + 1000 * 15.0 / 1M = 0.030 + 0.015 = 0.045
    // Actual: 2000 * 3.0 / 1M + 8000 * 0.30 / 1M + 1000 * 15.0 / 1M = 0.006 + 0.0024 + 0.015 = 0.0234
    // Net Savings: 0.045 - 0.0234 = 0.0216

    const result = engine.calculateCostAndSavings(model, usage);
    expect(result.actualCostUsd).toBeCloseTo(0.0234, 4);
    expect(result.baselineCostUsd).toBeCloseTo(0.045, 4);
    expect(result.netSavingsUsd).toBeCloseTo(0.0216, 4);
    expect(result.totalTokens).toBe(11_000);
  });

  it("registra record quadri-fascia conformi a MultiTierTokenUsageRecordSchema", () => {
    const record = engine.recordUsage("gpt-4o", {
      uncachedInputTokens: 5_000,
      cacheReadTokens: 15_000,
      cacheWriteTokens: 0,
      outputTokens: 2_000,
    });

    const parsed = MultiTierTokenUsageRecordSchema.safeParse(record);
    expect(parsed.success).toBe(true);
    expect(record.model).toBe("gpt-4o");
    expect(record.netSavingsUsd).toBeGreaterThan(0);
    expect(record.totalTokens).toBe(22_000);
  });

  it("genera un riepilogo FinOps aggregato conforme a FinOpsSummarySchema con Cache Savings Ratio", () => {
    engine.recordUsage("claude-3-5-sonnet", {
      uncachedInputTokens: 1_000,
      cacheReadTokens: 9_000,
      cacheWriteTokens: 1_000,
      outputTokens: 2_000,
    });

    engine.recordUsage("gemini-1.5-pro", {
      uncachedInputTokens: 4_000,
      cacheReadTokens: 16_000,
      outputTokens: 3_000,
    });

    const summary = engine.getSummary();
    const parsed = FinOpsSummarySchema.safeParse(summary);
    expect(parsed.success).toBe(true);

    expect(summary.recordsCount).toBe(2);
    expect(summary.totalCacheReadTokens).toBe(25_000);
    expect(summary.totalNetSavingsUsd).toBeGreaterThan(0);
    expect(summary.cacheSavingsRatio).toBeGreaterThan(0);
  });

  it("si integra trasparentemente con BudgetWatchdog.recordMultiTierUsage", () => {
    const watchdog = new BudgetWatchdog({ maxBudgetUsd: 10 });
    watchdog.reset();

    const multiTierRecord = watchdog.recordMultiTierUsage("claude-3-5-sonnet", {
      uncachedInputTokens: 10_000,
      cacheReadTokens: 40_000,
      outputTokens: 5_000,
    });

    expect(multiTierRecord.totalTokens).toBe(55_000);
    expect(multiTierRecord.netSavingsUsd).toBeGreaterThan(0);

    const budgetStatus = watchdog.getBudgetStatus();
    expect(budgetStatus.recordsCount).toBeGreaterThanOrEqual(1);
    expect(budgetStatus.totalCostUsd).toBe(multiTierRecord.actualCostUsd);

    const finopsSummary = watchdog.getFinOpsSummary();
    expect(finopsSummary.totalTokens).toBeGreaterThanOrEqual(55_000);
  });
});
