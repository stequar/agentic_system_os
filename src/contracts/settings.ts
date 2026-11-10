import { z } from "zod";

export const SpikeCheckpointModeSchema = z.enum([
  "HITL_SPIKE_REVIEW",
  "AUTONOMOUS_FAST_TRACK",
]);
export type SpikeCheckpointMode = z.infer<typeof SpikeCheckpointModeSchema>;

export const AnomalyGateModeSchema = z.enum(["STRICT_CFF_4_GATES", "ADVISORY"]);
export type AnomalyGateMode = z.infer<typeof AnomalyGateModeSchema>;

export const ReleaseApprovalModeSchema = z.enum([
  "CEO_MANDATORY",
  "GATEKEEPER_AUTO",
]);
export type ReleaseApprovalMode = z.infer<typeof ReleaseApprovalModeSchema>;

export const LocalSlmExecutionModeSchema = z.enum([
  "AUTO_HARDWARE_ADAPTIVE",
  "FORCE_ENABLED",
  "DISABLED_CLOUD_ONLY",
]);
export type LocalSlmExecutionMode = z.infer<typeof LocalSlmExecutionModeSchema>;

export const CompanyLanguageSchema = z.enum(["en", "it"]);
export type CompanyLanguage = z.infer<typeof CompanyLanguageSchema>;

export const PersonaPresetSchema = z.enum([
  "ENGINEERING_PROFESSIONAL",
  "STARTUP_EXECUTIVE",
]);
export type PersonaPreset = z.infer<typeof PersonaPresetSchema>;

export const GovernanceSettingsSchema = z.object({
  spikeCheckpoint: SpikeCheckpointModeSchema.default("HITL_SPIKE_REVIEW"),
  anomalyGate: AnomalyGateModeSchema.default("STRICT_CFF_4_GATES"),
  releaseApproval: ReleaseApprovalModeSchema.default("CEO_MANDATORY"),
  roundtableDevilsAdvocate: z.boolean().default(true),
});

export const LocalSlmSettingsSchema = z.object({
  mode: LocalSlmExecutionModeSchema.default("AUTO_HARDWARE_ADAPTIVE"),
  preferredModelOverride: z.string().nullable().default(null),
  ollamaEndpoint: z.string().default("http://127.0.0.1:11434"),
  slaTimeoutMs: z.number().int().min(100).max(10000).default(800),
});

/**
 * TCK-DH.2b Phase 2 — honest canonical keys only (`enableHeuristicScanner` /
 * `heuristicScannerTimeoutMs`). The preprocess performs a ONE-WAY migration of the
 * legacy `enableFormalAstProver` / `formalProverTimeoutMs` keys from existing
 * `.company-os/settings.json` files (legacy -> canonical only if canonical is absent),
 * so field settings keep their operator values on upgrade. The legacy keys are no
 * longer part of the schema and are stripped from the parsed output.
 */
export const GatekeeperSettingsSchema = z.preprocess((raw) => {
  if (!raw || typeof raw !== "object") return raw;
  const r = { ...(raw as Record<string, unknown>) };
  if (r.enableHeuristicScanner === undefined && r.enableFormalAstProver !== undefined)
    r.enableHeuristicScanner = r.enableFormalAstProver;
  if (r.heuristicScannerTimeoutMs === undefined && r.formalProverTimeoutMs !== undefined)
    r.heuristicScannerTimeoutMs = r.formalProverTimeoutMs;
  return r;
}, z.object({
  enableHeuristicScanner: z.boolean().default(true),
  heuristicScannerTimeoutMs: z.number().int().min(50).max(5000).default(500),
  selfHealingMaxRetries: z.number().int().min(1).max(5).default(3),
  enableWarRoomCircuitBreaker: z.boolean().default(true),
  useTiaTargetedTests: z.boolean().default(true),
}));

export const CommunicationSettingsSchema = z.object({
  personaPreset: PersonaPresetSchema.default("ENGINEERING_PROFESSIONAL"),
  cavemanMode: z.boolean().default(true),
  language: CompanyLanguageSchema.default("en"),
  greetingRule3Options: z.boolean().default(true),
});

