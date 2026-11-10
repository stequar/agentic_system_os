import { z } from "zod";
/**
 * 🛠️ 1. Dynamic JIT MCP Synthesis Schema
 * Rappresenta un tool o adapter MCP sintetizzato al volo da un agente R&D / AI Lead
 * per colmare una carenza di capability senza intervento umano.
 */
export declare const DynamicMcpToolSchema: z.ZodObject<{
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
}>;
export type DynamicMcpTool = z.infer<typeof DynamicMcpToolSchema>;
/**
 * 📐 2. Static Heuristic Invariant Scan Result Schema
 * Risultato di una scansione EURISTICA basata su pattern (regex) del codice sorgente.
 * ONESTÀ (TCK-DH.2b): NON è una verifica formale né un solver SMT/SAT. `scanEngine` è un
 * matcher di pattern best-effort e lo status `HEURISTIC_PASSED` significa soltanto "nessun
 * pattern di rischio noto rilevato", non una prova di correttezza.
 */
export declare const HeuristicScanResultSchema: z.ZodObject<{
    proofId: z.ZodString;
    targetFilePath: z.ZodString;
    targetSymbol: z.ZodString;
    scanEngine: z.ZodEnum<["PATTERN_HEURISTIC"]>;
    invariantsChecked: z.ZodArray<z.ZodString, "many">;
    status: z.ZodEnum<["HEURISTIC_PASSED", "COUNTEREXAMPLE_FOUND", "SCAN_TIMEOUT", "CONTRADICTORY_CONSTRAINTS"]>;
    counterexampleTrace: z.ZodOptional<z.ZodObject<{
        inputState: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        failingPath: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        reproducibleFixtureCode: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        inputState?: Record<string, any> | undefined;
        failingPath?: string[] | undefined;
        reproducibleFixtureCode?: string | undefined;
    }, {
        inputState?: Record<string, any> | undefined;
        failingPath?: string[] | undefined;
        reproducibleFixtureCode?: string | undefined;
    }>>;
    executionTimeMs: z.ZodNumber;
    verifiedAt: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "HEURISTIC_PASSED" | "COUNTEREXAMPLE_FOUND" | "SCAN_TIMEOUT" | "CONTRADICTORY_CONSTRAINTS";
    proofId: string;
    targetFilePath: string;
    targetSymbol: string;
    scanEngine: "PATTERN_HEURISTIC";
    invariantsChecked: string[];
    executionTimeMs: number;
    verifiedAt: string;
    counterexampleTrace?: {
        inputState?: Record<string, any> | undefined;
        failingPath?: string[] | undefined;
        reproducibleFixtureCode?: string | undefined;
    } | undefined;
}, {
    status: "HEURISTIC_PASSED" | "COUNTEREXAMPLE_FOUND" | "SCAN_TIMEOUT" | "CONTRADICTORY_CONSTRAINTS";
    proofId: string;
    targetFilePath: string;
    targetSymbol: string;
    scanEngine: "PATTERN_HEURISTIC";
    invariantsChecked: string[];
    executionTimeMs: number;
    counterexampleTrace?: {
        inputState?: Record<string, any> | undefined;
        failingPath?: string[] | undefined;
        reproducibleFixtureCode?: string | undefined;
    } | undefined;
    verifiedAt?: string | undefined;
}>;
export type HeuristicScanResult = z.infer<typeof HeuristicScanResultSchema>;
/**
 * ⚡ 3. On-Device SLM Distillation Trace Schema
 * Tracciamento della distillazione di traiettorie ad alto rendimento (FPY=100%)
 * dai modelli cloud di frontiera verso Small Language Models locali a costo zero.
 */
