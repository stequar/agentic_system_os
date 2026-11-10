import { z } from "zod";
import { type CrossDomainContract } from "../contracts/sync.js";
/**
 * Contratto cross-domain canonico per il workspace poliglotto `/Users/stequar/fitness_project`
 * (Python FastAPI + iOS SwiftUI).
 */
export declare const FITNESS_PROJECT_UNIFIED_CONTRACT: CrossDomainContract;
/**
 * Stato delle 5 fasi di esecuzione del Live Dogfooding su `fitness_project`.
 */
export declare const DogfoodingPhaseNameSchema: z.ZodEnum<["INSPECT", "DOCTOR", "DRY_RUN_ATTACH", "LIVE_ATTACH_AND_IDEMPOTENCY", "CROSS_DOMAIN_CONTRACT_SYNC"]>;
export type DogfoodingPhaseName = z.infer<typeof DogfoodingPhaseNameSchema>;
/**
 * Schema Zod completo per il report certificato delle 5 fasi di Dogfooding (TCK-17.3).
 */
export declare const DogfoodingReportSchema: z.ZodObject<{
    targetPath: z.ZodString;
    phasesCompleted: z.ZodArray<z.ZodEnum<["INSPECT", "DOCTOR", "DRY_RUN_ATTACH", "LIVE_ATTACH_AND_IDEMPOTENCY", "CROSS_DOMAIN_CONTRACT_SYNC"]>, "many">;
    inspectResult: z.ZodObject<{
        targetPath: z.ZodString;
        languages: z.ZodArray<z.ZodString, "many">;
        frameworks: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        hasDocker: z.ZodDefault<z.ZodBoolean>;
        packageManagers: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        testCommands: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        entryPoints: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        detectedAt: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        targetPath: string;
        languages: string[];
        frameworks: string[];
        hasDocker: boolean;
        packageManagers: string[];
        testCommands: string[];
        entryPoints: string[];
        detectedAt: string;
    }, {
        targetPath: string;
        languages: string[];
        frameworks?: string[] | undefined;
        hasDocker?: boolean | undefined;
        packageManagers?: string[] | undefined;
        testCommands?: string[] | undefined;
        entryPoints?: string[] | undefined;
        detectedAt?: string | undefined;
    }>;
    doctorReport: z.ZodObject<{
        targetPath: z.ZodString;
        overallStatus: z.ZodEnum<["ok", "warn", "error"]>;
        checks: z.ZodArray<z.ZodObject<{
            checkName: z.ZodString;
            category: z.ZodEnum<["runtime", "compiler", "daemon", "vcs", "workspace"]>;
            status: z.ZodEnum<["ok", "warn", "error", "skipped"]>;
            version: z.ZodOptional<z.ZodString>;
            message: z.ZodString;
            fixSuggested: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            message: string;
            status: "warn" | "error" | "ok" | "skipped";
            category: "runtime" | "compiler" | "daemon" | "vcs" | "workspace";
            checkName: string;
            version?: string | undefined;
            fixSuggested?: string | undefined;
        }, {
            message: string;
            status: "warn" | "error" | "ok" | "skipped";
            category: "runtime" | "compiler" | "daemon" | "vcs" | "workspace";
            checkName: string;
            version?: string | undefined;
            fixSuggested?: string | undefined;
        }>, "many">;
        checkedAt: z.ZodString;
        durationMs: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        targetPath: string;
        durationMs: number;
        overallStatus: "warn" | "error" | "ok";
        checks: {
            message: string;
            status: "warn" | "error" | "ok" | "skipped";
            category: "runtime" | "compiler" | "daemon" | "vcs" | "workspace";
            checkName: string;
            version?: string | undefined;
            fixSuggested?: string | undefined;
        }[];
        checkedAt: string;
    }, {
        targetPath: string;
        durationMs: number;
        overallStatus: "warn" | "error" | "ok";
        checks: {
            message: string;
            status: "warn" | "error" | "ok" | "skipped";
            category: "runtime" | "compiler" | "daemon" | "vcs" | "workspace";
            checkName: string;
            version?: string | undefined;
            fixSuggested?: string | undefined;
        }[];
        checkedAt: string;
    }>;
    dryRunAttachResult: z.ZodObject<{
        targetPath: z.ZodString;
        success: z.ZodBoolean;
        injectedFiles: z.ZodArray<z.ZodObject<{
            path: z.ZodString;
            status: z.ZodEnum<["CREATED", "OVERWRITTEN", "SKIPPED_UNCHANGED", "BACKED_UP_AND_OVERWRITTEN"]>;
            backupPath: z.ZodOptional<z.ZodString>;
            sha256: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            path: string;
            status: "CREATED" | "OVERWRITTEN" | "SKIPPED_UNCHANGED" | "BACKED_UP_AND_OVERWRITTEN";
            sha256: string;
            backupPath?: string | undefined;
        }, {
            path: string;
            status: "CREATED" | "OVERWRITTEN" | "SKIPPED_UNCHANGED" | "BACKED_UP_AND_OVERWRITTEN";
            sha256: string;
            backupPath?: string | undefined;
        }>, "many">;
        summary: z.ZodString;
        attachedAt: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        targetPath: string;
        success: boolean;
        injectedFiles: {
            path: string;
            status: "CREATED" | "OVERWRITTEN" | "SKIPPED_UNCHANGED" | "BACKED_UP_AND_OVERWRITTEN";
            sha256: string;
            backupPath?: string | undefined;
        }[];
        summary: string;
        attachedAt: string;
    }, {
        targetPath: string;
        success: boolean;
        injectedFiles: {
            path: string;
            status: "CREATED" | "OVERWRITTEN" | "SKIPPED_UNCHANGED" | "BACKED_UP_AND_OVERWRITTEN";
            sha256: string;
            backupPath?: string | undefined;
        }[];
        summary: string;
        attachedAt?: string | undefined;
    }>;
    liveAttachResult: z.ZodObject<{
        targetPath: z.ZodString;
        success: z.ZodBoolean;
        injectedFiles: z.ZodArray<z.ZodObject<{
            path: z.ZodString;
            status: z.ZodEnum<["CREATED", "OVERWRITTEN", "SKIPPED_UNCHANGED", "BACKED_UP_AND_OVERWRITTEN"]>;
            backupPath: z.ZodOptional<z.ZodString>;
            sha256: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            path: string;
            status: "CREATED" | "OVERWRITTEN" | "SKIPPED_UNCHANGED" | "BACKED_UP_AND_OVERWRITTEN";
            sha256: string;
            backupPath?: string | undefined;
        }, {
            path: string;
            status: "CREATED" | "OVERWRITTEN" | "SKIPPED_UNCHANGED" | "BACKED_UP_AND_OVERWRITTEN";
            sha256: string;
            backupPath?: string | undefined;
        }>, "many">;
        summary: z.ZodString;
        attachedAt: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        targetPath: string;
        success: boolean;
        injectedFiles: {
            path: string;
            status: "CREATED" | "OVERWRITTEN" | "SKIPPED_UNCHANGED" | "BACKED_UP_AND_OVERWRITTEN";
            sha256: string;
            backupPath?: string | undefined;
        }[];
        summary: string;
        attachedAt: string;
    }, {
        targetPath: string;
        success: boolean;
        injectedFiles: {
            path: string;
            status: "CREATED" | "OVERWRITTEN" | "SKIPPED_UNCHANGED" | "BACKED_UP_AND_OVERWRITTEN";
            sha256: string;
            backupPath?: string | undefined;
        }[];
        summary: string;
        attachedAt?: string | undefined;
    }>;
    idempotencyAttachResult: z.ZodObject<{
        targetPath: z.ZodString;
        success: z.ZodBoolean;
        injectedFiles: z.ZodArray<z.ZodObject<{
            path: z.ZodString;
            status: z.ZodEnum<["CREATED", "OVERWRITTEN", "SKIPPED_UNCHANGED", "BACKED_UP_AND_OVERWRITTEN"]>;
            backupPath: z.ZodOptional<z.ZodString>;
            sha256: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            path: string;
            status: "CREATED" | "OVERWRITTEN" | "SKIPPED_UNCHANGED" | "BACKED_UP_AND_OVERWRITTEN";
            sha256: string;
            backupPath?: string | undefined;
        }, {
            path: string;
            status: "CREATED" | "OVERWRITTEN" | "SKIPPED_UNCHANGED" | "BACKED_UP_AND_OVERWRITTEN";
            sha256: string;
            backupPath?: string | undefined;
        }>, "many">;
        summary: z.ZodString;
        attachedAt: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        targetPath: string;
        success: boolean;
        injectedFiles: {
            path: string;
            status: "CREATED" | "OVERWRITTEN" | "SKIPPED_UNCHANGED" | "BACKED_UP_AND_OVERWRITTEN";
            sha256: string;
            backupPath?: string | undefined;
        }[];
        summary: string;
        attachedAt: string;
    }, {
        targetPath: string;
        success: boolean;
        injectedFiles: {
            path: string;
            status: "CREATED" | "OVERWRITTEN" | "SKIPPED_UNCHANGED" | "BACKED_UP_AND_OVERWRITTEN";
            sha256: string;
            backupPath?: string | undefined;
        }[];
        summary: string;
        attachedAt?: string | undefined;
    }>;
    idempotencyVerified: z.ZodBoolean;
    contractSyncResult: z.ZodObject<{
        pythonCode: z.ZodString;
        swiftCode: z.ZodString;
        modelsSynced: z.ZodArray<z.ZodString, "many">;
        writtenFiles: z.ZodArray<z.ZodObject<{
            path: z.ZodString;
            status: z.ZodEnum<["CREATED", "OVERWRITTEN", "SKIPPED_UNCHANGED", "BACKED_UP_AND_OVERWRITTEN"]>;
            backupPath: z.ZodOptional<z.ZodString>;
            sha256: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            path: string;
            status: "CREATED" | "OVERWRITTEN" | "SKIPPED_UNCHANGED" | "BACKED_UP_AND_OVERWRITTEN";
            sha256: string;
            backupPath?: string | undefined;
        }, {
            path: string;
            status: "CREATED" | "OVERWRITTEN" | "SKIPPED_UNCHANGED" | "BACKED_UP_AND_OVERWRITTEN";
            sha256: string;
            backupPath?: string | undefined;
        }>, "many">;
        sha256Python: z.ZodString;
        sha256Swift: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        pythonCode: string;
        swiftCode: string;
        modelsSynced: string[];
        writtenFiles: {
            path: string;
            status: "CREATED" | "OVERWRITTEN" | "SKIPPED_UNCHANGED" | "BACKED_UP_AND_OVERWRITTEN";
            sha256: string;
            backupPath?: string | undefined;
        }[];
        sha256Python: string;
        sha256Swift: string;
    }, {
        pythonCode: string;
        swiftCode: string;
        modelsSynced: string[];
        writtenFiles: {
            path: string;
            status: "CREATED" | "OVERWRITTEN" | "SKIPPED_UNCHANGED" | "BACKED_UP_AND_OVERWRITTEN";
            sha256: string;
            backupPath?: string | undefined;
        }[];
        sha256Python: string;
        sha256Swift: string;
    }>;
    orgChart: z.ZodOptional<z.ZodObject<{
        targetPath: z.ZodString;
        generatedAt: z.ZodString;
        ring0CoreLeads: z.ZodArray<z.ZodString, "many">;
        ring1TechSpecialists: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            ring: z.ZodEnum<["RING_0_CORE", "RING_1_TECH_SPECIALIST", "RING_2_DOMAIN_EXPERT"]>;
            origin: z.ZodEnum<["CATALOG", "OPEN_ENDED_SYNTHESIS", "PRESERVED_EXISTING", "SEMANTIC_MINED"]>;
            boundedContext: z.ZodString;
            domainKeywords: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            domainScope: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            domainInvariants: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            microRoleCard: z.ZodString;
            testCommand: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            title: string;
            id: string;
            microRoleCard: string;
            ring: "RING_0_CORE" | "RING_1_TECH_SPECIALIST" | "RING_2_DOMAIN_EXPERT";
            origin: "CATALOG" | "OPEN_ENDED_SYNTHESIS" | "PRESERVED_EXISTING" | "SEMANTIC_MINED";
            boundedContext: string;
            domainKeywords: string[];
            domainScope: string[];
            domainInvariants: string[];
            testCommand?: string | undefined;
        }, {
            title: string;
            id: string;
            microRoleCard: string;
            ring: "RING_0_CORE" | "RING_1_TECH_SPECIALIST" | "RING_2_DOMAIN_EXPERT";
            origin: "CATALOG" | "OPEN_ENDED_SYNTHESIS" | "PRESERVED_EXISTING" | "SEMANTIC_MINED";
            boundedContext: string;
            domainKeywords?: string[] | undefined;
            domainScope?: string[] | undefined;
            domainInvariants?: string[] | undefined;
            testCommand?: string | undefined;
        }>, "many">;
        ring2DomainExperts: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            ring: z.ZodEnum<["RING_0_CORE", "RING_1_TECH_SPECIALIST", "RING_2_DOMAIN_EXPERT"]>;
            origin: z.ZodEnum<["CATALOG", "OPEN_ENDED_SYNTHESIS", "PRESERVED_EXISTING", "SEMANTIC_MINED"]>;
            boundedContext: z.ZodString;
            domainKeywords: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            domainScope: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            domainInvariants: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            microRoleCard: z.ZodString;
            testCommand: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            title: string;
            id: string;
            microRoleCard: string;
            ring: "RING_0_CORE" | "RING_1_TECH_SPECIALIST" | "RING_2_DOMAIN_EXPERT";
            origin: "CATALOG" | "OPEN_ENDED_SYNTHESIS" | "PRESERVED_EXISTING" | "SEMANTIC_MINED";
            boundedContext: string;
            domainKeywords: string[];
            domainScope: string[];
            domainInvariants: string[];
            testCommand?: string | undefined;
        }, {
            title: string;
            id: string;
            microRoleCard: string;
            ring: "RING_0_CORE" | "RING_1_TECH_SPECIALIST" | "RING_2_DOMAIN_EXPERT";
            origin: "CATALOG" | "OPEN_ENDED_SYNTHESIS" | "PRESERVED_EXISTING" | "SEMANTIC_MINED";
            boundedContext: string;
            domainKeywords?: string[] | undefined;
            domainScope?: string[] | undefined;
            domainInvariants?: string[] | undefined;
            testCommand?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        targetPath: string;
        generatedAt: string;
        ring0CoreLeads: string[];
        ring1TechSpecialists: {
            title: string;
            id: string;
            microRoleCard: string;
            ring: "RING_0_CORE" | "RING_1_TECH_SPECIALIST" | "RING_2_DOMAIN_EXPERT";
            origin: "CATALOG" | "OPEN_ENDED_SYNTHESIS" | "PRESERVED_EXISTING" | "SEMANTIC_MINED";
            boundedContext: string;
            domainKeywords: string[];
            domainScope: string[];
            domainInvariants: string[];
            testCommand?: string | undefined;
        }[];
        ring2DomainExperts: {
            title: string;
            id: string;
            microRoleCard: string;
            ring: "RING_0_CORE" | "RING_1_TECH_SPECIALIST" | "RING_2_DOMAIN_EXPERT";
            origin: "CATALOG" | "OPEN_ENDED_SYNTHESIS" | "PRESERVED_EXISTING" | "SEMANTIC_MINED";
            boundedContext: string;
            domainKeywords: string[];
            domainScope: string[];
            domainInvariants: string[];
            testCommand?: string | undefined;
        }[];
    }, {
        targetPath: string;
        generatedAt: string;
        ring0CoreLeads: string[];
        ring1TechSpecialists: {
            title: string;
            id: string;
            microRoleCard: string;
            ring: "RING_0_CORE" | "RING_1_TECH_SPECIALIST" | "RING_2_DOMAIN_EXPERT";
            origin: "CATALOG" | "OPEN_ENDED_SYNTHESIS" | "PRESERVED_EXISTING" | "SEMANTIC_MINED";
            boundedContext: string;
            domainKeywords?: string[] | undefined;
            domainScope?: string[] | undefined;
            domainInvariants?: string[] | undefined;
            testCommand?: string | undefined;
        }[];
        ring2DomainExperts: {
            title: string;
            id: string;
            microRoleCard: string;
            ring: "RING_0_CORE" | "RING_1_TECH_SPECIALIST" | "RING_2_DOMAIN_EXPERT";
            origin: "CATALOG" | "OPEN_ENDED_SYNTHESIS" | "PRESERVED_EXISTING" | "SEMANTIC_MINED";
            boundedContext: string;
            domainKeywords?: string[] | undefined;
            domainScope?: string[] | undefined;
            domainInvariants?: string[] | undefined;
            testCommand?: string | undefined;
        }[];
    }>>;
    driftReport: z.ZodOptional<z.ZodObject<{
        targetPath: z.ZodString;
        hasDrift: z.ZodBoolean;
        findings: z.ZodArray<z.ZodObject<{
            modelName: z.ZodString;
            fieldName: z.ZodString;
            issueType: z.ZodEnum<["TYPE_MISMATCH", "MISSING_FIELD", "NAMING_ASYMMETRY", "MISSING_CODING_KEYS"]>;
            pythonOrSqlType: z.ZodOptional<z.ZodString>;
            swiftType: z.ZodOptional<z.ZodString>;
            recommendation: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            modelName: string;
            fieldName: string;
            issueType: "TYPE_MISMATCH" | "MISSING_FIELD" | "NAMING_ASYMMETRY" | "MISSING_CODING_KEYS";
            recommendation: string;
            pythonOrSqlType?: string | undefined;
            swiftType?: string | undefined;
        }, {
            modelName: string;
            fieldName: string;
            issueType: "TYPE_MISMATCH" | "MISSING_FIELD" | "NAMING_ASYMMETRY" | "MISSING_CODING_KEYS";
            recommendation: string;
            pythonOrSqlType?: string | undefined;
            swiftType?: string | undefined;
        }>, "many">;
        inspectedFiles: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        targetPath: string;
        hasDrift: boolean;
        findings: {
            modelName: string;
            fieldName: string;
            issueType: "TYPE_MISMATCH" | "MISSING_FIELD" | "NAMING_ASYMMETRY" | "MISSING_CODING_KEYS";
            recommendation: string;
            pythonOrSqlType?: string | undefined;
            swiftType?: string | undefined;
        }[];
        inspectedFiles: string[];
    }, {
        targetPath: string;
        hasDrift: boolean;
        findings: {
            modelName: string;
            fieldName: string;
            issueType: "TYPE_MISMATCH" | "MISSING_FIELD" | "NAMING_ASYMMETRY" | "MISSING_CODING_KEYS";
            recommendation: string;
            pythonOrSqlType?: string | undefined;
            swiftType?: string | undefined;
        }[];
        inspectedFiles: string[];
    }>>;
    completedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    targetPath: string;
    phasesCompleted: ("INSPECT" | "DOCTOR" | "DRY_RUN_ATTACH" | "LIVE_ATTACH_AND_IDEMPOTENCY" | "CROSS_DOMAIN_CONTRACT_SYNC")[];
    doctorReport: {
        targetPath: string;
        durationMs: number;
        overallStatus: "warn" | "error" | "ok";
        checks: {
            message: string;
            status: "warn" | "error" | "ok" | "skipped";
            category: "runtime" | "compiler" | "daemon" | "vcs" | "workspace";
            checkName: string;
            version?: string | undefined;
            fixSuggested?: string | undefined;
        }[];
        checkedAt: string;
    };
    contractSyncResult: {
        pythonCode: string;
        swiftCode: string;
        modelsSynced: string[];
        writtenFiles: {
            path: string;
            status: "CREATED" | "OVERWRITTEN" | "SKIPPED_UNCHANGED" | "BACKED_UP_AND_OVERWRITTEN";
            sha256: string;
            backupPath?: string | undefined;
        }[];
        sha256Python: string;
        sha256Swift: string;
    };
    idempotencyVerified: boolean;
    completedAt: string;
    inspectResult: {
        targetPath: string;
        languages: string[];
        frameworks: string[];
        hasDocker: boolean;
        packageManagers: string[];
        testCommands: string[];
        entryPoints: string[];
        detectedAt: string;
    };
    dryRunAttachResult: {
        targetPath: string;
        success: boolean;
        injectedFiles: {
            path: string;
            status: "CREATED" | "OVERWRITTEN" | "SKIPPED_UNCHANGED" | "BACKED_UP_AND_OVERWRITTEN";
            sha256: string;
            backupPath?: string | undefined;
        }[];
        summary: string;
        attachedAt: string;
    };
    liveAttachResult: {
        targetPath: string;
        success: boolean;
        injectedFiles: {
            path: string;
            status: "CREATED" | "OVERWRITTEN" | "SKIPPED_UNCHANGED" | "BACKED_UP_AND_OVERWRITTEN";
            sha256: string;
            backupPath?: string | undefined;
        }[];
        summary: string;
        attachedAt: string;
    };
    idempotencyAttachResult: {
        targetPath: string;
        success: boolean;
        injectedFiles: {
            path: string;
            status: "CREATED" | "OVERWRITTEN" | "SKIPPED_UNCHANGED" | "BACKED_UP_AND_OVERWRITTEN";
            sha256: string;
            backupPath?: string | undefined;
        }[];
        summary: string;
        attachedAt: string;
    };
    orgChart?: {
        targetPath: string;
        generatedAt: string;
        ring0CoreLeads: string[];
        ring1TechSpecialists: {
            title: string;
            id: string;
            microRoleCard: string;
            ring: "RING_0_CORE" | "RING_1_TECH_SPECIALIST" | "RING_2_DOMAIN_EXPERT";
            origin: "CATALOG" | "OPEN_ENDED_SYNTHESIS" | "PRESERVED_EXISTING" | "SEMANTIC_MINED";
            boundedContext: string;
            domainKeywords: string[];
            domainScope: string[];
            domainInvariants: string[];
            testCommand?: string | undefined;
        }[];
        ring2DomainExperts: {
            title: string;
            id: string;
            microRoleCard: string;
            ring: "RING_0_CORE" | "RING_1_TECH_SPECIALIST" | "RING_2_DOMAIN_EXPERT";
            origin: "CATALOG" | "OPEN_ENDED_SYNTHESIS" | "PRESERVED_EXISTING" | "SEMANTIC_MINED";
            boundedContext: string;
            domainKeywords: string[];
            domainScope: string[];
            domainInvariants: string[];
            testCommand?: string | undefined;
        }[];
    } | undefined;
    driftReport?: {
        targetPath: string;
        hasDrift: boolean;
        findings: {
            modelName: string;
            fieldName: string;
            issueType: "TYPE_MISMATCH" | "MISSING_FIELD" | "NAMING_ASYMMETRY" | "MISSING_CODING_KEYS";
            recommendation: string;
            pythonOrSqlType?: string | undefined;
            swiftType?: string | undefined;
        }[];
        inspectedFiles: string[];
    } | undefined;
}, {
    targetPath: string;
    phasesCompleted: ("INSPECT" | "DOCTOR" | "DRY_RUN_ATTACH" | "LIVE_ATTACH_AND_IDEMPOTENCY" | "CROSS_DOMAIN_CONTRACT_SYNC")[];
    doctorReport: {
        targetPath: string;
        durationMs: number;
        overallStatus: "warn" | "error" | "ok";
        checks: {
            message: string;
            status: "warn" | "error" | "ok" | "skipped";
            category: "runtime" | "compiler" | "daemon" | "vcs" | "workspace";
            checkName: string;
            version?: string | undefined;
            fixSuggested?: string | undefined;
        }[];
        checkedAt: string;
    };
    contractSyncResult: {
        pythonCode: string;
        swiftCode: string;
        modelsSynced: string[];
        writtenFiles: {
            path: string;
            status: "CREATED" | "OVERWRITTEN" | "SKIPPED_UNCHANGED" | "BACKED_UP_AND_OVERWRITTEN";
            sha256: string;
            backupPath?: string | undefined;
        }[];
        sha256Python: string;
        sha256Swift: string;
    };
    idempotencyVerified: boolean;
    completedAt: string;
    inspectResult: {
        targetPath: string;
        languages: string[];
        frameworks?: string[] | undefined;
        hasDocker?: boolean | undefined;
        packageManagers?: string[] | undefined;
        testCommands?: string[] | undefined;
        entryPoints?: string[] | undefined;
        detectedAt?: string | undefined;
    };
    dryRunAttachResult: {
        targetPath: string;
        success: boolean;
        injectedFiles: {
            path: string;
            status: "CREATED" | "OVERWRITTEN" | "SKIPPED_UNCHANGED" | "BACKED_UP_AND_OVERWRITTEN";
            sha256: string;
            backupPath?: string | undefined;
        }[];
        summary: string;
        attachedAt?: string | undefined;
    };
    liveAttachResult: {
        targetPath: string;
        success: boolean;
        injectedFiles: {
            path: string;
            status: "CREATED" | "OVERWRITTEN" | "SKIPPED_UNCHANGED" | "BACKED_UP_AND_OVERWRITTEN";
            sha256: string;
            backupPath?: string | undefined;
        }[];
        summary: string;
        attachedAt?: string | undefined;
    };
    idempotencyAttachResult: {
        targetPath: string;
        success: boolean;
        injectedFiles: {
            path: string;
            status: "CREATED" | "OVERWRITTEN" | "SKIPPED_UNCHANGED" | "BACKED_UP_AND_OVERWRITTEN";
            sha256: string;
            backupPath?: string | undefined;
        }[];
        summary: string;
        attachedAt?: string | undefined;
    };
    orgChart?: {
        targetPath: string;
        generatedAt: string;
        ring0CoreLeads: string[];
        ring1TechSpecialists: {
            title: string;
            id: string;
            microRoleCard: string;
            ring: "RING_0_CORE" | "RING_1_TECH_SPECIALIST" | "RING_2_DOMAIN_EXPERT";
            origin: "CATALOG" | "OPEN_ENDED_SYNTHESIS" | "PRESERVED_EXISTING" | "SEMANTIC_MINED";
            boundedContext: string;
            domainKeywords?: string[] | undefined;
            domainScope?: string[] | undefined;
            domainInvariants?: string[] | undefined;
            testCommand?: string | undefined;
        }[];
        ring2DomainExperts: {
            title: string;
            id: string;
            microRoleCard: string;
            ring: "RING_0_CORE" | "RING_1_TECH_SPECIALIST" | "RING_2_DOMAIN_EXPERT";
            origin: "CATALOG" | "OPEN_ENDED_SYNTHESIS" | "PRESERVED_EXISTING" | "SEMANTIC_MINED";
            boundedContext: string;
            domainKeywords?: string[] | undefined;
            domainScope?: string[] | undefined;
            domainInvariants?: string[] | undefined;
            testCommand?: string | undefined;
        }[];
    } | undefined;
    driftReport?: {
        targetPath: string;
        hasDrift: boolean;
        findings: {
            modelName: string;
            fieldName: string;
            issueType: "TYPE_MISMATCH" | "MISSING_FIELD" | "NAMING_ASYMMETRY" | "MISSING_CODING_KEYS";
            recommendation: string;
            pythonOrSqlType?: string | undefined;
            swiftType?: string | undefined;
        }[];
        inspectedFiles: string[];
    } | undefined;
}>;
export type DogfoodingReport = z.infer<typeof DogfoodingReportSchema>;
export interface DogfoodingRunnerOptions {
    dryRun?: boolean;
    doctorTimeoutMs?: number;
}
/**
 * Esegue la pipeline completa in 5 fasi di Live Dogfooding sul repository reale
 * `/Users/stequar/fitness_project` (o sul path target specificato):
 * 1. `INSPECT`: rilevazione stack poliglotto (`python`, `swift`, `docker`, `fastapi`, `swiftui`)
 * 2. `DOCTOR`: diagnostica parallela della toolchain locale
 * 3. `DRY_RUN_ATTACH`: simulazione non distruttiva dell'attach
 * 4. `LIVE_ATTACH_AND_IDEMPOTENCY`: scrittura atomica POSIX con backup `.bak` + seconda passata `SKIPPED_UNCHANGED`
 * 5. `CROSS_DOMAIN_CONTRACT_SYNC`: generazione e scrittura atomica di `synced_schemas.py` e `SyncedModels.swift`
 */
export declare function runFitnessProjectDogfooding(targetPath?: string, options?: DogfoodingRunnerOptions): Promise<DogfoodingReport>;
//# sourceMappingURL=fitness-runner.d.ts.map