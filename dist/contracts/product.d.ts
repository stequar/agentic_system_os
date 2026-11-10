import { z } from "zod";
export declare const AcceptanceCriteriaSchema: z.ZodObject<{
    id: z.ZodString;
    description: z.ZodString;
    isMandatory: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: string;
    description: string;
    isMandatory: boolean;
}, {
    id: string;
    description: string;
    isMandatory?: boolean | undefined;
}>;
export declare const ProductTicketSchema: z.ZodObject<{
    id: z.ZodString;
    epicId: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    assignedTeam: z.ZodEnum<["product", "backend", "frontend", "mobile", "ai", "qa"]>;
    priority: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "critical"]>>;
    acceptanceCriteria: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        description: z.ZodString;
        isMandatory: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        description: string;
        isMandatory: boolean;
    }, {
        id: string;
        description: string;
        isMandatory?: boolean | undefined;
    }>, "many">;
    createdAt: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    id: string;
    description: string;
    createdAt: string;
    epicId: string;
    priority: "critical" | "low" | "high" | "medium";
    acceptanceCriteria: {
        id: string;
        description: string;
        isMandatory: boolean;
    }[];
    assignedTeam: "backend" | "frontend" | "mobile" | "product" | "ai" | "qa";
}, {
    title: string;
    id: string;
    description: string;
    epicId: string;
    acceptanceCriteria: {
        id: string;
        description: string;
        isMandatory?: boolean | undefined;
    }[];
    assignedTeam: "backend" | "frontend" | "mobile" | "product" | "ai" | "qa";
    createdAt?: string | undefined;
    priority?: "critical" | "low" | "high" | "medium" | undefined;
}>;
export declare const EpicSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    vision: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["draft", "in_progress", "completed", "cancelled"]>>;
    tickets: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        epicId: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        assignedTeam: z.ZodEnum<["product", "backend", "frontend", "mobile", "ai", "qa"]>;
        priority: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "critical"]>>;
        acceptanceCriteria: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            description: z.ZodString;
            isMandatory: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            description: string;
            isMandatory: boolean;
        }, {
            id: string;
            description: string;
            isMandatory?: boolean | undefined;
        }>, "many">;
        createdAt: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        id: string;
        description: string;
        createdAt: string;
        epicId: string;
        priority: "critical" | "low" | "high" | "medium";
        acceptanceCriteria: {
            id: string;
            description: string;
            isMandatory: boolean;
        }[];
        assignedTeam: "backend" | "frontend" | "mobile" | "product" | "ai" | "qa";
    }, {
        title: string;
        id: string;
        description: string;
        epicId: string;
        acceptanceCriteria: {
            id: string;
            description: string;
            isMandatory?: boolean | undefined;
        }[];
        assignedTeam: "backend" | "frontend" | "mobile" | "product" | "ai" | "qa";
        createdAt?: string | undefined;
        priority?: "critical" | "low" | "high" | "medium" | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    status: "completed" | "cancelled" | "draft" | "in_progress";
    title: string;
    id: string;
    tickets: {
        title: string;
        id: string;
        description: string;
        createdAt: string;
        epicId: string;
        priority: "critical" | "low" | "high" | "medium";
        acceptanceCriteria: {
            id: string;
            description: string;
            isMandatory: boolean;
        }[];
        assignedTeam: "backend" | "frontend" | "mobile" | "product" | "ai" | "qa";
    }[];
    vision: string;
}, {
    title: string;
    id: string;
    vision: string;
    status?: "completed" | "cancelled" | "draft" | "in_progress" | undefined;
    tickets?: {
        title: string;
        id: string;
        description: string;
        epicId: string;
        acceptanceCriteria: {
            id: string;
            description: string;
            isMandatory?: boolean | undefined;
        }[];
        assignedTeam: "backend" | "frontend" | "mobile" | "product" | "ai" | "qa";
        createdAt?: string | undefined;
        priority?: "critical" | "low" | "high" | "medium" | undefined;
    }[] | undefined;
}>;
export type AcceptanceCriteria = z.infer<typeof AcceptanceCriteriaSchema>;
export type ProductTicket = z.infer<typeof ProductTicketSchema>;
export type Epic = z.infer<typeof EpicSchema>;
//# sourceMappingURL=product.d.ts.map