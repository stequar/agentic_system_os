import { z } from "zod";
/**
 * Livelli dell'ontologia organizzativa Tri-Ring (RFC-007).
 */
export declare const RingLevelSchema: z.ZodEnum<["RING_0_CORE", "RING_1_TECH_SPECIALIST", "RING_2_DOMAIN_EXPERT"]>;
export type RingLevel = z.infer<typeof RingLevelSchema>;
/**
 * Origine dello specialista sintetizzato o preservato.
 */
export declare const SpecialistOriginSchema: z.ZodEnum<["CATALOG", "OPEN_ENDED_SYNTHESIS", "PRESERVED_EXISTING", "SEMANTIC_MINED"]>;
export type SpecialistOrigin = z.infer<typeof SpecialistOriginSchema>;
/**
 * Definizione di uno specialista Ring-1 (Tech) o Ring-2 (Domain Expert)
 * con perimetro di file (`domainScope`), invarianti (`domainInvariants`) e `microRoleCard`.
 */
export declare const SynthesizedSpecialistSchema: z.ZodObject<{
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
}>;
export type SynthesizedSpecialist = z.infer<typeof SynthesizedSpecialistSchema>;
/**
 * Organigramma Tri-Ring salvato in `.company-os/org-chart.json`.
 */
export declare const TriRingOrgChartSchema: z.ZodObject<{
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
}>;
export type TriRingOrgChart = z.infer<typeof TriRingOrgChartSchema>;
/**
 * Tipologia di disallineamento semantico rilevata tra DB SQL, Backend Python e Mobile Swift.
 */
export declare const SemanticDriftIssueTypeSchema: z.ZodEnum<["TYPE_MISMATCH", "MISSING_FIELD", "NAMING_ASYMMETRY", "MISSING_CODING_KEYS"]>;
export type SemanticDriftIssueType = z.infer<typeof SemanticDriftIssueTypeSchema>;
/**
 * Singola anomalia di Semantic Contract Drift.
 */
export declare const SemanticDriftFindingSchema: z.ZodObject<{
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
}>;
export type SemanticDriftFinding = z.infer<typeof SemanticDriftFindingSchema>;
/**
 * Report completo del Semantic Drift Detector (TCK-17.5.4).
 */
export declare const SemanticDriftReportSchema: z.ZodObject<{
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
}>;
export type SemanticDriftReport = z.infer<typeof SemanticDriftReportSchema>;
/**
 * Le 5 fasi del ciclo di preparazione olistica del workspace (`P0..P4` — RFC-007).
 */
export declare const HolisticBootstrapPhaseSchema: z.ZodEnum<["P0_DEEP_RECONNAISSANCE", "P1_SEMANTIC_DOMAIN_MINING", "P2_TRI_RING_ORG_SYNTHESIS", "P3_HOLISTIC_TOOLING_PROVISIONING", "P4_INAUGURAL_ALIGNMENT_CEREMONY"]>;
export type HolisticBootstrapPhase = z.infer<typeof HolisticBootstrapPhaseSchema>;
/**
 * Report finale certificato del 5-Phase Holistic Workspace Bootstrap (`TCK-17.5.4` / `TCK-17.5.5`).
 */
