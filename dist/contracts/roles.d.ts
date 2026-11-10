import { z } from "zod";
export declare const GeneratedRoleSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    level: z.ZodEnum<["L2", "L3"]>;
    description: z.ZodString;
    systemPrompt: z.ZodString;
    recommendedTestCommand: z.ZodOptional<z.ZodString>;
    targetLanguages: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    targetFrameworks: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    enableSubagents: z.ZodDefault<z.ZodBoolean>;
    enableWriteTools: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: string;
    level: "L2" | "L3";
    name: string;
    description: string;
    systemPrompt: string;
    targetLanguages: string[];
    targetFrameworks: string[];
    enableSubagents: boolean;
    enableWriteTools: boolean;
    recommendedTestCommand?: string | undefined;
}, {
    id: string;
    level: "L2" | "L3";
    name: string;
    description: string;
    systemPrompt: string;
    recommendedTestCommand?: string | undefined;
    targetLanguages?: string[] | undefined;
    targetFrameworks?: string[] | undefined;
    enableSubagents?: boolean | undefined;
    enableWriteTools?: boolean | undefined;
}>;
export declare const TeamConfigurationSchema: z.ZodObject<{
    targetPath: z.ZodString;
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
    roles: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        level: z.ZodEnum<["L2", "L3"]>;
        description: z.ZodString;
        systemPrompt: z.ZodString;
        recommendedTestCommand: z.ZodOptional<z.ZodString>;
        targetLanguages: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        targetFrameworks: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        enableSubagents: z.ZodDefault<z.ZodBoolean>;
        enableWriteTools: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        level: "L2" | "L3";
        name: string;
        description: string;
        systemPrompt: string;
        targetLanguages: string[];
        targetFrameworks: string[];
        enableSubagents: boolean;
        enableWriteTools: boolean;
        recommendedTestCommand?: string | undefined;
    }, {
        id: string;
        level: "L2" | "L3";
        name: string;
        description: string;
        systemPrompt: string;
        recommendedTestCommand?: string | undefined;
        targetLanguages?: string[] | undefined;
        targetFrameworks?: string[] | undefined;
        enableSubagents?: boolean | undefined;
        enableWriteTools?: boolean | undefined;
    }>, "many">;
    renderedAgentsMarkdown: z.ZodString;
    generatedAt: z.ZodDefault<z.ZodString>;
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
    roles: {
        id: string;
        level: "L2" | "L3";
        name: string;
        description: string;
        systemPrompt: string;
        targetLanguages: string[];
        targetFrameworks: string[];
        enableSubagents: boolean;
        enableWriteTools: boolean;
        recommendedTestCommand?: string | undefined;
    }[];
    renderedAgentsMarkdown: string;
    generatedAt: string;
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
    roles: {
        id: string;
        level: "L2" | "L3";
        name: string;
        description: string;
        systemPrompt: string;
        recommendedTestCommand?: string | undefined;
        targetLanguages?: string[] | undefined;
        targetFrameworks?: string[] | undefined;
        enableSubagents?: boolean | undefined;
        enableWriteTools?: boolean | undefined;
    }[];
    renderedAgentsMarkdown: string;
    generatedAt?: string | undefined;
}>;
export declare const InjectedFileResultSchema: z.ZodObject<{
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
}>;
export declare const AttachResultSchema: z.ZodObject<{
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
export declare const AttachOptionsSchema: z.ZodObject<{
    force: z.ZodDefault<z.ZodBoolean>;
    dryRun: z.ZodDefault<z.ZodBoolean>;
    backup: z.ZodDefault<z.ZodBoolean>;
    backupExtension: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    force: boolean;
    dryRun: boolean;
    backup: boolean;
    backupExtension: string;
}, {
    force?: boolean | undefined;
    dryRun?: boolean | undefined;
    backup?: boolean | undefined;
    backupExtension?: string | undefined;
}>;
export type GeneratedRole = z.infer<typeof GeneratedRoleSchema>;
export type TeamConfiguration = z.infer<typeof TeamConfigurationSchema>;
export type InjectedFileResult = z.infer<typeof InjectedFileResultSchema>;
export type AttachResult = z.infer<typeof AttachResultSchema>;
export type AttachOptions = z.infer<typeof AttachOptionsSchema>;
export declare const RoleCategorySchema: z.ZodEnum<["CORE_LEAD", "DYNAMIC_DOMAIN_LEAD", "LEAF_DEVELOPER", "EXECUTIVE"]>;
export declare const RoleDefinitionSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    level: z.ZodEnum<["L1", "L2", "L3"]>;
    category: z.ZodEnum<["CORE_LEAD", "DYNAMIC_DOMAIN_LEAD", "LEAF_DEVELOPER", "EXECUTIVE"]>;
    description: z.ZodString;
    spikeDomain: z.ZodOptional<z.ZodString>;
    enableSubagentTools: z.ZodBoolean;
    enableWriteTools: z.ZodBoolean;
    microRoleCard: z.ZodString;
    cognitiveBoundary: z.ZodString;
    delegationScope: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    level: "L2" | "L3" | "L1";
    name: string;
    description: string;
    enableWriteTools: boolean;
    category: "CORE_LEAD" | "DYNAMIC_DOMAIN_LEAD" | "LEAF_DEVELOPER" | "EXECUTIVE";
    enableSubagentTools: boolean;
    microRoleCard: string;
    cognitiveBoundary: string;
    delegationScope: string[];
    spikeDomain?: string | undefined;
}, {
    id: string;
    level: "L2" | "L3" | "L1";
    name: string;
    description: string;
    enableWriteTools: boolean;
    category: "CORE_LEAD" | "DYNAMIC_DOMAIN_LEAD" | "LEAF_DEVELOPER" | "EXECUTIVE";
    enableSubagentTools: boolean;
    microRoleCard: string;
    cognitiveBoundary: string;
    spikeDomain?: string | undefined;
    delegationScope?: string[] | undefined;
}>;
export declare const RoleTaxonomySchema: z.ZodObject<{
    version: z.ZodDefault<z.ZodString>;
    updatedAt: z.ZodDefault<z.ZodString>;
    coreLeads: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        level: z.ZodEnum<["L1", "L2", "L3"]>;
        category: z.ZodEnum<["CORE_LEAD", "DYNAMIC_DOMAIN_LEAD", "LEAF_DEVELOPER", "EXECUTIVE"]>;
        description: z.ZodString;
        spikeDomain: z.ZodOptional<z.ZodString>;
        enableSubagentTools: z.ZodBoolean;
        enableWriteTools: z.ZodBoolean;
        microRoleCard: z.ZodString;
        cognitiveBoundary: z.ZodString;
        delegationScope: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        level: "L2" | "L3" | "L1";
        name: string;
        description: string;
        enableWriteTools: boolean;
        category: "CORE_LEAD" | "DYNAMIC_DOMAIN_LEAD" | "LEAF_DEVELOPER" | "EXECUTIVE";
        enableSubagentTools: boolean;
        microRoleCard: string;
        cognitiveBoundary: string;
        delegationScope: string[];
        spikeDomain?: string | undefined;
    }, {
        id: string;
        level: "L2" | "L3" | "L1";
        name: string;
        description: string;
        enableWriteTools: boolean;
        category: "CORE_LEAD" | "DYNAMIC_DOMAIN_LEAD" | "LEAF_DEVELOPER" | "EXECUTIVE";
        enableSubagentTools: boolean;
        microRoleCard: string;
        cognitiveBoundary: string;
        spikeDomain?: string | undefined;
        delegationScope?: string[] | undefined;
    }>, "many">;
    dynamicDomainLeads: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        level: z.ZodEnum<["L1", "L2", "L3"]>;
        category: z.ZodEnum<["CORE_LEAD", "DYNAMIC_DOMAIN_LEAD", "LEAF_DEVELOPER", "EXECUTIVE"]>;
        description: z.ZodString;
        spikeDomain: z.ZodOptional<z.ZodString>;
        enableSubagentTools: z.ZodBoolean;
        enableWriteTools: z.ZodBoolean;
        microRoleCard: z.ZodString;
        cognitiveBoundary: z.ZodString;
        delegationScope: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        level: "L2" | "L3" | "L1";
        name: string;
        description: string;
        enableWriteTools: boolean;
        category: "CORE_LEAD" | "DYNAMIC_DOMAIN_LEAD" | "LEAF_DEVELOPER" | "EXECUTIVE";
        enableSubagentTools: boolean;
        microRoleCard: string;
        cognitiveBoundary: string;
        delegationScope: string[];
        spikeDomain?: string | undefined;
    }, {
        id: string;
        level: "L2" | "L3" | "L1";
        name: string;
        description: string;
        enableWriteTools: boolean;
        category: "CORE_LEAD" | "DYNAMIC_DOMAIN_LEAD" | "LEAF_DEVELOPER" | "EXECUTIVE";
        enableSubagentTools: boolean;
        microRoleCard: string;
        cognitiveBoundary: string;
        spikeDomain?: string | undefined;
        delegationScope?: string[] | undefined;
    }>, "many">;
    leafDevelopers: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        level: z.ZodEnum<["L1", "L2", "L3"]>;
        category: z.ZodEnum<["CORE_LEAD", "DYNAMIC_DOMAIN_LEAD", "LEAF_DEVELOPER", "EXECUTIVE"]>;
        description: z.ZodString;
        spikeDomain: z.ZodOptional<z.ZodString>;
        enableSubagentTools: z.ZodBoolean;
        enableWriteTools: z.ZodBoolean;
        microRoleCard: z.ZodString;
        cognitiveBoundary: z.ZodString;
        delegationScope: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        level: "L2" | "L3" | "L1";
        name: string;
        description: string;
        enableWriteTools: boolean;
        category: "CORE_LEAD" | "DYNAMIC_DOMAIN_LEAD" | "LEAF_DEVELOPER" | "EXECUTIVE";
        enableSubagentTools: boolean;
        microRoleCard: string;
        cognitiveBoundary: string;
        delegationScope: string[];
        spikeDomain?: string | undefined;
    }, {
        id: string;
        level: "L2" | "L3" | "L1";
        name: string;
        description: string;
        enableWriteTools: boolean;
        category: "CORE_LEAD" | "DYNAMIC_DOMAIN_LEAD" | "LEAF_DEVELOPER" | "EXECUTIVE";
        enableSubagentTools: boolean;
        microRoleCard: string;
        cognitiveBoundary: string;
        spikeDomain?: string | undefined;
        delegationScope?: string[] | undefined;
    }>, "many">;
    summary: z.ZodString;
}, "strip", z.ZodTypeAny, {
    version: string;
    updatedAt: string;
    summary: string;
    coreLeads: {
        id: string;
        level: "L2" | "L3" | "L1";
        name: string;
        description: string;
        enableWriteTools: boolean;
        category: "CORE_LEAD" | "DYNAMIC_DOMAIN_LEAD" | "LEAF_DEVELOPER" | "EXECUTIVE";
        enableSubagentTools: boolean;
        microRoleCard: string;
        cognitiveBoundary: string;
        delegationScope: string[];
        spikeDomain?: string | undefined;
    }[];
    dynamicDomainLeads: {
        id: string;
        level: "L2" | "L3" | "L1";
        name: string;
        description: string;
        enableWriteTools: boolean;
        category: "CORE_LEAD" | "DYNAMIC_DOMAIN_LEAD" | "LEAF_DEVELOPER" | "EXECUTIVE";
        enableSubagentTools: boolean;
        microRoleCard: string;
        cognitiveBoundary: string;
        delegationScope: string[];
        spikeDomain?: string | undefined;
    }[];
    leafDevelopers: {
        id: string;
        level: "L2" | "L3" | "L1";
        name: string;
        description: string;
        enableWriteTools: boolean;
        category: "CORE_LEAD" | "DYNAMIC_DOMAIN_LEAD" | "LEAF_DEVELOPER" | "EXECUTIVE";
        enableSubagentTools: boolean;
        microRoleCard: string;
        cognitiveBoundary: string;
        delegationScope: string[];
        spikeDomain?: string | undefined;
    }[];
}, {
    summary: string;
    coreLeads: {
        id: string;
        level: "L2" | "L3" | "L1";
        name: string;
        description: string;
        enableWriteTools: boolean;
        category: "CORE_LEAD" | "DYNAMIC_DOMAIN_LEAD" | "LEAF_DEVELOPER" | "EXECUTIVE";
        enableSubagentTools: boolean;
        microRoleCard: string;
        cognitiveBoundary: string;
        spikeDomain?: string | undefined;
        delegationScope?: string[] | undefined;
    }[];
    dynamicDomainLeads: {
        id: string;
        level: "L2" | "L3" | "L1";
        name: string;
        description: string;
        enableWriteTools: boolean;
        category: "CORE_LEAD" | "DYNAMIC_DOMAIN_LEAD" | "LEAF_DEVELOPER" | "EXECUTIVE";
        enableSubagentTools: boolean;
        microRoleCard: string;
        cognitiveBoundary: string;
        spikeDomain?: string | undefined;
        delegationScope?: string[] | undefined;
    }[];
    leafDevelopers: {
        id: string;
        level: "L2" | "L3" | "L1";
        name: string;
        description: string;
        enableWriteTools: boolean;
        category: "CORE_LEAD" | "DYNAMIC_DOMAIN_LEAD" | "LEAF_DEVELOPER" | "EXECUTIVE";
        enableSubagentTools: boolean;
        microRoleCard: string;
        cognitiveBoundary: string;
        spikeDomain?: string | undefined;
        delegationScope?: string[] | undefined;
    }[];
    version?: string | undefined;
    updatedAt?: string | undefined;
}>;
export declare const RaciRoleAssignmentSchema: z.ZodEnum<["R", "A", "C", "I", "-"]>;
export declare const RaciPhaseRowSchema: z.ZodObject<{
    phase: z.ZodEnum<["SPIKE_VALIDATION", "BACKLOG_REFINEMENT", "CODE_IMPLEMENTATION", "GATEKEEPER_VERIFICATION", "SELF_HEALING", "SECURITY_AUDIT", "FINOPS_GOVERNANCE", "RELEASE_APPROVAL"]>;
    accountable: z.ZodString;
    responsible: z.ZodArray<z.ZodString, "many">;
    consulted: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    informed: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    description: string;
    phase: "SPIKE_VALIDATION" | "BACKLOG_REFINEMENT" | "CODE_IMPLEMENTATION" | "GATEKEEPER_VERIFICATION" | "SELF_HEALING" | "SECURITY_AUDIT" | "FINOPS_GOVERNANCE" | "RELEASE_APPROVAL";
    accountable: string;
    responsible: string[];
    consulted: string[];
    informed: string[];
}, {
    description: string;
    phase: "SPIKE_VALIDATION" | "BACKLOG_REFINEMENT" | "CODE_IMPLEMENTATION" | "GATEKEEPER_VERIFICATION" | "SELF_HEALING" | "SECURITY_AUDIT" | "FINOPS_GOVERNANCE" | "RELEASE_APPROVAL";
    accountable: string;
    responsible: string[];
    consulted?: string[] | undefined;
    informed?: string[] | undefined;
}>;
export declare const RaciMatrixSchema: z.ZodObject<{
    matrixId: z.ZodDefault<z.ZodString>;
    version: z.ZodDefault<z.ZodString>;
    phases: z.ZodArray<z.ZodObject<{
        phase: z.ZodEnum<["SPIKE_VALIDATION", "BACKLOG_REFINEMENT", "CODE_IMPLEMENTATION", "GATEKEEPER_VERIFICATION", "SELF_HEALING", "SECURITY_AUDIT", "FINOPS_GOVERNANCE", "RELEASE_APPROVAL"]>;
        accountable: z.ZodString;
        responsible: z.ZodArray<z.ZodString, "many">;
        consulted: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        informed: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        description: string;
        phase: "SPIKE_VALIDATION" | "BACKLOG_REFINEMENT" | "CODE_IMPLEMENTATION" | "GATEKEEPER_VERIFICATION" | "SELF_HEALING" | "SECURITY_AUDIT" | "FINOPS_GOVERNANCE" | "RELEASE_APPROVAL";
        accountable: string;
        responsible: string[];
        consulted: string[];
        informed: string[];
    }, {
        description: string;
        phase: "SPIKE_VALIDATION" | "BACKLOG_REFINEMENT" | "CODE_IMPLEMENTATION" | "GATEKEEPER_VERIFICATION" | "SELF_HEALING" | "SECURITY_AUDIT" | "FINOPS_GOVERNANCE" | "RELEASE_APPROVAL";
        accountable: string;
        responsible: string[];
        consulted?: string[] | undefined;
        informed?: string[] | undefined;
    }>, "many">;
    rules: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    updatedAt: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    version: string;
    updatedAt: string;
    matrixId: string;
    phases: {
        description: string;
        phase: "SPIKE_VALIDATION" | "BACKLOG_REFINEMENT" | "CODE_IMPLEMENTATION" | "GATEKEEPER_VERIFICATION" | "SELF_HEALING" | "SECURITY_AUDIT" | "FINOPS_GOVERNANCE" | "RELEASE_APPROVAL";
        accountable: string;
        responsible: string[];
        consulted: string[];
        informed: string[];
    }[];
    rules: string[];
}, {
    phases: {
        description: string;
        phase: "SPIKE_VALIDATION" | "BACKLOG_REFINEMENT" | "CODE_IMPLEMENTATION" | "GATEKEEPER_VERIFICATION" | "SELF_HEALING" | "SECURITY_AUDIT" | "FINOPS_GOVERNANCE" | "RELEASE_APPROVAL";
        accountable: string;
        responsible: string[];
        consulted?: string[] | undefined;
        informed?: string[] | undefined;
    }[];
    version?: string | undefined;
    updatedAt?: string | undefined;
    matrixId?: string | undefined;
    rules?: string[] | undefined;
}>;
export type RoleCategory = z.infer<typeof RoleCategorySchema>;
export type RoleDefinition = z.infer<typeof RoleDefinitionSchema>;
export type RoleTaxonomy = z.infer<typeof RoleTaxonomySchema>;
export type RaciPhaseRow = z.infer<typeof RaciPhaseRowSchema>;
export type RaciMatrix = z.infer<typeof RaciMatrixSchema>;
//# sourceMappingURL=roles.d.ts.map