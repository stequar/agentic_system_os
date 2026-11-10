import { z } from "zod";
export const ReviewViolationSchema = z.object({
    file: z.string(),
    line: z.number().optional(),
    severity: z.enum(["info", "warning", "critical"]),
    message: z.string(),
    suggestedFix: z.string().optional(),
});
export const GatekeeperResultSchema = z.object({
    typecheckPassed: z.boolean(),
    linterPassed: z.boolean(),
    testsPassed: z.boolean(),
    totalTests: z.number().default(0),
    failedTests: z.number().default(0),
    rawOutput: z.string().optional(),
});
export const ReviewReportSchema = z.object({
    ticketId: z.string(),
    reviewerRole: z.string(),
    status: z.enum(["APPROVED", "CHANGES_REQUESTED", "REJECTED"]),
    gatekeeper: GatekeeperResultSchema,
    architecturalCompliance: z.boolean(),
    violations: z.array(ReviewViolationSchema).default([]),
    finalNotes: z.string(),
    reviewedAt: z.string().datetime().default(() => new Date().toISOString()),
});
//# sourceMappingURL=review.js.map