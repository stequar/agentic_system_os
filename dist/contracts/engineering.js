import { z } from "zod";
export const HttpMethodSchema = z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]);
export const ApiEndpointSchema = z.object({
    path: z.string(),
    method: HttpMethodSchema,
    summary: z.string(),
    requestBodySchema: z.record(z.any()).optional(),
    responseBodySchema: z.record(z.any()),
    authRequired: z.boolean().default(false),
});
export const ApiContractSchema = z.object({
    version: z.string().default("1.0.0"),
    title: z.string(),
    basePath: z.string().default("/api/v1"),
    endpoints: z.array(ApiEndpointSchema),
});
export const CodeReviewRequestSchema = z.object({
    ticketId: z.string(),
    developerRole: z.string(),
    branchName: z.string(),
    filesModified: z.array(z.string()).min(1),
    summaryOfChanges: z.string().min(10),
    selfTestPassed: z.boolean(),
});
//# sourceMappingURL=engineering.js.map