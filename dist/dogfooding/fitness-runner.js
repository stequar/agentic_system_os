import path from "node:path";
import { z } from "zod";
import { ProjectStackSchema } from "../contracts/inspector.js";
import { DoctorReportSchema } from "../contracts/doctor.js";
import { AttachResultSchema } from "../contracts/roles.js";
import { ContractSyncResultSchema, CrossDomainContractSchema, } from "../contracts/sync.js";
import { SemanticDriftReportSchema, TriRingOrgChartSchema, } from "../contracts/brownfield.js";
import { detectProjectStack } from "../inspector/detector.js";
import { mineRepositoryDomainAndRoles } from "../inspector/domain-miner.js";
import { runEnvironmentDoctor } from "../doctor/health.js";
import { attachWorkspace } from "../attach/injector.js";
import { syncCrossDomainContracts } from "../sync/contract-sync.js";
import { introspectAndDetectDrift } from "../sync/contract-introspector.js";
/**
 * Contratto cross-domain canonico per il workspace poliglotto `/Users/stequar/fitness_project`
 * (Python FastAPI + iOS SwiftUI).
 */
export const FITNESS_PROJECT_UNIFIED_CONTRACT = CrossDomainContractSchema.parse({
    version: "1.0.0",
    title: "Fitness Project Cross-Domain API Contract",
    basePath: "/api/v1",
    models: [
        {
            modelName: "Exercise",
            description: "Modello sincronizzato per gli esercizi fitness (FastAPI <-> SwiftUI)",
            fields: [
                { name: "id", type: "uuid", required: true, description: "Identificativo univoco UUID" },
                { name: "name", type: "string", required: true, description: "Nome dell'esercizio" },
                {
                    name: "muscle_group",
                    type: "string",
                    required: true,
                    description: "Gruppo muscolare target",
                },
                {
                    name: "gif_url",
                    type: "string",
                    required: true,
                    description: "URL dell'animazione dimostrativa",
                },
                {
                    name: "equipment",
                    type: "string",
                    required: false,
                    description: "Attrezzatura richiesta opzionale",
                },
                {
                    name: "created_at",
                    type: "datetime",
                    required: true,
                    description: "Timestamp di creazione",
                },
            ],
        },
        {
            modelName: "UserProfile",
            description: "Profilo biometrico e anagrafico dell'utente fitness",
            fields: [
                { name: "id", type: "uuid", required: true, description: "UUID utente" },
                { name: "name", type: "string", required: true, description: "Nome completo" },
                { name: "email", type: "string", required: true, description: "Indirizzo email" },
                { name: "age", type: "int", required: true, description: "Età in anni" },
                { name: "weight_kg", type: "float", required: true, description: "Peso corporeo in kg" },
                { name: "height_cm", type: "float", required: true, description: "Altezza in cm" },
            ],
        },
    ],
    endpoints: [
        {
            path: "/exercises",
            method: "GET",
            summary: "Restituisce il catalogo degli esercizi sincronizzati",
            responseBodySchema: { items: "Exercise[]" },
            authRequired: false,
        },
        {
            path: "/users/profile",
            method: "GET",
            summary: "Restituisce il profilo biometrico dell'utente autenticato",
            responseBodySchema: { profile: "UserProfile" },
            authRequired: true,
        },
    ],
});
/**
 * Stato delle 5 fasi di esecuzione del Live Dogfooding su `fitness_project`.
 */
export const DogfoodingPhaseNameSchema = z.enum([
    "INSPECT",
    "DOCTOR",
    "DRY_RUN_ATTACH",
    "LIVE_ATTACH_AND_IDEMPOTENCY",
    "CROSS_DOMAIN_CONTRACT_SYNC",
]);
/**
 * Schema Zod completo per il report certificato delle 5 fasi di Dogfooding (TCK-17.3).
 */
