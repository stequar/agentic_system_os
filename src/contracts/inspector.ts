import { z } from "zod";

export const ProjectStackSchema = z.object({
  targetPath: z.string(),
  languages: z.array(z.string()).min(1),
  frameworks: z.array(z.string()).default([]),
  hasDocker: z.boolean().default(false),
  packageManagers: z.array(z.string()).default([]),
  testCommands: z.array(z.string()).default([]),
  entryPoints: z.array(z.string()).default([]),
  detectedAt: z.string().datetime().default(() => new Date().toISOString()),
});

export type ProjectStack = z.infer<typeof ProjectStackSchema>;
