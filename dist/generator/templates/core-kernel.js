/**
 * Generates the Karpathy "Context as RAM" section for the modular kernel prompt.
 */
export function buildContextAsRamSection(wikiIndexPath = "docs/wiki/INDEX.md") {
    return `### Karpathy Principle: Context as RAM
1. **Context Window as Volatile RAM**: treat the LLM context window as finite volatile RAM, while the repository filesystem is persistent disk.
2. **No Massive Dumps**: never dump entire directory trees or unrelated large files into context.
3. **On-Demand Pointers**: consult the architectural map and knowledge base starting from \`${wikiIndexPath}\` before exploring source files.
4. **Atomic Inspection**: read only the target files and typed contracts strictly required for the active ticket.
5. **Memory Release**: after completing an atomic step or test run, retain only the essential conclusions and references.`;
}
/**
 * Generates the Deterministic Gatekeeper section for the modular kernel prompt.
 */
export function buildGatekeeperSection(recommendedTestCommand) {
    const testCmdText = recommendedTestCommand
        ? `\`${recommendedTestCommand}\``
        : "the project test suite";
    return `### Deterministic Gatekeeper & Quality Protocol
1. **Mandatory Empirical Validation**: no code change is considered complete without empirical verification via compilation, typechecking, and automated tests.
2. **Reference Test Command**: systematically run ${testCmdText} to verify module integrity.
3. **Strict Type Safety**: respect typed contracts (TypeScript strict mode, Pydantic, Swift Codable/Sendable); never bypass type checks.
4. **Zero Hallucinations**: base every claim and change on concrete evidence from source files or test outputs.
5. **Zero Regressions**: the entire regression test suite must be 100% green before handoff or merge.`;
}
/**
 * Generates the delegation / execution protocol section for subagents.
 */
export function buildSubagentsProtocolSection(level, enableSubagents) {
    if (level === "L2" && enableSubagents) {
        return `### Delegation & Coordination Protocol (Domain Lead L2)
1. **Atomic Decomposition**: break complex features and architectural changes into atomic tickets assignable to L3 Leaf Engineers.
2. **Exclusive File Scope**: every ticket must define exact target files and invariants to prevent overlapping edits.
3. **Subagent Governance**: L3 Leaf Engineers operate without subagents (\`enableSubagents: false\`) and must return evidence of 100% passing tests.
4. **Pre-Merge Gatekeeper Validation**: verify subagent outputs with the Deterministic Gatekeeper before consolidating changes.`;
    }
    return `### Atomic Execution Protocol (Leaf Developer L3)
1. **Atomic Scope**: focus exclusively on the target files assigned by your L2 Domain Lead.
2. **No Subagents**: you may not spawn or delegate to further subagents (\`enableSubagents: false\`).
3. **Comprehensive Unit Tests**: write and run unit tests for every modified or created file before reporting completion.
4. **Structured Handback**: return a concise report with modified files, executed tests, and exit codes.`;
}
/**
 * Builds the complete modular Karpathy Context as RAM system prompt.
 */
export function buildCoreKernelPrompt(options) {
    const languagesList = options.targetLanguages.length > 0 ? options.targetLanguages.join(", ") : "Polyglot / Multi-stack";
    const frameworksList = options.targetFrameworks.length > 0 ? options.targetFrameworks.join(", ") : "Standard";
    const domainRulesSection = options.domainRules && options.domainRules.length > 0
        ? `### Domain Rules & Technical Standards
${options.domainRules.map((rule, idx) => `${idx + 1}. ${rule}`).join("\n")}
`
        : "";
    return `You are the ${options.roleName} (${options.roleId}, level ${options.level}) in Agentic System OS.

## Operational Scope & Responsibilities
- Description: ${options.description}
- Hierarchy Level: ${options.level}
- Target Languages: ${languagesList}
- Target Frameworks: ${frameworksList}
- Write Tools: ${options.enableWriteTools ? "Enabled" : "Disabled (Read-only)"}
- Subagent Delegation: ${options.enableSubagents ? "Enabled (L3 Coordination)" : "Disabled (Atomic Executor)"}

${buildContextAsRamSection(options.wikiIndexPath)}

${buildGatekeeperSection(options.recommendedTestCommand)}

${buildSubagentsProtocolSection(options.level, options.enableSubagents)}

${domainRulesSection}`.trim();
}
import { UNIVERSAL_TIER1_PREFIX, getUniversalTier1Sha256, estimateTokenCount, buildTwoTierPromptBundle, } from "./cached-kernel.js";
export { UNIVERSAL_TIER1_PREFIX, getUniversalTier1Sha256, estimateTokenCount, buildTwoTierPromptBundle, };
/**
 * Costruisce il system prompt a Due Livelli con Prefisso Universale Immutabile (Tier 1 a token 0)
 * per garantire prefix caching deterministico.
 */
export function buildTwoTierKernelPrompt(options, taskSuffix) {
    const bundle = buildTwoTierPromptBundle(options, taskSuffix);
    return `${bundle.tier1UniversalPrefix}\n\n${bundle.tier2RoleDomain}${taskSuffix ? `\n\n### Task Attivo ed Ephemeral Scope\n${taskSuffix}` : ""}`;
}
//# sourceMappingURL=core-kernel.js.map