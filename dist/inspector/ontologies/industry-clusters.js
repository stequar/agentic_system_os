import { FITNESS_PILOT_SEMANTIC_CLUSTERS } from "./fitness-pilot-ontology.js";
/**
 * Built-in semantic domain clusters used by the generic scanner (extracted from
 * domain-miner.ts). Composed from: the fitness pilot pack, generic industry templates
 * (fintech, e-commerce), and the OS's own self-hosting clusters (`selfHostingCluster`).
 */
const GENERIC_INDUSTRY_CLUSTERS = [
    {
        id: "fintech_ledger_specialist",
        title: "Fintech Ledger & Payment Domain Specialist",
        boundedContext: "Double-Entry Accounting, Billing & Payment Settlement",
        keywords: ["ledger", "invoice", "payment", "settlement", "idempotency_key", "currency"],
        regexTriggers: [/\bledger\b/i, /\bpayment_intent\b/i, /\bdouble_entry\b/i],
        invariants: [
            "Every financial transaction must guarantee idempotency via a unique key and double-entry balancing.",
        ],
        microRoleCard: "[RING-2: fintech_ledger_specialist] Guardian of accounting integrity, payment idempotency, and decimal precision.",
    },
    {
        id: "commerce_fulfillment_specialist",
        title: "E-Commerce Catalog & Order Fulfillment Specialist",
        boundedContext: "Inventory Reservation, Cart & Order Lifecycle",
        keywords: ["checkout", "inventory", "order_fulfillment", "sku", "cart_item"],
        regexTriggers: [/\border_fulfillment\b/i, /\binventory_reservation\b/i],
        invariants: [
            "No order may be confirmed without an atomic reservation of available stock.",
        ],
        microRoleCard: "[RING-2: commerce_fulfillment_specialist] Custodian of the order lifecycle, stock allocation, and catalog consistency.",
    },
    {
        id: "governance_workflow_specialist",
        title: "Multi-Agent Governance, Ceremonies & Consensus Specialist",
        boundedContext: "Agile Ceremonies, Anti-Echo-Chamber Consensus & Cognitive Forcing Functions",
        keywords: [
            "ceremony-dispatcher",
            "consensus-engine",
            "state-machine",
            "workflow-eval",
            "ceremonies",
            "governance",
        ],
        regexTriggers: [
            /\bCeremonyDispatcher\b/,
            /\bConsensusEngine\b/,
            /\benforceCognitiveForcingGate\b/,
        ],
        invariants: [
            "Every anomaly or bug must pass the Cognitive Forcing Gate (MODE_2_INVESTIGATE_RCA -> MODE_3_RND_ROUNDTABLE) with CEO approval before entering MODE_4_BUILD_GATEKEEPER.",
            "All agile ceremonies must dynamically convene Ring-1 and Ring-2 experts via resolveDomainAttendeesForScope.",
        ],
        microRoleCard: "[RING-2: governance_workflow_specialist] Custodian of the CTO state machine, the Cognitive Forcing Functions, the CeremonyDispatcher, and the ConsensusEngine.",
        selfHostingCluster: true,
    },
    {
        id: "ast_gatekeeper_specialist",
        title: "Deterministic Regex Diff-Guard, Self-Healing & Sandbox Security Specialist",
        boundedContext: "Regex Diff Guard, Self-Healing Loop, Incident War Room & Worker Sandbox",
        keywords: [
            "ast-guard",
            "self-healing",
            "war-room",
            "sandbox-runner",
            "gatekeeper",
            "quarantine",
        ],
        regexTriggers: [
            /\bvalidatePatch\b/,
            /\bIncidentWarRoom\b/,
            /\bDynamicToolAstGuard\b/,
        ],
        invariants: [
            "The Regex Diff Guard must block any removal of tests or assertions (Test Preservation Invariant) and any out-of-scope changes.",
            "Every 3/3 failure of the Self-Healing loop must trigger the Incident War Room with an atomic SHA-256 rollback.",
        ],
        microRoleCard: "[RING-2: ast_gatekeeper_specialist] Guardian of the Deterministic Gatekeeper, the Regex Diff Guard, the Incident War Room, and Worker-sandbox security.",
        selfHostingCluster: true,
    },
    {
        id: "context_finops_specialist",
        title: "Karpathy Context-as-RAM, Prompt Caching & FinOps Specialist",
        boundedContext: "Two-Tier Prefix Caching, Anti-Rot Compaction & Token FinOps Telemetry",
        keywords: [
            "finops-engine",
            "context-compactor",
            "prompt-cache-adapter",
            "context-health",
            "budget-watchdog",
            "finops",
        ],
        regexTriggers: [
            /\bContextCompactor\b/,
            /\bFinOpsEngine\b/,
            /\bPromptCacheAdapter\b/,
        ],
        invariants: [
            "Threshold context compaction must preserve 100% of the ticket and target-file invariants (verifyContextInvariants).",
            "The token budget must honor the BudgetWatchdog with 100% Safe-Pause and real-time FinOps tracking.",
        ],
        microRoleCard: "[RING-2: context_finops_specialist] Architect of the Karpathy Context-as-RAM principle, Tier-1/Tier-2 Prompt Caching, Anti-Rot Compaction, and FinOps.",
        selfHostingCluster: true,
    },
];
/**
 * Full built-in catalog: pilot pack(s) first, then generic industry + OS self-hosting clusters.
 */
export const SEMANTIC_DOMAIN_CLUSTERS = [
    ...FITNESS_PILOT_SEMANTIC_CLUSTERS,
    ...GENERIC_INDUSTRY_CLUSTERS,
];
//# sourceMappingURL=industry-clusters.js.map