export declare const SlmDistillationTraceSchema: z.ZodObject<{
    traceId: z.ZodString;
    sourceTeacherModel: z.ZodString;
    targetStudentModel: z.ZodString;
    specializedDomain: z.ZodEnum<["AST_REFACTOR", "DOCSTRING_GEN", "SYNTHETIC_FIXTURES", "CAVEMAN_ENCODING", "FAST_TRIAGE"]>;
    datasetSampleCount: z.ZodNumber;
    fpyVerificationRate: z.ZodNumber;
    quantizationFormat: z.ZodEnum<["GGUF_Q4_K_M", "GGUF_Q8_0", "ONNX_INT8", "MLX_4BIT"]>;
    averageInferenceLatencyMs: z.ZodNumber;
    cloudCostSavingsPercentage: z.ZodNumber;
    distilledAt: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    traceId: string;
    sourceTeacherModel: string;
    targetStudentModel: string;
    specializedDomain: "AST_REFACTOR" | "DOCSTRING_GEN" | "SYNTHETIC_FIXTURES" | "CAVEMAN_ENCODING" | "FAST_TRIAGE";
    datasetSampleCount: number;
    fpyVerificationRate: number;
    quantizationFormat: "GGUF_Q4_K_M" | "GGUF_Q8_0" | "ONNX_INT8" | "MLX_4BIT";
    averageInferenceLatencyMs: number;
    cloudCostSavingsPercentage: number;
    distilledAt: string;
}, {
    traceId: string;
    sourceTeacherModel: string;
    targetStudentModel: string;
    specializedDomain: "AST_REFACTOR" | "DOCSTRING_GEN" | "SYNTHETIC_FIXTURES" | "CAVEMAN_ENCODING" | "FAST_TRIAGE";
    datasetSampleCount: number;
    fpyVerificationRate: number;
    quantizationFormat: "GGUF_Q4_K_M" | "GGUF_Q8_0" | "ONNX_INT8" | "MLX_4BIT";
    averageInferenceLatencyMs: number;
    cloudCostSavingsPercentage: number;
    distilledAt?: string | undefined;
}>;
export type SlmDistillationTrace = z.infer<typeof SlmDistillationTraceSchema>;
/**
 * 🐒 4. Chaos Fault Injection & Antifragile Resilience Schema
 * Rappresenta un'iniezione di guasto sintetico deliberata per stress-testare la War Room e il Self-Healing.
 */
export declare const ChaosFaultInjectionSchema: z.ZodObject<{
    faultId: z.ZodString;
    faultType: z.ZodEnum<["AST_MUTATION_OFF_BY_ONE", "RACE_CONDITION_ASYNC_QUEUE", "ADVERSARIAL_PROMPT_INJECTION", "DISK_WAL_PARTIAL_CORRUPT", "NETWORK_LATENCY_SPIKE", "CIRCULAR_DEPENDENCY_DEADLOCK"]>;
    targetSubsystem: z.ZodString;
    detectionTimeMs: z.ZodNumber;
    recoveryTimeMs: z.ZodNumber;
    containmentSuccess: z.ZodBoolean;
    resilienceScore: z.ZodNumber;
    warRoomActivated: z.ZodBoolean;
    simulated: z.ZodDefault<z.ZodBoolean>;
    injectedAt: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    faultId: string;
    faultType: "AST_MUTATION_OFF_BY_ONE" | "RACE_CONDITION_ASYNC_QUEUE" | "ADVERSARIAL_PROMPT_INJECTION" | "DISK_WAL_PARTIAL_CORRUPT" | "NETWORK_LATENCY_SPIKE" | "CIRCULAR_DEPENDENCY_DEADLOCK";
    targetSubsystem: string;
    detectionTimeMs: number;
    recoveryTimeMs: number;
    containmentSuccess: boolean;
    resilienceScore: number;
    warRoomActivated: boolean;
    simulated: boolean;
    injectedAt: string;
}, {
    faultId: string;
    faultType: "AST_MUTATION_OFF_BY_ONE" | "RACE_CONDITION_ASYNC_QUEUE" | "ADVERSARIAL_PROMPT_INJECTION" | "DISK_WAL_PARTIAL_CORRUPT" | "NETWORK_LATENCY_SPIKE" | "CIRCULAR_DEPENDENCY_DEADLOCK";
    targetSubsystem: string;
    detectionTimeMs: number;
    recoveryTimeMs: number;
    containmentSuccess: boolean;
    resilienceScore: number;
    warRoomActivated: boolean;
    simulated?: boolean | undefined;
    injectedAt?: string | undefined;
}>;
export type ChaosFaultInjection = z.infer<typeof ChaosFaultInjectionSchema>;
/**
 * 🗺️ 5. Creative Horizon Scanning Dossier Schema
 * Schema aggregato che valida l'intero dossier R&D di horizon scanning per la roadmap 2026+.
 */
