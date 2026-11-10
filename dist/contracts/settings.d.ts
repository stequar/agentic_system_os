import { z } from "zod";
export declare const SpikeCheckpointModeSchema: z.ZodEnum<["HITL_SPIKE_REVIEW", "AUTONOMOUS_FAST_TRACK"]>;
export type SpikeCheckpointMode = z.infer<typeof SpikeCheckpointModeSchema>;
export declare const AnomalyGateModeSchema: z.ZodEnum<["STRICT_CFF_4_GATES", "ADVISORY"]>;
export type AnomalyGateMode = z.infer<typeof AnomalyGateModeSchema>;
export declare const ReleaseApprovalModeSchema: z.ZodEnum<["CEO_MANDATORY", "GATEKEEPER_AUTO"]>;
export type ReleaseApprovalMode = z.infer<typeof ReleaseApprovalModeSchema>;
export declare const LocalSlmExecutionModeSchema: z.ZodEnum<["AUTO_HARDWARE_ADAPTIVE", "FORCE_ENABLED", "DISABLED_CLOUD_ONLY"]>;
export type LocalSlmExecutionMode = z.infer<typeof LocalSlmExecutionModeSchema>;
export declare const CompanyLanguageSchema: z.ZodEnum<["en", "it"]>;
export type CompanyLanguage = z.infer<typeof CompanyLanguageSchema>;
export declare const PersonaPresetSchema: z.ZodEnum<["ENGINEERING_PROFESSIONAL", "STARTUP_EXECUTIVE"]>;
export type PersonaPreset = z.infer<typeof PersonaPresetSchema>;
export declare const GovernanceSettingsSchema: z.ZodObject<{
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
}>;
export declare const LocalSlmSettingsSchema: z.ZodObject<{
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
}>;
/**
 * TCK-DH.2b Phase 2 — honest canonical keys only (`enableHeuristicScanner` /
 * `heuristicScannerTimeoutMs`). The preprocess performs a ONE-WAY migration of the
 * legacy `enableFormalAstProver` / `formalProverTimeoutMs` keys from existing
 * `.company-os/settings.json` files (legacy -> canonical only if canonical is absent),
 * so field settings keep their operator values on upgrade. The legacy keys are no
 * longer part of the schema and are stripped from the parsed output.
 */
export declare const GatekeeperSettingsSchema: z.ZodEffects<z.ZodObject<{
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
}, unknown>;
export declare const CommunicationSettingsSchema: z.ZodObject<{
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
}>;
export declare const FinOpsSettingsSchema: z.ZodObject<{
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
}>;
export declare const CompanySettingsSchema: z.ZodObject<{
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
export type CompanySettings = z.infer<typeof CompanySettingsSchema>;
export interface SettingReferenceEntry {
    key: string;
    section: "governance" | "localSlm" | "gatekeeper" | "communication" | "finops";
    type: "enum" | "boolean" | "number" | "string" | "string | null";
    possibleValues: string[];
    defaultValue: string | number | boolean | null;
    description: string;
}
export declare const SETTINGS_REFERENCE_CATALOG: SettingReferenceEntry[];
//# sourceMappingURL=settings.d.ts.map