export declare const HolisticBootstrapReportSchema: z.ZodObject<{
    targetPath: z.ZodString;
    phasesCompleted: z.ZodArray<z.ZodEnum<["P0_DEEP_RECONNAISSANCE", "P1_SEMANTIC_DOMAIN_MINING", "P2_TRI_RING_ORG_SYNTHESIS", "P3_HOLISTIC_TOOLING_PROVISIONING", "P4_INAUGURAL_ALIGNMENT_CEREMONY"]>, "many">;
    stack: z.ZodObject<{
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
    hermeticTestCommands: z.ZodArray<z.ZodString, "many">;
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
    orgChart: z.ZodObject<{
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
    }>;
    attachResult: z.ZodObject<{
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
    driftReport: z.ZodObject<{
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
    }>;
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
    synthesizedMcpTools: z.ZodArray<z.ZodObject<{
        toolId: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        generatedByRole: z.ZodDefault<z.ZodString>;
        sandboxType: z.ZodEnum<["NODE_WORKER", "WASM_SANDBOX", "IN_PROCESS_RESTRICTED"]>;
        permissions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        inputSchemaJson: z.ZodString;
        ttlSeconds: z.ZodDefault<z.ZodNumber>;
        status: z.ZodEnum<["SYNTHESIZED", "TEST_PASSED", "HOT_LOADED", "PROMOTED_PERMANENT", "QUARANTINED", "EXPIRED"]>;
        createdAt: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "SYNTHESIZED" | "TEST_PASSED" | "HOT_LOADED" | "PROMOTED_PERMANENT" | "QUARANTINED" | "EXPIRED";
        name: string;
        description: string;
        toolId: string;
        generatedByRole: string;
        sandboxType: "NODE_WORKER" | "WASM_SANDBOX" | "IN_PROCESS_RESTRICTED";
        permissions: string[];
        inputSchemaJson: string;
        ttlSeconds: number;
        createdAt: string;
    }, {
        status: "SYNTHESIZED" | "TEST_PASSED" | "HOT_LOADED" | "PROMOTED_PERMANENT" | "QUARANTINED" | "EXPIRED";
        name: string;
        description: string;
        toolId: string;
        sandboxType: "NODE_WORKER" | "WASM_SANDBOX" | "IN_PROCESS_RESTRICTED";
        inputSchemaJson: string;
        generatedByRole?: string | undefined;
        permissions?: string[] | undefined;
        ttlSeconds?: number | undefined;
        createdAt?: string | undefined;
    }>, "many">;
    invariantsPath: z.ZodString;
    orgChartPath: z.ZodString;
    contractsPath: z.ZodString;
    configPath: z.ZodString;
    ceremonyId: z.ZodString;
    idempotencyVerified: z.ZodBoolean;
    completedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    targetPath: string;
    stack: {
        targetPath: string;
        languages: string[];
        frameworks: string[];
        hasDocker: boolean;
        packageManagers: string[];
        testCommands: string[];
        entryPoints: string[];
        detectedAt: string;
    };
    phasesCompleted: ("P0_DEEP_RECONNAISSANCE" | "P1_SEMANTIC_DOMAIN_MINING" | "P2_TRI_RING_ORG_SYNTHESIS" | "P3_HOLISTIC_TOOLING_PROVISIONING" | "P4_INAUGURAL_ALIGNMENT_CEREMONY")[];
    hermeticTestCommands: string[];
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
    orgChart: {
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
    };
    attachResult: {
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
    driftReport: {
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
    synthesizedMcpTools: {
        status: "SYNTHESIZED" | "TEST_PASSED" | "HOT_LOADED" | "PROMOTED_PERMANENT" | "QUARANTINED" | "EXPIRED";
        name: string;
        description: string;
        toolId: string;
        generatedByRole: string;
        sandboxType: "NODE_WORKER" | "WASM_SANDBOX" | "IN_PROCESS_RESTRICTED";
        permissions: string[];
        inputSchemaJson: string;
        ttlSeconds: number;
        createdAt: string;
    }[];
    invariantsPath: string;
    orgChartPath: string;
    contractsPath: string;
    configPath: string;
    ceremonyId: string;
    idempotencyVerified: boolean;
    completedAt: string;
}, {
    targetPath: string;
    stack: {
        targetPath: string;
        languages: string[];
        frameworks?: string[] | undefined;
        hasDocker?: boolean | undefined;
        packageManagers?: string[] | undefined;
        testCommands?: string[] | undefined;
        entryPoints?: string[] | undefined;
        detectedAt?: string | undefined;
    };
    phasesCompleted: ("P0_DEEP_RECONNAISSANCE" | "P1_SEMANTIC_DOMAIN_MINING" | "P2_TRI_RING_ORG_SYNTHESIS" | "P3_HOLISTIC_TOOLING_PROVISIONING" | "P4_INAUGURAL_ALIGNMENT_CEREMONY")[];
    hermeticTestCommands: string[];
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
    orgChart: {
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
    };
    attachResult: {
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
    driftReport: {
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
    synthesizedMcpTools: {
        status: "SYNTHESIZED" | "TEST_PASSED" | "HOT_LOADED" | "PROMOTED_PERMANENT" | "QUARANTINED" | "EXPIRED";
        name: string;
        description: string;
        toolId: string;
        sandboxType: "NODE_WORKER" | "WASM_SANDBOX" | "IN_PROCESS_RESTRICTED";
        inputSchemaJson: string;
        generatedByRole?: string | undefined;
        permissions?: string[] | undefined;
        ttlSeconds?: number | undefined;
        createdAt?: string | undefined;
    }[];
    invariantsPath: string;
    orgChartPath: string;
    contractsPath: string;
    configPath: string;
    ceremonyId: string;
    idempotencyVerified: boolean;
    completedAt: string;
}>;
export type HolisticBootstrapReport = z.infer<typeof HolisticBootstrapReportSchema>;
//# sourceMappingURL=brownfield.d.ts.map