export declare const CreativeHorizonDossierSchema: z.ZodObject<{
    version: z.ZodDefault<z.ZodString>;
    authorRole: z.ZodDefault<z.ZodString>;
    visionTheme: z.ZodString;
    strategicPillars: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        objective: z.ZodString;
        breakthroughInnovation: z.ZodString;
        targetSprint: z.ZodString;
        estimatedImpact: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        title: string;
        id: string;
        objective: string;
        breakthroughInnovation: string;
        targetSprint: string;
        estimatedImpact: string;
    }, {
        title: string;
        id: string;
        objective: string;
        breakthroughInnovation: string;
        targetSprint: string;
        estimatedImpact: string;
    }>, "many">;
    proposedPhase: z.ZodObject<{
        phaseNumber: z.ZodNumber;
        phaseName: z.ZodString;
        tagline: z.ZodString;
        sprints: z.ZodArray<z.ZodObject<{
            sprintNumber: z.ZodNumber;
            title: z.ZodString;
            focusArea: z.ZodString;
            coreTickets: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            title: string;
            sprintNumber: number;
            focusArea: string;
            coreTickets: string[];
        }, {
            title: string;
            sprintNumber: number;
            focusArea: string;
            coreTickets: string[];
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        phaseNumber: number;
        phaseName: string;
        tagline: string;
        sprints: {
            title: string;
            sprintNumber: number;
            focusArea: string;
            coreTickets: string[];
        }[];
    }, {
        phaseNumber: number;
        phaseName: string;
        tagline: string;
        sprints: {
            title: string;
            sprintNumber: number;
            focusArea: string;
            coreTickets: string[];
        }[];
    }>;
    sampleArtifacts: z.ZodOptional<z.ZodObject<{
        dynamicTool: z.ZodOptional<z.ZodObject<{
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
        }>>;
        heuristicScan: z.ZodOptional<z.ZodObject<{
            proofId: z.ZodString;
            targetFilePath: z.ZodString;
            targetSymbol: z.ZodString;
            scanEngine: z.ZodEnum<["PATTERN_HEURISTIC"]>;
            invariantsChecked: z.ZodArray<z.ZodString, "many">;
            status: z.ZodEnum<["HEURISTIC_PASSED", "COUNTEREXAMPLE_FOUND", "SCAN_TIMEOUT", "CONTRADICTORY_CONSTRAINTS"]>;
            counterexampleTrace: z.ZodOptional<z.ZodObject<{
                inputState: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                failingPath: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                reproducibleFixtureCode: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                inputState?: Record<string, any> | undefined;
                failingPath?: string[] | undefined;
                reproducibleFixtureCode?: string | undefined;
            }, {
                inputState?: Record<string, any> | undefined;
                failingPath?: string[] | undefined;
                reproducibleFixtureCode?: string | undefined;
            }>>;
            executionTimeMs: z.ZodNumber;
            verifiedAt: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            status: "HEURISTIC_PASSED" | "COUNTEREXAMPLE_FOUND" | "SCAN_TIMEOUT" | "CONTRADICTORY_CONSTRAINTS";
            proofId: string;
            targetFilePath: string;
            targetSymbol: string;
            scanEngine: "PATTERN_HEURISTIC";
            invariantsChecked: string[];
            executionTimeMs: number;
            verifiedAt: string;
            counterexampleTrace?: {
                inputState?: Record<string, any> | undefined;
                failingPath?: string[] | undefined;
                reproducibleFixtureCode?: string | undefined;
            } | undefined;
        }, {
            status: "HEURISTIC_PASSED" | "COUNTEREXAMPLE_FOUND" | "SCAN_TIMEOUT" | "CONTRADICTORY_CONSTRAINTS";
            proofId: string;
            targetFilePath: string;
            targetSymbol: string;
            scanEngine: "PATTERN_HEURISTIC";
            invariantsChecked: string[];
            executionTimeMs: number;
            counterexampleTrace?: {
                inputState?: Record<string, any> | undefined;
                failingPath?: string[] | undefined;
                reproducibleFixtureCode?: string | undefined;
            } | undefined;
            verifiedAt?: string | undefined;
        }>>;
        slmTrace: z.ZodOptional<z.ZodObject<{
            traceId: z.ZodString;
            sourceTeacherModel: z.ZodString;
            targetStudentModel: z.ZodString;
            specializedDomain: z.ZodEnum<["AST_REFACTOR", "DOCSTRING_GEN", "SYNTHETIC_FIXTURES", "CAVEMAN_ENCODING", "FAST_TRIAGE"]>;
            datasetSampleCount: z.ZodNumber;
            fpyVerificationRate: z.ZodNumber;
            quantizationFormat: z.ZodEnum<["GGUF_Q4_K_M", "GGUF_Q8_0", "ONNX_INT8", "MLX_4BIT"]>;
            averageInferenceLatencyMs: z.ZodNumber;
            cloudCostSavingsPercentage: z.ZodNumber;
            distilledAt: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            traceId: string;
            sourceTeacherModel: string;
            targetStudentModel: string;
            specializedDomain: "AST_REFACTOR" | "DOCSTRING_GEN" | "SYNTHETIC_FIXTURES" | "CAVEMAN_ENCODING" | "FAST_TRIAGE";
            datasetSampleCount: number;
            fpyVerificationRate: number;
            quantizationFormat: "GGUF_Q4_K_M" | "GGUF_Q8_0" | "ONNX_INT8" | "MLX_4BIT";
            averageInferenceLatencyMs: number;
            cloudCostSavingsPercentage: number;
            distilledAt: string;
        }, {
            traceId: string;
            sourceTeacherModel: string;
            targetStudentModel: string;
            specializedDomain: "AST_REFACTOR" | "DOCSTRING_GEN" | "SYNTHETIC_FIXTURES" | "CAVEMAN_ENCODING" | "FAST_TRIAGE";
            datasetSampleCount: number;
            fpyVerificationRate: number;
            quantizationFormat: "GGUF_Q4_K_M" | "GGUF_Q8_0" | "ONNX_INT8" | "MLX_4BIT";
            averageInferenceLatencyMs: number;
            cloudCostSavingsPercentage: number;
            distilledAt?: string | undefined;
        }>>;
        chaosExperiment: z.ZodOptional<z.ZodObject<{
            faultId: z.ZodString;
            faultType: z.ZodEnum<["AST_MUTATION_OFF_BY_ONE", "RACE_CONDITION_ASYNC_QUEUE", "ADVERSARIAL_PROMPT_INJECTION", "DISK_WAL_PARTIAL_CORRUPT", "NETWORK_LATENCY_SPIKE", "CIRCULAR_DEPENDENCY_DEADLOCK"]>;
            targetSubsystem: z.ZodString;
            detectionTimeMs: z.ZodNumber;
            recoveryTimeMs: z.ZodNumber;
            containmentSuccess: z.ZodBoolean;
            resilienceScore: z.ZodNumber;
            warRoomActivated: z.ZodBoolean;
            simulated: z.ZodDefault<z.ZodBoolean>;
            injectedAt: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            faultId: string;
            faultType: "AST_MUTATION_OFF_BY_ONE" | "RACE_CONDITION_ASYNC_QUEUE" | "ADVERSARIAL_PROMPT_INJECTION" | "DISK_WAL_PARTIAL_CORRUPT" | "NETWORK_LATENCY_SPIKE" | "CIRCULAR_DEPENDENCY_DEADLOCK";
            targetSubsystem: string;
            detectionTimeMs: number;
            recoveryTimeMs: number;
            containmentSuccess: boolean;
            resilienceScore: number;
            warRoomActivated: boolean;
            simulated: boolean;
            injectedAt: string;
        }, {
            faultId: string;
            faultType: "AST_MUTATION_OFF_BY_ONE" | "RACE_CONDITION_ASYNC_QUEUE" | "ADVERSARIAL_PROMPT_INJECTION" | "DISK_WAL_PARTIAL_CORRUPT" | "NETWORK_LATENCY_SPIKE" | "CIRCULAR_DEPENDENCY_DEADLOCK";
            targetSubsystem: string;
            detectionTimeMs: number;
            recoveryTimeMs: number;
            containmentSuccess: boolean;
            resilienceScore: number;
            warRoomActivated: boolean;
            simulated?: boolean | undefined;
            injectedAt?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        dynamicTool?: {
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
        } | undefined;
        heuristicScan?: {
            status: "HEURISTIC_PASSED" | "COUNTEREXAMPLE_FOUND" | "SCAN_TIMEOUT" | "CONTRADICTORY_CONSTRAINTS";
            proofId: string;
            targetFilePath: string;
            targetSymbol: string;
            scanEngine: "PATTERN_HEURISTIC";
            invariantsChecked: string[];
            executionTimeMs: number;
            verifiedAt: string;
            counterexampleTrace?: {
                inputState?: Record<string, any> | undefined;
                failingPath?: string[] | undefined;
                reproducibleFixtureCode?: string | undefined;
            } | undefined;
        } | undefined;
        slmTrace?: {
            traceId: string;
            sourceTeacherModel: string;
            targetStudentModel: string;
            specializedDomain: "AST_REFACTOR" | "DOCSTRING_GEN" | "SYNTHETIC_FIXTURES" | "CAVEMAN_ENCODING" | "FAST_TRIAGE";
            datasetSampleCount: number;
            fpyVerificationRate: number;
            quantizationFormat: "GGUF_Q4_K_M" | "GGUF_Q8_0" | "ONNX_INT8" | "MLX_4BIT";
            averageInferenceLatencyMs: number;
            cloudCostSavingsPercentage: number;
            distilledAt: string;
        } | undefined;
        chaosExperiment?: {
            faultId: string;
            faultType: "AST_MUTATION_OFF_BY_ONE" | "RACE_CONDITION_ASYNC_QUEUE" | "ADVERSARIAL_PROMPT_INJECTION" | "DISK_WAL_PARTIAL_CORRUPT" | "NETWORK_LATENCY_SPIKE" | "CIRCULAR_DEPENDENCY_DEADLOCK";
            targetSubsystem: string;
            detectionTimeMs: number;
            recoveryTimeMs: number;
            containmentSuccess: boolean;
            resilienceScore: number;
            warRoomActivated: boolean;
            simulated: boolean;
            injectedAt: string;
        } | undefined;
    }, {
        dynamicTool?: {
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
        } | undefined;
        heuristicScan?: {
            status: "HEURISTIC_PASSED" | "COUNTEREXAMPLE_FOUND" | "SCAN_TIMEOUT" | "CONTRADICTORY_CONSTRAINTS";
            proofId: string;
            targetFilePath: string;
            targetSymbol: string;
            scanEngine: "PATTERN_HEURISTIC";
            invariantsChecked: string[];
            executionTimeMs: number;
            counterexampleTrace?: {
                inputState?: Record<string, any> | undefined;
                failingPath?: string[] | undefined;
                reproducibleFixtureCode?: string | undefined;
            } | undefined;
            verifiedAt?: string | undefined;
        } | undefined;
        slmTrace?: {
            traceId: string;
            sourceTeacherModel: string;
            targetStudentModel: string;
            specializedDomain: "AST_REFACTOR" | "DOCSTRING_GEN" | "SYNTHETIC_FIXTURES" | "CAVEMAN_ENCODING" | "FAST_TRIAGE";
            datasetSampleCount: number;
            fpyVerificationRate: number;
            quantizationFormat: "GGUF_Q4_K_M" | "GGUF_Q8_0" | "ONNX_INT8" | "MLX_4BIT";
            averageInferenceLatencyMs: number;
            cloudCostSavingsPercentage: number;
            distilledAt?: string | undefined;
        } | undefined;
        chaosExperiment?: {
            faultId: string;
            faultType: "AST_MUTATION_OFF_BY_ONE" | "RACE_CONDITION_ASYNC_QUEUE" | "ADVERSARIAL_PROMPT_INJECTION" | "DISK_WAL_PARTIAL_CORRUPT" | "NETWORK_LATENCY_SPIKE" | "CIRCULAR_DEPENDENCY_DEADLOCK";
            targetSubsystem: string;
            detectionTimeMs: number;
            recoveryTimeMs: number;
            containmentSuccess: boolean;
            resilienceScore: number;
            warRoomActivated: boolean;
            simulated?: boolean | undefined;
            injectedAt?: string | undefined;
        } | undefined;
    }>>;
    evaluatedAt: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    version: string;
    evaluatedAt: string;
    authorRole: string;
    visionTheme: string;
    strategicPillars: {
        title: string;
        id: string;
        objective: string;
        breakthroughInnovation: string;
        targetSprint: string;
        estimatedImpact: string;
    }[];
    proposedPhase: {
        phaseNumber: number;
        phaseName: string;
        tagline: string;
        sprints: {
            title: string;
            sprintNumber: number;
            focusArea: string;
            coreTickets: string[];
        }[];
    };
    sampleArtifacts?: {
        dynamicTool?: {
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
        } | undefined;
        heuristicScan?: {
            status: "HEURISTIC_PASSED" | "COUNTEREXAMPLE_FOUND" | "SCAN_TIMEOUT" | "CONTRADICTORY_CONSTRAINTS";
            proofId: string;
            targetFilePath: string;
            targetSymbol: string;
            scanEngine: "PATTERN_HEURISTIC";
            invariantsChecked: string[];
            executionTimeMs: number;
            verifiedAt: string;
            counterexampleTrace?: {
                inputState?: Record<string, any> | undefined;
                failingPath?: string[] | undefined;
                reproducibleFixtureCode?: string | undefined;
            } | undefined;
        } | undefined;
        slmTrace?: {
            traceId: string;
            sourceTeacherModel: string;
            targetStudentModel: string;
            specializedDomain: "AST_REFACTOR" | "DOCSTRING_GEN" | "SYNTHETIC_FIXTURES" | "CAVEMAN_ENCODING" | "FAST_TRIAGE";
            datasetSampleCount: number;
            fpyVerificationRate: number;
            quantizationFormat: "GGUF_Q4_K_M" | "GGUF_Q8_0" | "ONNX_INT8" | "MLX_4BIT";
            averageInferenceLatencyMs: number;
            cloudCostSavingsPercentage: number;
            distilledAt: string;
        } | undefined;
        chaosExperiment?: {
            faultId: string;
            faultType: "AST_MUTATION_OFF_BY_ONE" | "RACE_CONDITION_ASYNC_QUEUE" | "ADVERSARIAL_PROMPT_INJECTION" | "DISK_WAL_PARTIAL_CORRUPT" | "NETWORK_LATENCY_SPIKE" | "CIRCULAR_DEPENDENCY_DEADLOCK";
            targetSubsystem: string;
            detectionTimeMs: number;
            recoveryTimeMs: number;
            containmentSuccess: boolean;
            resilienceScore: number;
            warRoomActivated: boolean;
            simulated: boolean;
            injectedAt: string;
        } | undefined;
    } | undefined;
}, {
    visionTheme: string;
    strategicPillars: {
        title: string;
        id: string;
        objective: string;
        breakthroughInnovation: string;
        targetSprint: string;
        estimatedImpact: string;
    }[];
    proposedPhase: {
        phaseNumber: number;
        phaseName: string;
        tagline: string;
        sprints: {
            title: string;
            sprintNumber: number;
            focusArea: string;
            coreTickets: string[];
        }[];
    };
    version?: string | undefined;
    evaluatedAt?: string | undefined;
    authorRole?: string | undefined;
    sampleArtifacts?: {
        dynamicTool?: {
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
        } | undefined;
        heuristicScan?: {
            status: "HEURISTIC_PASSED" | "COUNTEREXAMPLE_FOUND" | "SCAN_TIMEOUT" | "CONTRADICTORY_CONSTRAINTS";
            proofId: string;
            targetFilePath: string;
            targetSymbol: string;
            scanEngine: "PATTERN_HEURISTIC";
            invariantsChecked: string[];
            executionTimeMs: number;
            counterexampleTrace?: {
                inputState?: Record<string, any> | undefined;
                failingPath?: string[] | undefined;
                reproducibleFixtureCode?: string | undefined;
            } | undefined;
            verifiedAt?: string | undefined;
        } | undefined;
        slmTrace?: {
            traceId: string;
            sourceTeacherModel: string;
            targetStudentModel: string;
            specializedDomain: "AST_REFACTOR" | "DOCSTRING_GEN" | "SYNTHETIC_FIXTURES" | "CAVEMAN_ENCODING" | "FAST_TRIAGE";
            datasetSampleCount: number;
            fpyVerificationRate: number;
            quantizationFormat: "GGUF_Q4_K_M" | "GGUF_Q8_0" | "ONNX_INT8" | "MLX_4BIT";
            averageInferenceLatencyMs: number;
            cloudCostSavingsPercentage: number;
            distilledAt?: string | undefined;
        } | undefined;
        chaosExperiment?: {
            faultId: string;
            faultType: "AST_MUTATION_OFF_BY_ONE" | "RACE_CONDITION_ASYNC_QUEUE" | "ADVERSARIAL_PROMPT_INJECTION" | "DISK_WAL_PARTIAL_CORRUPT" | "NETWORK_LATENCY_SPIKE" | "CIRCULAR_DEPENDENCY_DEADLOCK";
            targetSubsystem: string;
            detectionTimeMs: number;
            recoveryTimeMs: number;
            containmentSuccess: boolean;
            resilienceScore: number;
            warRoomActivated: boolean;
            simulated?: boolean | undefined;
            injectedAt?: string | undefined;
        } | undefined;
    } | undefined;
}>;
export type CreativeHorizonDossier = z.infer<typeof CreativeHorizonDossierSchema>;
//# sourceMappingURL=frontiers.d.ts.map