export const DogfoodingReportSchema = z.object({
    targetPath: z.string(),
    phasesCompleted: z.array(DogfoodingPhaseNameSchema),
    inspectResult: ProjectStackSchema,
    doctorReport: DoctorReportSchema,
    dryRunAttachResult: AttachResultSchema,
    liveAttachResult: AttachResultSchema,
    idempotencyAttachResult: AttachResultSchema,
    idempotencyVerified: z.boolean(),
    contractSyncResult: ContractSyncResultSchema,
    orgChart: TriRingOrgChartSchema.optional(),
    driftReport: SemanticDriftReportSchema.optional(),
    completedAt: z.string().datetime(),
});
/**
 * Esegue la pipeline completa in 5 fasi di Live Dogfooding sul repository reale
 * `/Users/stequar/fitness_project` (o sul path target specificato):
 * 1. `INSPECT`: rilevazione stack poliglotto (`python`, `swift`, `docker`, `fastapi`, `swiftui`)
 * 2. `DOCTOR`: diagnostica parallela della toolchain locale
 * 3. `DRY_RUN_ATTACH`: simulazione non distruttiva dell'attach
 * 4. `LIVE_ATTACH_AND_IDEMPOTENCY`: scrittura atomica POSIX con backup `.bak` + seconda passata `SKIPPED_UNCHANGED`
 * 5. `CROSS_DOMAIN_CONTRACT_SYNC`: generazione e scrittura atomica di `synced_schemas.py` e `SyncedModels.swift`
 */
export async function runFitnessProjectDogfooding(targetPath = "/Users/stequar/fitness_project", options) {
    const resolvedPath = path.resolve(targetPath);
    const isDryRunOnly = options?.dryRun === true;
    const phasesCompleted = [];
    // Fase 1: INSPECT
    const inspectResult = await detectProjectStack(resolvedPath);
    phasesCompleted.push("INSPECT");
    // Fase 2: DOCTOR
    const doctorReport = await runEnvironmentDoctor(resolvedPath, {
        timeoutMs: options?.doctorTimeoutMs ?? 3000,
    });
    phasesCompleted.push("DOCTOR");
    // Fase 3: DRY_RUN_ATTACH
    const dryRunAttachResult = await attachWorkspace(resolvedPath, {
        dryRun: true,
        backup: true,
    });
    phasesCompleted.push("DRY_RUN_ATTACH");
    // Fase 4: LIVE_ATTACH_AND_IDEMPOTENCY
    const liveAttachResult = await attachWorkspace(resolvedPath, {
        dryRun: isDryRunOnly,
        backup: true,
    });
    const idempotencyAttachResult = await attachWorkspace(resolvedPath, {
        dryRun: isDryRunOnly,
        backup: true,
    });
    const idempotencyVerified = isDryRunOnly
        ? idempotencyAttachResult.injectedFiles.length === 6
        : idempotencyAttachResult.injectedFiles.length === 6 &&
            idempotencyAttachResult.injectedFiles.every((file) => file.status === "SKIPPED_UNCHANGED");
    phasesCompleted.push("LIVE_ATTACH_AND_IDEMPOTENCY");
    // Fase 5: CROSS_DOMAIN_CONTRACT_SYNC (+ Tri-Ring Org & Semantic Drift Detection)
    const orgChart = await mineRepositoryDomainAndRoles(resolvedPath, inspectResult);
    const driftReport = await introspectAndDetectDrift(resolvedPath, {
        dryRun: isDryRunOnly,
    });
    const contractSyncResult = await syncCrossDomainContracts(FITNESS_PROJECT_UNIFIED_CONTRACT, {
        targetDir: resolvedPath,
        pythonOutputRelativePath: "src/backend/api/synced_schemas.py",
        swiftOutputRelativePath: "src/ios/FitnessApp/Models/SyncedModels.swift",
        dryRun: isDryRunOnly,
        backup: true,
    });
    phasesCompleted.push("CROSS_DOMAIN_CONTRACT_SYNC");
    return DogfoodingReportSchema.parse({
        targetPath: resolvedPath,
        phasesCompleted,
        inspectResult,
        doctorReport,
        dryRunAttachResult,
        liveAttachResult,
        idempotencyAttachResult,
        idempotencyVerified,
        contractSyncResult,
        orgChart,
        driftReport,
        completedAt: new Date().toISOString(),
    });
}
//# sourceMappingURL=fitness-runner.js.map