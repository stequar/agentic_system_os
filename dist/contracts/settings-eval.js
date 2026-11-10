import { z } from "zod";
import { CompanySettingsSchema } from "./settings.js";
export const SettingsEvalScenarioSchema = z.enum([
    "SCENARIO_A_CEO_MAX_CONTROL",
    "SCENARIO_B_AUTONOMOUS_FAST_TRACK",
    "SCENARIO_C_LOCAL_FIRST_AIRGAP",
    "SCENARIO_D_STRICT_IMMUNE_DEFENSE",
]);
export const SettingsEvalResultSchema = z.object({
    scenarioId: SettingsEvalScenarioSchema,
    workspacePath: z.string(),
    stackType: z.enum(["python_fastapi", "typescript_node", "airgap_worker", "brownfield_chaos"]),
    settingsSnapshot: CompanySettingsSchema,
    assertionsPassed: z.number().int().min(0),
    assertionsTotal: z.number().int().min(1),
    fpyPercentage: z.number().min(0).max(100),
    status: z.enum(["PASSED", "FAILED"]),
    logTrail: z.array(z.string()),
});
export const SettingsEvalScorecardSchema = z.object({
    evalSessionId: z.string().uuid(),
    executedAt: z.string().datetime(),
    totalScenarios: z.number().int().min(1),
    passedScenarios: z.number().int().min(0),
    overallScore: z.number().min(0).max(100),
    verdict: z.enum(["SETTINGS_VERIFIED", "SETTINGS_DEGRADED", "SETTINGS_FAILED"]),
    scenarios: z.array(SettingsEvalResultSchema),
});
//# sourceMappingURL=settings-eval.js.map