export const FinOpsSettingsSchema = z.object({
  maxSessionBudgetUsd: z.number().positive().default(5.0),
  safePauseOnBudgetExceeded: z.boolean().default(true),
  enableTwoTierPromptCache: z.boolean().default(true),
});

export const CompanySettingsSchema = z.object({
  version: z.string().default("1.0.0"),
  governance: GovernanceSettingsSchema.default({}),
  localSlm: LocalSlmSettingsSchema.default({}),
  gatekeeper: GatekeeperSettingsSchema.default({}),
  communication: CommunicationSettingsSchema.default({}),
  finops: FinOpsSettingsSchema.default({}),
});

export type CompanySettings = z.infer<typeof CompanySettingsSchema>;

export interface SettingReferenceEntry {
  key: string;
  section: "governance" | "localSlm" | "gatekeeper" | "communication" | "finops";
  type: "enum" | "boolean" | "number" | "string" | "string | null";
  possibleValues: string[];
  defaultValue: string | number | boolean | null;
  description: string;
}

export const SETTINGS_REFERENCE_CATALOG: SettingReferenceEntry[] = [
  {
    key: "governance.spikeCheckpoint",
    section: "governance",
    type: "enum",
    possibleValues: ["HITL_SPIKE_REVIEW", "AUTONOMOUS_FAST_TRACK"],
    defaultValue: "HITL_SPIKE_REVIEW",
    description:
      "CFF-5 Spike Checkpoint Gate: HITL_SPIKE_REVIEW pauses after Spike for CEO review; AUTONOMOUS_FAST_TRACK proceeds directly to implementation when verdict is APPROVED.",
  },
  {
    key: "governance.anomalyGate",
    section: "governance",
    type: "enum",
    possibleValues: ["STRICT_CFF_4_GATES", "ADVISORY"],
    defaultValue: "STRICT_CFF_4_GATES",
    description:
      "CFF-1..4 Anomaly Gate: STRICT_CFF_4_GATES enforces Stop-the-Line RCA + R&D Roundtable + CEO approval on bugs; ADVISORY logs warnings without blocking.",
  },
  {
    key: "governance.releaseApproval",
    section: "governance",
    type: "enum",
    possibleValues: ["CEO_MANDATORY", "GATEKEEPER_AUTO"],
    defaultValue: "CEO_MANDATORY",
    description:
      "Controls whether final release/merge requires explicit CEO sign-off or auto-approves on 100% green Gatekeeper.",
  },
  {
    key: "governance.roundtableDevilsAdvocate",
    section: "governance",
    type: "boolean",
    possibleValues: ["true", "false"],
    defaultValue: true,
    description:
      "Mandates qa_lead and Ring-2 Domain Experts as Devil's Advocate in every R&D Roundtable.",
  },
  {
    key: "localSlm.mode",
    section: "localSlm",
    type: "enum",
    possibleValues: [
      "AUTO_HARDWARE_ADAPTIVE",
      "FORCE_ENABLED",
      "DISABLED_CLOUD_ONLY",
    ],
    defaultValue: "AUTO_HARDWARE_ADAPTIVE",
    description:
      "Controls Tier-0 Local SLM Swarm routing: hardware-adaptive auto-detection, forced local execution, or cloud/deterministic bypass.",
  },
  {
    key: "localSlm.preferredModelOverride",
    section: "localSlm",
    type: "string | null",
    possibleValues: [
      "null",
      "qwen3-coder:30b-a3b-q4_K_M",
      "qwen3:8b-q4_K_M",
      "gemma3:12b-it-qat",
      "phi4-mini:3.8b-q4_K_M",
      "qwen3:1.7b-q4_K_M",
    ],
    defaultValue: null,
    description:
      "Optional explicit Ollama/llama.cpp model tag override; when null, selects the best installed or hardware-recommended model.",
  },
  {
    key: "localSlm.ollamaEndpoint",
    section: "localSlm",
    type: "string",
    possibleValues: ["http://127.0.0.1:11434", "http://localhost:11434"],
    defaultValue: "http://127.0.0.1:11434",
    description: "Local HTTP endpoint for Ollama or OpenAI-compatible SLM server.",
  },
  {
    key: "localSlm.slaTimeoutMs",
    section: "localSlm",
    type: "number",
    possibleValues: ["100..10000"],
    defaultValue: 800,
    description:
      "Maximum latency in milliseconds before circuit-breaking local SLM inference to deterministic fallback.",
  },
  {
    key: "gatekeeper.enableHeuristicScanner",
    section: "gatekeeper",
    type: "boolean",
    possibleValues: ["true", "false"],
    defaultValue: true,
    description:
      "Enables the pattern-based heuristic static scanner in the Gatekeeper (regex-driven pre/post-condition and risk-pattern checks — NOT a formal SMT/SAT prover).",
  },
  {
    key: "gatekeeper.heuristicScannerTimeoutMs",
    section: "gatekeeper",
    type: "number",
    possibleValues: ["50..5000"],
    defaultValue: 500,
    description: "Maximum execution time in milliseconds for the heuristic static scanner.",
  },
  {
    key: "gatekeeper.selfHealingMaxRetries",
    section: "gatekeeper",
    type: "number",
    possibleValues: ["1..5"],
    defaultValue: 3,
    description:
      "Maximum autonomous Self-Healing repair attempts before escalating to Incident War Room.",
  },
  {
    key: "gatekeeper.enableWarRoomCircuitBreaker",
    section: "gatekeeper",
    type: "boolean",
    possibleValues: ["true", "false"],
    defaultValue: true,
    description:
      "Triggers atomic SHA-256 rollback and Incident War Room when Self-Healing exhausts retries.",
  },
  {
    key: "gatekeeper.useTiaTargetedTests",
    section: "gatekeeper",
    type: "boolean",
    possibleValues: ["true", "false"],
    defaultValue: true,
    description:
      "Uses Test Impact Analysis (TIA) graph to run targeted tests during inner-loop healing.",
  },
  {
    key: "communication.personaPreset",
    section: "communication",
    type: "enum",
    possibleValues: ["ENGINEERING_PROFESSIONAL", "STARTUP_EXECUTIVE"],
    defaultValue: "ENGINEERING_PROFESSIONAL",
    description:
      "Naming taxonomy for human and primary agent: ENGINEERING_PROFESSIONAL ('Project Lead' & 'Lead Orchestrator L1') vs STARTUP_EXECUTIVE ('CEO' & 'CTO').",
  },
  {
    key: "communication.cavemanMode",
    section: "communication",
    type: "boolean",
    possibleValues: ["true", "false"],
    defaultValue: true,
    description:
      "Applies Ultra-Terse Caveman Compression on agent-to-agent handoffs while keeping executive clarity for the Project Lead.",
  },
  {
    key: "communication.language",
    section: "communication",
    type: "enum",
    possibleValues: ["en", "it"],
    defaultValue: "en",
    description:
      "Primary language for Lead Orchestrator communication, generated instructions, and reports.",
  },
  {
    key: "communication.greetingRule3Options",
    section: "communication",
    type: "boolean",
    possibleValues: ["true", "false"],
    defaultValue: true,
    description:
      "Enforces the 3-Option Greeting Rule (/run-company, /investigate-anomaly, /rnd-roundtable) at session start.",
  },
  {
    key: "finops.maxSessionBudgetUsd",
    section: "finops",
    type: "number",
    possibleValues: ["> 0 (e.g. 5.0, 10.0, 25.0)"],
    defaultValue: 5.0,
    description: "Maximum token budget in USD per session monitored by BudgetWatchdog.",
  },
  {
    key: "finops.safePauseOnBudgetExceeded",
    section: "finops",
    type: "boolean",
    possibleValues: ["true", "false"],
    defaultValue: true,
    description:
      "Automatically pauses autonomous subagent spawning when 100% of maxSessionBudgetUsd is reached.",
  },
  {
    key: "finops.enableTwoTierPromptCache",
    section: "finops",
    type: "boolean",
    possibleValues: ["true", "false"],
    defaultValue: true,
    description:
      "Enables Two-Tier Prompt Prefix Caching (Static System Prefix + Semi-Static Wiki Digest).",
  },
];
