import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { BudgetWatchdog } from "../src/core/budget-watchdog.js";
import { CompanyEventBus } from "../src/core/event-bus.js";
import { SteeringEngine } from "../src/core/steering-engine.js";

describe("Token Cost Budget Watchdog with Safe-Pause & Grace Margin (TCK-7.5)", () => {
  let watchdog: BudgetWatchdog;
  let bus: CompanyEventBus;
  let engine: SteeringEngine;

  beforeEach(() => {
    bus = new CompanyEventBus();
    engine = new SteeringEngine(bus);
    watchdog = new BudgetWatchdog(
      {
        maxBudgetUsd: 1.0, // $1.00 budget per facilitare i calcoli nei test
        warningThresholdPercent: 80,
        graceMarginPercent: 5,
      },
      { eventBus: bus }
    );
  });

  afterEach(() => {
    watchdog.reset();
    engine.reset();
    bus.clear();
  });

  it("calcola accuratamente i costi stimati per diversi modelli", () => {
    // 100,000 prompt tokens su Claude 3.5 Sonnet ($3.00/M) = $0.30
    // 20,000 completion tokens ($15.00/M) = $0.30
    // Totale = $0.60
    const cost = watchdog.calculateCost("claude-3-5-sonnet", 100_000, 20_000);
    expect(cost).toBe(0.6);
  });

  it("registra il consumo e mantiene lo stato OK al di sotto dell'80%", async () => {
    // Spesa = $0.30 (30% del budget di $1.0)
    watchdog.recordUsage("claude-3-5-sonnet", 50_000, 10_000);

    const status = await watchdog.evaluateBudget(engine);
    expect(status.status).toBe("OK");
    expect(status.percentUsed).toBe(30);
    expect(status.remainingBudgetUsd).toBe(0.7);
    expect(engine.isPauseRequested()).toBe(false);
  });

  it("emette un avviso all'80% del budget (WARNING e evento BUDGET_WARNING)", async () => {
    const warningHandler = vi.fn();
    bus.subscribe("BUDGET_WARNING", warningHandler);

    // Spesa = $0.84 (84% del budget di $1.0)
    watchdog.recordUsage("claude-3-5-sonnet", 140_000, 28_000);

    const status = await watchdog.evaluateBudget(engine);
    expect(status.status).toBe("WARNING");
    expect(status.percentUsed).toBeGreaterThanOrEqual(80);
    expect(warningHandler).toHaveBeenCalledTimes(1);
    expect(engine.isPauseRequested()).toBe(false);
  });

  it("richiede Safe-Pause cooperativa quando il budget raggiunge il 100% (EXCEEDED_GRACE)", async () => {
    const exceededHandler = vi.fn();
    bus.subscribe("BUDGET_EXCEEDED", exceededHandler);

    // Spesa = $1.02 (102% del budget di $1.0, entro il grace margin del 5%)
    watchdog.recordUsage("claude-3-5-sonnet", 170_000, 34_000);

    const status = await watchdog.evaluateBudget(engine);
    expect(status.status).toBe("EXCEEDED_GRACE");
    expect(status.percentUsed).toBeGreaterThanOrEqual(100);
    expect(status.percentUsed).toBeLessThanOrEqual(105);
    expect(exceededHandler).toHaveBeenCalledTimes(1);

    // Deve aver impostato la richiesta di pausa sull'engine di steering!
    expect(engine.isPauseRequested()).toBe(true);
  });

  it("transiziona a HALTED quando viene superato anche il buffer di grazia del 5% (> 105%)", async () => {
    // Spesa = $1.20 (120% del budget di $1.0)
    watchdog.recordUsage("claude-3-5-sonnet", 200_000, 40_000);

    const status = await watchdog.evaluateBudget(engine);
    expect(status.status).toBe("HALTED");
    expect(status.percentUsed).toBeGreaterThan(105);
  });
});
