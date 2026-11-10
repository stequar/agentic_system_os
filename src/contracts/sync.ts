import { z } from "zod";
import { ApiEndpointSchema } from "./engineering.js";
import { InjectedFileResultSchema } from "./roles.js";

/**
 * Tipi primitivi universali supportati dal sincronizzatore cross-domain (Python Pydantic v2 <-> Swift 6).
 */
export const ContractFieldTypeSchema = z.enum([
  "string",
  "uuid",
  "datetime",
  "int",
  "float",
  "boolean",
]);
export type ContractFieldType = z.infer<typeof ContractFieldTypeSchema>;

/**
 * Definizione di un singolo campo di un modello contrattuale (in convenzione snake_case).
 */
export const ContractFieldSchema = z.object({
  name: z
    .string()
    .min(1)
    .regex(/^[a-z][a-z0-9_]*$/, "Il nome del campo deve essere in snake_case"),
  type: ContractFieldTypeSchema,
  required: z.boolean().default(true),
  description: z.string().optional(),
});
export type ContractField = z.input<typeof ContractFieldSchema>;
export type ParsedContractField = z.infer<typeof ContractFieldSchema>;

/**
 * Definizione di un modello dati cross-domain (DTO).
 */
export const ContractModelSchema = z.object({
  modelName: z
    .string()
    .min(1)
    .regex(/^[A-Z][A-Za-z0-9]*$/, "Il nome del modello deve essere in PascalCase"),
  description: z.string().optional(),
  fields: z.array(ContractFieldSchema).min(1),
});
export type ContractModel = z.input<typeof ContractModelSchema>;
export type ParsedContractModel = z.infer<typeof ContractModelSchema>;

/**
 * Contratto Cross-Domain unificato compatibile con `ApiContractSchema` (`src/contracts/engineering.ts`).
 */
export const CrossDomainContractSchema = z.object({
  version: z.string().default("1.0.0"),
  title: z.string().min(1),
  basePath: z.string().default("/api/v1"),
  models: z.array(ContractModelSchema).default([]),
  endpoints: z.array(ApiEndpointSchema).optional().default([]),
});
export type CrossDomainContract = z.input<typeof CrossDomainContractSchema>;
export type ParsedCrossDomainContract = z.infer<typeof CrossDomainContractSchema>;

/**
 * Opzioni per la sincronizzazione su filesystem dei contratti generati.
 */
export const ContractSyncOptionsSchema = z.object({
  targetDir: z.string().optional(),
  pythonOutputRelativePath: z
    .string()
    .default("src/backend/api/synced_schemas.py"),
  swiftOutputRelativePath: z
    .string()
    .default("src/ios/FitnessApp/Models/SyncedModels.swift"),
  dryRun: z.boolean().default(false),
  backup: z.boolean().default(true),
});
export type ContractSyncOptions = z.input<typeof ContractSyncOptionsSchema>;

/**
 * Risultato validato della sincronizzazione dei contratti Python Pydantic v2 e Swift 6 Codable/Sendable.
 */
export const ContractSyncResultSchema = z.object({
  pythonCode: z.string().min(1),
  swiftCode: z.string().min(1),
  modelsSynced: z.array(z.string()),
  writtenFiles: z.array(InjectedFileResultSchema),
  sha256Python: z.string().length(64),
  sha256Swift: z.string().length(64),
});
export type ContractSyncResult = z.infer<typeof ContractSyncResultSchema>;
