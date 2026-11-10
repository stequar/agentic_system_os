import { z } from "zod";
/**
 * Tipi primitivi universali supportati dal sincronizzatore cross-domain (Python Pydantic v2 <-> Swift 6).
 */
export declare const ContractFieldTypeSchema: z.ZodEnum<["string", "uuid", "datetime", "int", "float", "boolean"]>;
export type ContractFieldType = z.infer<typeof ContractFieldTypeSchema>;
/**
 * Definizione di un singolo campo di un modello contrattuale (in convenzione snake_case).
 */
export declare const ContractFieldSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<["string", "uuid", "datetime", "int", "float", "boolean"]>;
    required: z.ZodDefault<z.ZodBoolean>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "string" | "boolean" | "float" | "uuid" | "datetime" | "int";
    name: string;
    required: boolean;
    description?: string | undefined;
}, {
    type: "string" | "boolean" | "float" | "uuid" | "datetime" | "int";
    name: string;
    description?: string | undefined;
    required?: boolean | undefined;
}>;
export type ContractField = z.input<typeof ContractFieldSchema>;
export type ParsedContractField = z.infer<typeof ContractFieldSchema>;
/**
 * Definizione di un modello dati cross-domain (DTO).
 */
export declare const ContractModelSchema: z.ZodObject<{
    modelName: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    fields: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        type: z.ZodEnum<["string", "uuid", "datetime", "int", "float", "boolean"]>;
        required: z.ZodDefault<z.ZodBoolean>;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "string" | "boolean" | "float" | "uuid" | "datetime" | "int";
        name: string;
        required: boolean;
        description?: string | undefined;
    }, {
        type: "string" | "boolean" | "float" | "uuid" | "datetime" | "int";
        name: string;
        description?: string | undefined;
        required?: boolean | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    modelName: string;
    fields: {
        type: "string" | "boolean" | "float" | "uuid" | "datetime" | "int";
        name: string;
        required: boolean;
        description?: string | undefined;
    }[];
    description?: string | undefined;
}, {
    modelName: string;
    fields: {
        type: "string" | "boolean" | "float" | "uuid" | "datetime" | "int";
        name: string;
        description?: string | undefined;
        required?: boolean | undefined;
    }[];
    description?: string | undefined;
}>;
export type ContractModel = z.input<typeof ContractModelSchema>;
export type ParsedContractModel = z.infer<typeof ContractModelSchema>;
/**
 * Contratto Cross-Domain unificato compatibile con `ApiContractSchema` (`src/contracts/engineering.ts`).
 */
export declare const CrossDomainContractSchema: z.ZodObject<{
    version: z.ZodDefault<z.ZodString>;
    title: z.ZodString;
    basePath: z.ZodDefault<z.ZodString>;
    models: z.ZodDefault<z.ZodArray<z.ZodObject<{
        modelName: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        fields: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            type: z.ZodEnum<["string", "uuid", "datetime", "int", "float", "boolean"]>;
            required: z.ZodDefault<z.ZodBoolean>;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "string" | "boolean" | "float" | "uuid" | "datetime" | "int";
            name: string;
            required: boolean;
            description?: string | undefined;
        }, {
            type: "string" | "boolean" | "float" | "uuid" | "datetime" | "int";
            name: string;
            description?: string | undefined;
            required?: boolean | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        modelName: string;
        fields: {
            type: "string" | "boolean" | "float" | "uuid" | "datetime" | "int";
            name: string;
            required: boolean;
            description?: string | undefined;
        }[];
        description?: string | undefined;
    }, {
        modelName: string;
        fields: {
            type: "string" | "boolean" | "float" | "uuid" | "datetime" | "int";
            name: string;
            description?: string | undefined;
            required?: boolean | undefined;
        }[];
        description?: string | undefined;
    }>, "many">>;
    endpoints: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        method: z.ZodEnum<["GET", "POST", "PUT", "PATCH", "DELETE"]>;
        summary: z.ZodString;
        requestBodySchema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        responseBodySchema: z.ZodRecord<z.ZodString, z.ZodAny>;
        authRequired: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        summary: string;
        method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
        responseBodySchema: Record<string, any>;
        authRequired: boolean;
        requestBodySchema?: Record<string, any> | undefined;
    }, {
        path: string;
        summary: string;
        method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
        responseBodySchema: Record<string, any>;
        requestBodySchema?: Record<string, any> | undefined;
        authRequired?: boolean | undefined;
    }>, "many">>>;
}, "strip", z.ZodTypeAny, {
    version: string;
    title: string;
    basePath: string;
    endpoints: {
        path: string;
        summary: string;
        method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
        responseBodySchema: Record<string, any>;
        authRequired: boolean;
        requestBodySchema?: Record<string, any> | undefined;
    }[];
    models: {
        modelName: string;
        fields: {
            type: "string" | "boolean" | "float" | "uuid" | "datetime" | "int";
            name: string;
            required: boolean;
            description?: string | undefined;
        }[];
        description?: string | undefined;
    }[];
}, {
    title: string;
    version?: string | undefined;
    basePath?: string | undefined;
    endpoints?: {
        path: string;
        summary: string;
        method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
        responseBodySchema: Record<string, any>;
        requestBodySchema?: Record<string, any> | undefined;
        authRequired?: boolean | undefined;
    }[] | undefined;
    models?: {
        modelName: string;
        fields: {
            type: "string" | "boolean" | "float" | "uuid" | "datetime" | "int";
            name: string;
            description?: string | undefined;
            required?: boolean | undefined;
        }[];
        description?: string | undefined;
    }[] | undefined;
}>;
export type CrossDomainContract = z.input<typeof CrossDomainContractSchema>;
export type ParsedCrossDomainContract = z.infer<typeof CrossDomainContractSchema>;
/**
 * Opzioni per la sincronizzazione su filesystem dei contratti generati.
 */
export declare const ContractSyncOptionsSchema: z.ZodObject<{
    targetDir: z.ZodOptional<z.ZodString>;
    pythonOutputRelativePath: z.ZodDefault<z.ZodString>;
    swiftOutputRelativePath: z.ZodDefault<z.ZodString>;
    dryRun: z.ZodDefault<z.ZodBoolean>;
    backup: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    dryRun: boolean;
    backup: boolean;
    pythonOutputRelativePath: string;
    swiftOutputRelativePath: string;
    targetDir?: string | undefined;
}, {
    dryRun?: boolean | undefined;
    backup?: boolean | undefined;
    targetDir?: string | undefined;
    pythonOutputRelativePath?: string | undefined;
    swiftOutputRelativePath?: string | undefined;
}>;
export type ContractSyncOptions = z.input<typeof ContractSyncOptionsSchema>;
/**
 * Risultato validato della sincronizzazione dei contratti Python Pydantic v2 e Swift 6 Codable/Sendable.
 */
export declare const ContractSyncResultSchema: z.ZodObject<{
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
export type ContractSyncResult = z.infer<typeof ContractSyncResultSchema>;
//# sourceMappingURL=sync.d.ts.map