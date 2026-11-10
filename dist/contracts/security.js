import { z } from "zod";
export const SecretViolationSchema = z.object({
    secretType: z.string().describe("Categoria del segreto (es. OPENAI_KEY, AWS_KEY, PRIVATE_KEY, HIGH_ENTROPY_TOKEN)"),
    snippet: z.string().describe("Porzione di testo o token offuscato"),
    line: z.number().int().positive().optional(),
    column: z.number().int().positive().optional(),
    entropy: z.number().optional().describe("Valore di Entropia di Shannon calcolato"),
});
export const SecretScanResultSchema = z.object({
    passed: z.boolean(),
    tier: z.enum(["tier1-prompt", "tier2-precommit"]),
    violations: z.array(SecretViolationSchema).default([]),
    message: z.string().optional(),
});
//# sourceMappingURL=security.js.map