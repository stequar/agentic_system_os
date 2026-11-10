import { z } from "zod";
export declare const HttpMethodSchema: z.ZodEnum<["GET", "POST", "PUT", "PATCH", "DELETE"]>;
export declare const ApiEndpointSchema: z.ZodObject<{
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
}>;
export declare const ApiContractSchema: z.ZodObject<{
    version: z.ZodDefault<z.ZodString>;
    title: z.ZodString;
    basePath: z.ZodDefault<z.ZodString>;
    endpoints: z.ZodArray<z.ZodObject<{
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
    }>, "many">;
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
}, {
    title: string;
    endpoints: {
        path: string;
        summary: string;
        method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
        responseBodySchema: Record<string, any>;
        requestBodySchema?: Record<string, any> | undefined;
        authRequired?: boolean | undefined;
    }[];
    version?: string | undefined;
    basePath?: string | undefined;
}>;
export declare const CodeReviewRequestSchema: z.ZodObject<{
    ticketId: z.ZodString;
    developerRole: z.ZodString;
    branchName: z.ZodString;
    filesModified: z.ZodArray<z.ZodString, "many">;
    summaryOfChanges: z.ZodString;
    selfTestPassed: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    ticketId: string;
    developerRole: string;
    branchName: string;
    filesModified: string[];
    summaryOfChanges: string;
    selfTestPassed: boolean;
}, {
    ticketId: string;
    developerRole: string;
    branchName: string;
    filesModified: string[];
    summaryOfChanges: string;
    selfTestPassed: boolean;
}>;
export type ApiEndpoint = z.infer<typeof ApiEndpointSchema>;
export type ApiContract = z.infer<typeof ApiContractSchema>;
export type CodeReviewRequest = z.infer<typeof CodeReviewRequestSchema>;
//# sourceMappingURL=engineering.d.ts.map