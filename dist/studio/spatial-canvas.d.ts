import { z } from "zod";
export declare const SpatialNodeSchema: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    category: z.ZodEnum<["EXECUTIVE_CORE", "RING_0_LEAD", "RING_1_TECH_SPECIALIST", "RING_2_DOMAIN_EXPERT", "SUBSYSTEM_CLUSTER"]>;
    ringLevel: z.ZodNumber;
    coordinates: z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
        z: z.ZodNumber;
        radius: z.ZodNumber;
        angleRad: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
        z: number;
        radius: number;
        angleRad: number;
    }, {
        x: number;
        y: number;
        z: number;
        radius: number;
        angleRad: number;
    }>;
    heatIntensity: z.ZodNumber;
    status: z.ZodEnum<["IDLE", "ACTIVE", "VERIFIED", "ALERT"]>;
    eventCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    status: "IDLE" | "ACTIVE" | "VERIFIED" | "ALERT";
    id: string;
    category: "RING_1_TECH_SPECIALIST" | "RING_2_DOMAIN_EXPERT" | "EXECUTIVE_CORE" | "RING_0_LEAD" | "SUBSYSTEM_CLUSTER";
    label: string;
    ringLevel: number;
    coordinates: {
        x: number;
        y: number;
        z: number;
        radius: number;
        angleRad: number;
    };
    heatIntensity: number;
    eventCount: number;
}, {
    status: "IDLE" | "ACTIVE" | "VERIFIED" | "ALERT";
    id: string;
    category: "RING_1_TECH_SPECIALIST" | "RING_2_DOMAIN_EXPERT" | "EXECUTIVE_CORE" | "RING_0_LEAD" | "SUBSYSTEM_CLUSTER";
    label: string;
    ringLevel: number;
    coordinates: {
        x: number;
        y: number;
        z: number;
        radius: number;
        angleRad: number;
    };
    heatIntensity: number;
    eventCount: number;
}>;
export type SpatialNode = z.infer<typeof SpatialNodeSchema>;
export declare const SpatialEdgeSchema: z.ZodObject<{
    id: z.ZodString;
    source: z.ZodString;
    target: z.ZodString;
    relation: z.ZodEnum<["COMMAND", "DELEGATION", "GATEKEEPER_GUARD", "TELEMETRY"]>;
    activeParticleCount: z.ZodNumber;
    heatIntensity: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: string;
    source: string;
    heatIntensity: number;
    target: string;
    relation: "COMMAND" | "DELEGATION" | "GATEKEEPER_GUARD" | "TELEMETRY";
    activeParticleCount: number;
}, {
    id: string;
    source: string;
    heatIntensity: number;
    target: string;
    relation: "COMMAND" | "DELEGATION" | "GATEKEEPER_GUARD" | "TELEMETRY";
    activeParticleCount: number;
}>;
export type SpatialEdge = z.infer<typeof SpatialEdgeSchema>;
export declare const SpatialArchitectureGraphSchema: z.ZodObject<{
    targetPath: z.ZodString;
    nodes: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        category: z.ZodEnum<["EXECUTIVE_CORE", "RING_0_LEAD", "RING_1_TECH_SPECIALIST", "RING_2_DOMAIN_EXPERT", "SUBSYSTEM_CLUSTER"]>;
        ringLevel: z.ZodNumber;
        coordinates: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            z: z.ZodNumber;
            radius: z.ZodNumber;
            angleRad: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
            z: number;
            radius: number;
            angleRad: number;
        }, {
            x: number;
            y: number;
            z: number;
            radius: number;
            angleRad: number;
        }>;
        heatIntensity: z.ZodNumber;
        status: z.ZodEnum<["IDLE", "ACTIVE", "VERIFIED", "ALERT"]>;
        eventCount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        status: "IDLE" | "ACTIVE" | "VERIFIED" | "ALERT";
        id: string;
        category: "RING_1_TECH_SPECIALIST" | "RING_2_DOMAIN_EXPERT" | "EXECUTIVE_CORE" | "RING_0_LEAD" | "SUBSYSTEM_CLUSTER";
        label: string;
        ringLevel: number;
        coordinates: {
            x: number;
            y: number;
            z: number;
            radius: number;
            angleRad: number;
        };
        heatIntensity: number;
        eventCount: number;
    }, {
        status: "IDLE" | "ACTIVE" | "VERIFIED" | "ALERT";
        id: string;
        category: "RING_1_TECH_SPECIALIST" | "RING_2_DOMAIN_EXPERT" | "EXECUTIVE_CORE" | "RING_0_LEAD" | "SUBSYSTEM_CLUSTER";
        label: string;
        ringLevel: number;
        coordinates: {
            x: number;
            y: number;
            z: number;
            radius: number;
            angleRad: number;
        };
        heatIntensity: number;
        eventCount: number;
    }>, "many">;
    edges: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        source: z.ZodString;
        target: z.ZodString;
        relation: z.ZodEnum<["COMMAND", "DELEGATION", "GATEKEEPER_GUARD", "TELEMETRY"]>;
        activeParticleCount: z.ZodNumber;
        heatIntensity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: string;
        source: string;
        heatIntensity: number;
        target: string;
        relation: "COMMAND" | "DELEGATION" | "GATEKEEPER_GUARD" | "TELEMETRY";
        activeParticleCount: number;
    }, {
        id: string;
        source: string;
        heatIntensity: number;
        target: string;
        relation: "COMMAND" | "DELEGATION" | "GATEKEEPER_GUARD" | "TELEMETRY";
        activeParticleCount: number;
    }>, "many">;
    hotspots: z.ZodArray<z.ZodString, "many">;
    totalTrajectoryEventsSampled: z.ZodNumber;
    generatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    targetPath: string;
    generatedAt: string;
    nodes: {
        status: "IDLE" | "ACTIVE" | "VERIFIED" | "ALERT";
        id: string;
        category: "RING_1_TECH_SPECIALIST" | "RING_2_DOMAIN_EXPERT" | "EXECUTIVE_CORE" | "RING_0_LEAD" | "SUBSYSTEM_CLUSTER";
        label: string;
        ringLevel: number;
        coordinates: {
            x: number;
            y: number;
            z: number;
            radius: number;
            angleRad: number;
        };
        heatIntensity: number;
        eventCount: number;
    }[];
    edges: {
        id: string;
        source: string;
        heatIntensity: number;
        target: string;
        relation: "COMMAND" | "DELEGATION" | "GATEKEEPER_GUARD" | "TELEMETRY";
        activeParticleCount: number;
    }[];
    hotspots: string[];
    totalTrajectoryEventsSampled: number;
}, {
    targetPath: string;
    generatedAt: string;
    nodes: {
        status: "IDLE" | "ACTIVE" | "VERIFIED" | "ALERT";
        id: string;
        category: "RING_1_TECH_SPECIALIST" | "RING_2_DOMAIN_EXPERT" | "EXECUTIVE_CORE" | "RING_0_LEAD" | "SUBSYSTEM_CLUSTER";
        label: string;
        ringLevel: number;
        coordinates: {
            x: number;
            y: number;
            z: number;
            radius: number;
            angleRad: number;
        };
        heatIntensity: number;
        eventCount: number;
    }[];
    edges: {
        id: string;
        source: string;
        heatIntensity: number;
        target: string;
        relation: "COMMAND" | "DELEGATION" | "GATEKEEPER_GUARD" | "TELEMETRY";
        activeParticleCount: number;
    }[];
    hotspots: string[];
    totalTrajectoryEventsSampled: number;
}>;
export type SpatialArchitectureGraph = z.infer<typeof SpatialArchitectureGraphSchema>;
/**
 * Costruisce il grafo spaziale 2D/3D concentrico dell'architettura Tri-Ring e dei sottosistemi,
 * arricchendo ogni nodo e arco con la heatmap in tempo reale delle traiettorie agenti.
 */
export declare function buildSpatialArchitectureGraph(targetPath: string): Promise<SpatialArchitectureGraph>;
//# sourceMappingURL=spatial-canvas.d.ts.map