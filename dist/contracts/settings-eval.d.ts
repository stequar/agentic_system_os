import { z } from "zod";
export declare const SettingsEvalScenarioSchema: z.ZodEnum<["SCENARIO_A_CEO_MAX_CONTROL", "SCENARIO_B_AUTONOMOUS_FAST_TRACK", "SCENARIO_C_LOCAL_FIRST_AIRGAP", "SCENARIO_D_STRICT_IMMUNE_DEFENSE"]>;
export type SettingsEvalScenario = z.infer<typeof SettingsEvalScenarioSchema>;
export declare const SettingsEvalResultSchema: z.ZodObject<{
    scenarioId: z.ZodEnum<["SCENARIO_A_CEO_MAX_CONTROL", "SCENARIO_B_AUTONOMOUS_FAST_TRACK", "SCENARIO_C_LOCAL_FIRST_AIRGAP", "SCENARIO_D_STRICT_IMMUNE_DEFENSE"]>;
    workspacePath: z.ZodString;
    stackType: z.ZodEnum<["python_fastapi", "typescript_node", "airgap_worker", "brownfield_chaos"]>;
    settingsSnapshot: z.ZodObject<{
        version: z.ZodDefault<z.ZodString>;
        governance: z.ZodDefault<z.ZodObject<{
            spikeCheckpoint: z.ZodDefault<z.ZodEnum<["HITL_SPIKE_REVIEW", "AUTONOMOUS_FAST_TRACK"]>>;
            anomalyGate: z.ZodDefault<z.ZodEnum<["STRICT_CFF_4_GATES", "ADVISORY"]>>;
            releaseApproval: z.ZodDefault<z.ZodEnum<["CEO_MANDATORY", "GATEKEEPER_AUTO"]>>;
            roundtableDevilsAdvocate: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            spikeCheckpoint: "HITL_SPIKE_REVIEW" | "AUTONOMOUS_FAST_TRACK";
            anomalyGate: "STRICT_CFF_4_GATES" | "ADVISORY";
            releaseApproval: "CEO_MANDATORY" | "GATEKEEPER_AUTO";
            roundtableDevilsAdvocate: boolean;
        }, {
            spikeCheckpoint?: "HITL_SPIKE_REVIEW" | "AUTONOMOUS_FAST_TRACK" | undefined;
            anomalyGate?: "STRICT_CFF_4_GATES" | "ADVISORY" | undefined;
            releaseApproval?: "CEO_MANDATORY" | "GATEKEEPER_AUTO" | undefined;
            roundtableDevilsAdvocate?: boolean | undefined;
        }>>;
        localSlm: z.ZodDefault<z.ZodObject<{
            mode: z.ZodDefault<z.ZodEnum<["AUTO_HARDWARE_ADAPTIVE", "FORCE_ENABLED", "DISABLED_CLOUD_ONLY"]>>;
            preferredModelOverride: z.ZodDefault<z.ZodNullable<z.ZodString>>;
            ollamaEndpoint: z.ZodDefault<z.ZodString>;
            slaTimeoutMs: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            mode: "AUTO_HARDWARE_ADAPTIVE" | "FORCE_ENABLED" | "DISABLED_CLOUD_ONLY";
            preferredModelOverride: string | null;
            ollamaEndpoint: string;
            slaTimeoutMs: number;
        }, {
            mode?: "AUTO_HARDWARE_ADAPTIVE" | "FORCE_ENABLED" | "DISABLED_CLOUD_ONLY" | undefined;
            preferredModelOverride?: string | null | undefined;
            ollamaEndpoint?: string | undefined;
            slaTimeoutMs?: number | undefined;
        }>>;
        gatekeeper: z.ZodDefault<z.ZodEffects<z.ZodObject<{
            enableHeuristicScanner: z.ZodDefault<z.ZodBoolean>;
            heuristicScannerTimeoutMs: z.ZodDefault<z.ZodNumber>;
            selfHealingMaxRetries: z.ZodDefault<z.ZodNumber>;
            enableWarRoomCircuitBreaker: z.ZodDefault<z.ZodBoolean>;
            useTiaTargetedTests: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            enableHeuristicScanner: boolean;
            heuristicScannerTimeoutMs: number;
            selfHealingMaxRetries: number;
            enableWarRoomCircuitBreaker: boolean;
            useTiaTargetedTests: boolean;
        }, {
            enableHeuristicScanner?: boolean | undefined;
            heuristicScannerTimeoutMs?: number | undefined;
            selfHealingMaxRetries?: number | undefined;
            enableWarRoomCircuitBreaker?: boolean | undefined;
            useTiaTargetedTests?: boolean | undefined;
        }>, {
            enableHeuristicScanner: boolean;
            heuristicScannerTimeoutMs: number;
            selfHealingMaxRetries: number;
            enableWarRoomCircuitBreaker: boolean;
            useTiaTargetedTests: boolean;
        }, unknown>>;
        communication: z.ZodDefault<z.ZodObject<{
            personaPreset: z.ZodDefault<z.ZodEnum<["ENGINEERING_PROFESSIONAL", "STARTUP_EXECUTIVE"]>>;
            cavemanMode: z.ZodDefault<z.ZodBoolean>;
            language: z.ZodDefault<z.ZodEnum<["en", "it"]>>;
            greetingRule3Options: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            personaPreset: "ENGINEERING_PROFESSIONAL" | "STARTUP_EXECUTIVE";
            cavemanMode: boolean;
            language: "en" | "it";
            greetingRule3Options: boolean;
        }, {
            personaPreset?: "ENGINEERING_PROFESSIONAL" | "STARTUP_EXECUTIVE" | undefined;
            cavemanMode?: boolean | undefined;
            language?: "en" | "it" | undefined;
            greetingRule3Options?: boolean | undefined;
        }>>;
        finops: z.ZodDefault<z.ZodObject<{
            maxSessionBudgetUsd: z.ZodDefault<z.ZodNumber>;
            safePauseOnBudgetExceeded: z.ZodDefault<z.ZodBoolean>;
            enableTwoTierPromptCache: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            maxSessionBudgetUsd: number;
            safePauseOnBudgetExceeded: boolean;
            enableTwoTierPromptCache: boolean;
        }, {
            maxSessionBudgetUsd?: number | undefined;
            safePauseOnBudgetExceeded?: boolean | undefined;
            enableTwoTierPromptCache?: boolean | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        version: string;
        governance: {
            spikeCheckpoint: "HITL_SPIKE_REVIEW" | "AUTONOMOUS_FAST_TRACK";
            anomalyGate: "STRICT_CFF_4_GATES" | "ADVISORY";
            releaseApproval: "CEO_MANDATORY" | "GATEKEEPER_AUTO";
            roundtableDevilsAdvocate: boolean;
        };
        localSlm: {
            mode: "AUTO_HARDWARE_ADAPTIVE" | "FORCE_ENABLED" | "DISABLED_CLOUD_ONLY";
            preferredModelOverride: string | null;
            ollamaEndpoint: string;
            slaTimeoutMs: number;
        };
        gatekeeper: {
            enableHeuristicScanner: boolean;
            heuristicScannerTimeoutMs: number;
            selfHealingMaxRetries: number;
            enableWarRoomCircuitBreaker: boolean;
            useTiaTargetedTests: boolean;
        };
        communication: {
            personaPreset: "ENGINEERING_PROFESSIONAL" | "STARTUP_EXECUTIVE";
            cavemanMode: boolean;
            language: "en" | "it";
            greetingRule3Options: boolean;
        };
        finops: {
            maxSessionBudgetUsd: number;
            safePauseOnBudgetExceeded: boolean;
            enableTwoTierPromptCache: boolean;
        };
    }, {
        version?: string | undefined;
        governance?: {
            spikeCheckpoint?: "HITL_SPIKE_REVIEW" | "AUTONOMOUS_FAST_TRACK" | undefined;
            anomalyGate?: "STRICT_CFF_4_GATES" | "ADVISORY" | undefined;
            releaseApproval?: "CEO_MANDATORY" | "GATEKEEPER_AUTO" | undefined;
            roundtableDevilsAdvocate?: boolean | undefined;
        } | undefined;
        localSlm?: {
            mode?: "AUTO_HARDWARE_ADAPTIVE" | "FORCE_ENABLED" | "DISABLED_CLOUD_ONLY" | undefined;
            preferredModelOverride?: string | null | undefined;
            ollamaEndpoint?: string | undefined;
            slaTimeoutMs?: number | undefined;
        } | undefined;
        gatekeeper?: unknown;
        communication?: {
            personaPreset?: "ENGINEERING_PROFESSIONAL" | "STARTUP_EXECUTIVE" | undefined;
            cavemanMode?: boolean | undefined;
            language?: "en" | "it" | undefined;
            greetingRule3Options?: boolean | undefined;
        } | undefined;
        finops?: {
            maxSessionBudgetUsd?: number | undefined;
            safePauseOnBudgetExceeded?: boolean | undefined;
            enableTwoTierPromptCache?: boolean | undefined;
        } | undefined;
    }>;
    assertionsPassed: z.ZodNumber;
    assertionsTotal: z.ZodNumber;
    fpyPercentage: z.ZodNumber;
    status: z.ZodEnum<["PASSED", "FAILED"]>;
    logTrail: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    status: "FAILED" | "PASSED";
    fpyPercentage: number;
    scenarioId: "SCENARIO_A_CEO_MAX_CONTROL" | "SCENARIO_B_AUTONOMOUS_FAST_TRACK" | "SCENARIO_C_LOCAL_FIRST_AIRGAP" | "SCENARIO_D_STRICT_IMMUNE_DEFENSE";
    workspacePath: string;
    stackType: "python_fastapi" | "typescript_node" | "airgap_worker" | "brownfield_chaos";
    settingsSnapshot: {
        version: string;
        governance: {
            spikeCheckpoint: "HITL_SPIKE_REVIEW" | "AUTONOMOUS_FAST_TRACK";
            anomalyGate: "STRICT_CFF_4_GATES" | "ADVISORY";
            releaseApproval: "CEO_MANDATORY" | "GATEKEEPER_AUTO";
            roundtableDevilsAdvocate: boolean;
        };
        localSlm: {
            mode: "AUTO_HARDWARE_ADAPTIVE" | "FORCE_ENABLED" | "DISABLED_CLOUD_ONLY";
            preferredModelOverride: string | null;
            ollamaEndpoint: string;
            slaTimeoutMs: number;
        };
        gatekeeper: {
            enableHeuristicScanner: boolean;
            heuristicScannerTimeoutMs: number;
            selfHealingMaxRetries: number;
            enableWarRoomCircuitBreaker: boolean;
            useTiaTargetedTests: boolean;
        };
        communication: {
            personaPreset: "ENGINEERING_PROFESSIONAL" | "STARTUP_EXECUTIVE";
            cavemanMode: boolean;
            language: "en" | "it";
            greetingRule3Options: boolean;
        };
        finops: {
            maxSessionBudgetUsd: number;
            safePauseOnBudgetExceeded: boolean;
            enableTwoTierPromptCache: boolean;
        };
    };
    assertionsPassed: number;
    assertionsTotal: number;
    logTrail: string[];
}, {
    status: "FAILED" | "PASSED";
    fpyPercentage: number;
    scenarioId: "SCENARIO_A_CEO_MAX_CONTROL" | "SCENARIO_B_AUTONOMOUS_FAST_TRACK" | "SCENARIO_C_LOCAL_FIRST_AIRGAP" | "SCENARIO_D_STRICT_IMMUNE_DEFENSE";
    workspacePath: string;
    stackType: "python_fastapi" | "typescript_node" | "airgap_worker" | "brownfield_chaos";
    settingsSnapshot: {
        version?: string | undefined;
        governance?: {
            spikeCheckpoint?: "HITL_SPIKE_REVIEW" | "AUTONOMOUS_FAST_TRACK" | undefined;
            anomalyGate?: "STRICT_CFF_4_GATES" | "ADVISORY" | undefined;
            releaseApproval?: "CEO_MANDATORY" | "GATEKEEPER_AUTO" | undefined;
            roundtableDevilsAdvocate?: boolean | undefined;
        } | undefined;
        localSlm?: {
            mode?: "AUTO_HARDWARE_ADAPTIVE" | "FORCE_ENABLED" | "DISABLED_CLOUD_ONLY" | undefined;
            preferredModelOverride?: string | null | undefined;
            ollamaEndpoint?: string | undefined;
            slaTimeoutMs?: number | undefined;
        } | undefined;
        gatekeeper?: unknown;
        communication?: {
            personaPreset?: "ENGINEERING_PROFESSIONAL" | "STARTUP_EXECUTIVE" | undefined;
            cavemanMode?: boolean | undefined;
            language?: "en" | "it" | undefined;
            greetingRule3Options?: boolean | undefined;
        } | undefined;
        finops?: {
            maxSessionBudgetUsd?: number | undefined;
            safePauseOnBudgetExceeded?: boolean | undefined;
            enableTwoTierPromptCache?: boolean | undefined;
        } | undefined;
    };
    assertionsPassed: number;
    assertionsTotal: number;
    logTrail: string[];
}>;
export type SettingsEvalResult = z.infer<typeof SettingsEvalResultSchema>;
export declare const SettingsEvalScorecardSchema: z.ZodObject<{
    evalSessionId: z.ZodString;
    executedAt: z.ZodString;
    totalScenarios: z.ZodNumber;
    passedScenarios: z.ZodNumber;
    overallScore: z.ZodNumber;
    verdict: z.ZodEnum<["SETTINGS_VERIFIED", "SETTINGS_DEGRADED", "SETTINGS_FAILED"]>;
    scenarios: z.ZodArray<z.ZodObject<{
        scenarioId: z.ZodEnum<["SCENARIO_A_CEO_MAX_CONTROL", "SCENARIO_B_AUTONOMOUS_FAST_TRACK", "SCENARIO_C_LOCAL_FIRST_AIRGAP", "SCENARIO_D_STRICT_IMMUNE_DEFENSE"]>;
        workspacePath: z.ZodString;
        stackType: z.ZodEnum<["python_fastapi", "typescript_node", "airgap_worker", "brownfield_chaos"]>;
        settingsSnapshot: z.ZodObject<{
            version: z.ZodDefault<z.ZodString>;
            governance: z.ZodDefault<z.ZodObject<{
                spikeCheckpoint: z.ZodDefault<z.ZodEnum<["HITL_SPIKE_REVIEW", "AUTONOMOUS_FAST_TRACK"]>>;
                anomalyGate: z.ZodDefault<z.ZodEnum<["STRICT_CFF_4_GATES", "ADVISORY"]>>;
                releaseApproval: z.ZodDefault<z.ZodEnum<["CEO_MANDATORY", "GATEKEEPER_AUTO"]>>;
                roundtableDevilsAdvocate: z.ZodDefault<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                spikeCheckpoint: "HITL_SPIKE_REVIEW" | "AUTONOMOUS_FAST_TRACK";
                anomalyGate: "STRICT_CFF_4_GATES" | "ADVISORY";
                releaseApproval: "CEO_MANDATORY" | "GATEKEEPER_AUTO";
                roundtableDevilsAdvocate: boolean;
            }, {
                spikeCheckpoint?: "HITL_SPIKE_REVIEW" | "AUTONOMOUS_FAST_TRACK" | undefined;
                anomalyGate?: "STRICT_CFF_4_GATES" | "ADVISORY" | undefined;
                releaseApproval?: "CEO_MANDATORY" | "GATEKEEPER_AUTO" | undefined;
                roundtableDevilsAdvocate?: boolean | undefined;
            }>>;
            localSlm: z.ZodDefault<z.ZodObject<{
                mode: z.ZodDefault<z.ZodEnum<["AUTO_HARDWARE_ADAPTIVE", "FORCE_ENABLED", "DISABLED_CLOUD_ONLY"]>>;
                preferredModelOverride: z.ZodDefault<z.ZodNullable<z.ZodString>>;
                ollamaEndpoint: z.ZodDefault<z.ZodString>;
                slaTimeoutMs: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                mode: "AUTO_HARDWARE_ADAPTIVE" | "FORCE_ENABLED" | "DISABLED_CLOUD_ONLY";
                preferredModelOverride: string | null;
                ollamaEndpoint: string;
                slaTimeoutMs: number;
            }, {
                mode?: "AUTO_HARDWARE_ADAPTIVE" | "FORCE_ENABLED" | "DISABLED_CLOUD_ONLY" | undefined;
                preferredModelOverride?: string | null | undefined;
                ollamaEndpoint?: string | undefined;
                slaTimeoutMs?: number | undefined;
            }>>;
            gatekeeper: z.ZodDefault<z.ZodEffects<z.ZodObject<{
                enableHeuristicScanner: z.ZodDefault<z.ZodBoolean>;
                heuristicScannerTimeoutMs: z.ZodDefault<z.ZodNumber>;
                selfHealingMaxRetries: z.ZodDefault<z.ZodNumber>;
                enableWarRoomCircuitBreaker: z.ZodDefault<z.ZodBoolean>;
                useTiaTargetedTests: z.ZodDefault<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                enableHeuristicScanner: boolean;
                heuristicScannerTimeoutMs: number;
                selfHealingMaxRetries: number;
                enableWarRoomCircuitBreaker: boolean;
                useTiaTargetedTests: boolean;
            }, {
                enableHeuristicScanner?: boolean | undefined;
                heuristicScannerTimeoutMs?: number | undefined;
                selfHealingMaxRetries?: number | undefined;
                enableWarRoomCircuitBreaker?: boolean | undefined;
                useTiaTargetedTests?: boolean | undefined;
            }>, {
                enableHeuristicScanner: boolean;
                heuristicScannerTimeoutMs: number;
                selfHealingMaxRetries: number;
                enableWarRoomCircuitBreaker: boolean;
                useTiaTargetedTests: boolean;
            }, unknown>>;
            communication: z.ZodDefault<z.ZodObject<{
                personaPreset: z.ZodDefault<z.ZodEnum<["ENGINEERING_PROFESSIONAL", "STARTUP_EXECUTIVE"]>>;
                cavemanMode: z.ZodDefault<z.ZodBoolean>;
                language: z.ZodDefault<z.ZodEnum<["en", "it"]>>;
                greetingRule3Options: z.ZodDefault<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                personaPreset: "ENGINEERING_PROFESSIONAL" | "STARTUP_EXECUTIVE";
                cavemanMode: boolean;
                language: "en" | "it";
                greetingRule3Options: boolean;
            }, {
                personaPreset?: "ENGINEERING_PROFESSIONAL" | "STARTUP_EXECUTIVE" | undefined;
                cavemanMode?: boolean | undefined;
                language?: "en" | "it" | undefined;
                greetingRule3Options?: boolean | undefined;
            }>>;
            finops: z.ZodDefault<z.ZodObject<{
                maxSessionBudgetUsd: z.ZodDefault<z.ZodNumber>;
                safePauseOnBudgetExceeded: z.ZodDefault<z.ZodBoolean>;
                enableTwoTierPromptCache: z.ZodDefault<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                maxSessionBudgetUsd: number;
                safePauseOnBudgetExceeded: boolean;
                enableTwoTierPromptCache: boolean;
            }, {
                maxSessionBudgetUsd?: number | undefined;
                safePauseOnBudgetExceeded?: boolean | undefined;
                enableTwoTierPromptCache?: boolean | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            version: string;
            governance: {
                spikeCheckpoint: "HITL_SPIKE_REVIEW" | "AUTONOMOUS_FAST_TRACK";
                anomalyGate: "STRICT_CFF_4_GATES" | "ADVISORY";
                releaseApproval: "CEO_MANDATORY" | "GATEKEEPER_AUTO";
                roundtableDevilsAdvocate: boolean;
            };
            localSlm: {
                mode: "AUTO_HARDWARE_ADAPTIVE" | "FORCE_ENABLED" | "DISABLED_CLOUD_ONLY";
                preferredModelOverride: string | null;
                ollamaEndpoint: string;
                slaTimeoutMs: number;
            };
            gatekeeper: {
                enableHeuristicScanner: boolean;
                heuristicScannerTimeoutMs: number;
                selfHealingMaxRetries: number;
                enableWarRoomCircuitBreaker: boolean;
                useTiaTargetedTests: boolean;
            };
            communication: {
                personaPreset: "ENGINEERING_PROFESSIONAL" | "STARTUP_EXECUTIVE";
                cavemanMode: boolean;
                language: "en" | "it";
                greetingRule3Options: boolean;
            };
            finops: {
                maxSessionBudgetUsd: number;
                safePauseOnBudgetExceeded: boolean;
                enableTwoTierPromptCache: boolean;
            };
        }, {
            version?: string | undefined;
            governance?: {
                spikeCheckpoint?: "HITL_SPIKE_REVIEW" | "AUTONOMOUS_FAST_TRACK" | undefined;
                anomalyGate?: "STRICT_CFF_4_GATES" | "ADVISORY" | undefined;
                releaseApproval?: "CEO_MANDATORY" | "GATEKEEPER_AUTO" | undefined;
                roundtableDevilsAdvocate?: boolean | undefined;
            } | undefined;
            localSlm?: {
                mode?: "AUTO_HARDWARE_ADAPTIVE" | "FORCE_ENABLED" | "DISABLED_CLOUD_ONLY" | undefined;
                preferredModelOverride?: string | null | undefined;
                ollamaEndpoint?: string | undefined;
                slaTimeoutMs?: number | undefined;
            } | undefined;
            gatekeeper?: unknown;
            communication?: {
                personaPreset?: "ENGINEERING_PROFESSIONAL" | "STARTUP_EXECUTIVE" | undefined;
                cavemanMode?: boolean | undefined;
                language?: "en" | "it" | undefined;
                greetingRule3Options?: boolean | undefined;
            } | undefined;
            finops?: {
                maxSessionBudgetUsd?: number | undefined;
                safePauseOnBudgetExceeded?: boolean | undefined;
                enableTwoTierPromptCache?: boolean | undefined;
            } | undefined;
        }>;
        assertionsPassed: z.ZodNumber;
        assertionsTotal: z.ZodNumber;
        fpyPercentage: z.ZodNumber;
        status: z.ZodEnum<["PASSED", "FAILED"]>;
        logTrail: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        status: "FAILED" | "PASSED";
        fpyPercentage: number;
        scenarioId: "SCENARIO_A_CEO_MAX_CONTROL" | "SCENARIO_B_AUTONOMOUS_FAST_TRACK" | "SCENARIO_C_LOCAL_FIRST_AIRGAP" | "SCENARIO_D_STRICT_IMMUNE_DEFENSE";
        workspacePath: string;
        stackType: "python_fastapi" | "typescript_node" | "airgap_worker" | "brownfield_chaos";
        settingsSnapshot: {
            version: string;
            governance: {
                spikeCheckpoint: "HITL_SPIKE_REVIEW" | "AUTONOMOUS_FAST_TRACK";
                anomalyGate: "STRICT_CFF_4_GATES" | "ADVISORY";
                releaseApproval: "CEO_MANDATORY" | "GATEKEEPER_AUTO";
                roundtableDevilsAdvocate: boolean;
            };
            localSlm: {
                mode: "AUTO_HARDWARE_ADAPTIVE" | "FORCE_ENABLED" | "DISABLED_CLOUD_ONLY";
                preferredModelOverride: string | null;
                ollamaEndpoint: string;
                slaTimeoutMs: number;
            };
            gatekeeper: {
                enableHeuristicScanner: boolean;
                heuristicScannerTimeoutMs: number;
                selfHealingMaxRetries: number;
                enableWarRoomCircuitBreaker: boolean;
                useTiaTargetedTests: boolean;
            };
            communication: {
                personaPreset: "ENGINEERING_PROFESSIONAL" | "STARTUP_EXECUTIVE";
                cavemanMode: boolean;
                language: "en" | "it";
                greetingRule3Options: boolean;
            };
            finops: {
                maxSessionBudgetUsd: number;
                safePauseOnBudgetExceeded: boolean;
                enableTwoTierPromptCache: boolean;
            };
        };
        assertionsPassed: number;
        assertionsTotal: number;
        logTrail: string[];
    }, {
        status: "FAILED" | "PASSED";
        fpyPercentage: number;
        scenarioId: "SCENARIO_A_CEO_MAX_CONTROL" | "SCENARIO_B_AUTONOMOUS_FAST_TRACK" | "SCENARIO_C_LOCAL_FIRST_AIRGAP" | "SCENARIO_D_STRICT_IMMUNE_DEFENSE";
        workspacePath: string;
        stackType: "python_fastapi" | "typescript_node" | "airgap_worker" | "brownfield_chaos";
        settingsSnapshot: {
            version?: string | undefined;
            governance?: {
                spikeCheckpoint?: "HITL_SPIKE_REVIEW" | "AUTONOMOUS_FAST_TRACK" | undefined;
                anomalyGate?: "STRICT_CFF_4_GATES" | "ADVISORY" | undefined;
                releaseApproval?: "CEO_MANDATORY" | "GATEKEEPER_AUTO" | undefined;
                roundtableDevilsAdvocate?: boolean | undefined;
            } | undefined;
            localSlm?: {
                mode?: "AUTO_HARDWARE_ADAPTIVE" | "FORCE_ENABLED" | "DISABLED_CLOUD_ONLY" | undefined;
                preferredModelOverride?: string | null | undefined;
                ollamaEndpoint?: string | undefined;
                slaTimeoutMs?: number | undefined;
            } | undefined;
            gatekeeper?: unknown;
            communication?: {
                personaPreset?: "ENGINEERING_PROFESSIONAL" | "STARTUP_EXECUTIVE" | undefined;
                cavemanMode?: boolean | undefined;
                language?: "en" | "it" | undefined;
                greetingRule3Options?: boolean | undefined;
            } | undefined;
            finops?: {
                maxSessionBudgetUsd?: number | undefined;
                safePauseOnBudgetExceeded?: boolean | undefined;
                enableTwoTierPromptCache?: boolean | undefined;
            } | undefined;
        };
        assertionsPassed: number;
        assertionsTotal: number;
        logTrail: string[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    overallScore: number;
    verdict: "SETTINGS_VERIFIED" | "SETTINGS_DEGRADED" | "SETTINGS_FAILED";
    evalSessionId: string;
    executedAt: string;
    totalScenarios: number;
    passedScenarios: number;
    scenarios: {
        status: "FAILED" | "PASSED";
        fpyPercentage: number;
        scenarioId: "SCENARIO_A_CEO_MAX_CONTROL" | "SCENARIO_B_AUTONOMOUS_FAST_TRACK" | "SCENARIO_C_LOCAL_FIRST_AIRGAP" | "SCENARIO_D_STRICT_IMMUNE_DEFENSE";
        workspacePath: string;
        stackType: "python_fastapi" | "typescript_node" | "airgap_worker" | "brownfield_chaos";
        settingsSnapshot: {
            version: string;
            governance: {
                spikeCheckpoint: "HITL_SPIKE_REVIEW" | "AUTONOMOUS_FAST_TRACK";
                anomalyGate: "STRICT_CFF_4_GATES" | "ADVISORY";
                releaseApproval: "CEO_MANDATORY" | "GATEKEEPER_AUTO";
                roundtableDevilsAdvocate: boolean;
            };
            localSlm: {
                mode: "AUTO_HARDWARE_ADAPTIVE" | "FORCE_ENABLED" | "DISABLED_CLOUD_ONLY";
                preferredModelOverride: string | null;
                ollamaEndpoint: string;
                slaTimeoutMs: number;
            };
            gatekeeper: {
                enableHeuristicScanner: boolean;
                heuristicScannerTimeoutMs: number;
                selfHealingMaxRetries: number;
                enableWarRoomCircuitBreaker: boolean;
                useTiaTargetedTests: boolean;
            };
            communication: {
                personaPreset: "ENGINEERING_PROFESSIONAL" | "STARTUP_EXECUTIVE";
                cavemanMode: boolean;
                language: "en" | "it";
                greetingRule3Options: boolean;
            };
            finops: {
                maxSessionBudgetUsd: number;
                safePauseOnBudgetExceeded: boolean;
                enableTwoTierPromptCache: boolean;
            };
        };
        assertionsPassed: number;
        assertionsTotal: number;
        logTrail: string[];
    }[];
}, {
    overallScore: number;
    verdict: "SETTINGS_VERIFIED" | "SETTINGS_DEGRADED" | "SETTINGS_FAILED";
    evalSessionId: string;
    executedAt: string;
    totalScenarios: number;
    passedScenarios: number;
    scenarios: {
        status: "FAILED" | "PASSED";
        fpyPercentage: number;
        scenarioId: "SCENARIO_A_CEO_MAX_CONTROL" | "SCENARIO_B_AUTONOMOUS_FAST_TRACK" | "SCENARIO_C_LOCAL_FIRST_AIRGAP" | "SCENARIO_D_STRICT_IMMUNE_DEFENSE";
        workspacePath: string;
        stackType: "python_fastapi" | "typescript_node" | "airgap_worker" | "brownfield_chaos";
        settingsSnapshot: {
            version?: string | undefined;
            governance?: {
                spikeCheckpoint?: "HITL_SPIKE_REVIEW" | "AUTONOMOUS_FAST_TRACK" | undefined;
                anomalyGate?: "STRICT_CFF_4_GATES" | "ADVISORY" | undefined;
                releaseApproval?: "CEO_MANDATORY" | "GATEKEEPER_AUTO" | undefined;
                roundtableDevilsAdvocate?: boolean | undefined;
            } | undefined;
            localSlm?: {
                mode?: "AUTO_HARDWARE_ADAPTIVE" | "FORCE_ENABLED" | "DISABLED_CLOUD_ONLY" | undefined;
                preferredModelOverride?: string | null | undefined;
                ollamaEndpoint?: string | undefined;
                slaTimeoutMs?: number | undefined;
            } | undefined;
            gatekeeper?: unknown;
            communication?: {
                personaPreset?: "ENGINEERING_PROFESSIONAL" | "STARTUP_EXECUTIVE" | undefined;
                cavemanMode?: boolean | undefined;
                language?: "en" | "it" | undefined;
                greetingRule3Options?: boolean | undefined;
            } | undefined;
            finops?: {
                maxSessionBudgetUsd?: number | undefined;
                safePauseOnBudgetExceeded?: boolean | undefined;
                enableTwoTierPromptCache?: boolean | undefined;
            } | undefined;
        };
        assertionsPassed: number;
        assertionsTotal: number;
        logTrail: string[];
    }[];
}>;
export type SettingsEvalScorecard = z.infer<typeof SettingsEvalScorecardSchema>;
//# sourceMappingURL=settings-eval.d.ts.map