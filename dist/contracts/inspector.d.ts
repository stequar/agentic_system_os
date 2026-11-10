import { z } from "zod";
export declare const ProjectStackSchema: z.ZodObject<{
    targetPath: z.ZodString;
    languages: z.ZodArray<z.ZodString, "many">;
    frameworks: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    hasDocker: z.ZodDefault<z.ZodBoolean>;
    packageManagers: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    testCommands: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    entryPoints: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    detectedAt: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    targetPath: string;
    languages: string[];
    frameworks: string[];
    hasDocker: boolean;
    packageManagers: string[];
    testCommands: string[];
    entryPoints: string[];
    detectedAt: string;
}, {
    targetPath: string;
    languages: string[];
    frameworks?: string[] | undefined;
    hasDocker?: boolean | undefined;
    packageManagers?: string[] | undefined;
    testCommands?: string[] | undefined;
    entryPoints?: string[] | undefined;
    detectedAt?: string | undefined;
}>;
export type ProjectStack = z.infer<typeof ProjectStackSchema>;
//# sourceMappingURL=inspector.d.ts.map