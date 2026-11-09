import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { TrajectoryReader } from "../core/trajectory-reader.js";
import { TriRingOrgChartSchema } from "../contracts/brownfield.js";

export const SpatialNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  category: z.enum([
    "EXECUTIVE_CORE",
    "RING_0_LEAD",
    "RING_1_TECH_SPECIALIST",
    "RING_2_DOMAIN_EXPERT",
    "SUBSYSTEM_CLUSTER",
  ]),
  ringLevel: z.number().int().min(0).max(4),
  coordinates: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
    radius: z.number().nonnegative(),
    angleRad: z.number(),
  }),
  heatIntensity: z.number().min(0).max(1),
  status: z.enum(["IDLE", "ACTIVE", "VERIFIED", "ALERT"]),
  eventCount: z.number().int().nonnegative(),
});
export type SpatialNode = z.infer<typeof SpatialNodeSchema>;

export const SpatialEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  relation: z.enum(["COMMAND", "DELEGATION", "GATEKEEPER_GUARD", "TELEMETRY"]),
  activeParticleCount: z.number().int().nonnegative(),
  heatIntensity: z.number().min(0).max(1),
});
export type SpatialEdge = z.infer<typeof SpatialEdgeSchema>;

export const SpatialArchitectureGraphSchema = z.object({
  targetPath: z.string(),
  nodes: z.array(SpatialNodeSchema),
  edges: z.array(SpatialEdgeSchema),
  hotspots: z.array(z.string()),
  totalTrajectoryEventsSampled: z.number().int().nonnegative(),
  generatedAt: z.string().datetime(),
});
export type SpatialArchitectureGraph = z.infer<
  typeof SpatialArchitectureGraphSchema
>;

function computeRadialCoords(
  ringLevel: number,
  radius: number,
  index: number,
  totalInRing: number
): { x: number; y: number; z: number; radius: number; angleRad: number } {
  if (radius === 0 || totalInRing <= 1) {
    return { x: 0, y: 0, z: ringLevel * 20, radius: 0, angleRad: 0 };
  }
  const angleRad =
    Math.round(((2 * Math.PI * index) / totalInRing) * 1000) / 1000;
  const x = Math.round(radius * Math.cos(angleRad) * 100) / 100;
  const y = Math.round(radius * Math.sin(angleRad) * 100) / 100;
  const z = ringLevel * 25;
  return { x, y, z, radius, angleRad };
}

/**
 * Costruisce il grafo spaziale 2D/3D concentrico dell'architettura Tri-Ring e dei sottosistemi,
 * arricchendo ogni nodo e arco con la heatmap in tempo reale delle traiettorie agenti.
 */
export async function buildSpatialArchitectureGraph(
  targetPath: string
): Promise<SpatialArchitectureGraph> {
  const resolvedPath = path.resolve(targetPath);

  // 1. Legge gli eventi recenti della traiettoria per calcolare la heatmap
  const trajectory = await TrajectoryReader.readTrajectory(resolvedPath, {
    limit: 50,
  });

  const agentEventCounts = new Map<string, number>();
  let qualityEvents = 0;
  let securityEvents = 0;

  for (const node of trajectory.nodes) {
    const src = node.sourceAgent.toLowerCase();
    agentEventCounts.set(src, (agentEventCounts.get(src) ?? 0) + 1);
    if (node.category === "QUALITY_GATE" || node.category === "SELF_HEALING") {
      qualityEvents++;
    }
    if (node.type.includes("SECURITY") || node.type.includes("CHAOS")) {
      securityEvents++;
    }
  }

  // 2. Carica opzionalmente l'organigramma Tri-Ring dal workspace
  let ring1Ids = ["frontend_manager", "mcp_cli_runtime_specialist"];
  let ring2Ids = [
    "governance_workflow_specialist",
    "ast_gatekeeper_specialist",
    "context_finops_specialist",
  ];

  try {
    const orgRaw = await fs.readFile(
      path.join(resolvedPath, ".company-os", "org-chart.json"),
      "utf-8"
    );
    const parsedOrg = TriRingOrgChartSchema.safeParse(JSON.parse(orgRaw));
    if (parsedOrg.success) {
      if (parsedOrg.data.ring1TechSpecialists.length > 0) {
        ring1Ids = parsedOrg.data.ring1TechSpecialists.map((s) => s.id);
      }
      if (parsedOrg.data.ring2DomainExperts.length > 0) {
        ring2Ids = parsedOrg.data.ring2DomainExperts.map((s) => s.id);
      }
    }
  } catch {
    // Usa i default Tri-Ring
  }

  const nodes: SpatialNode[] = [];
  const edges: SpatialEdge[] = [];

  const getHeat = (count: number): number =>
    Math.min(1, Math.round((0.15 + count * 0.15) * 100) / 100);

  // Anello 0 (Centro): CTO Orchestrator
  const ctoCount =
    (agentEventCounts.get("cto") ?? 0) +
    (agentEventCounts.get("orchestrator") ?? 0) +
    1;
  nodes.push({
    id: "cto",
    label: "CTO Orchestrator (L1)",
    category: "EXECUTIVE_CORE",
    ringLevel: 0,
    coordinates: computeRadialCoords(0, 0, 0, 1),
    heatIntensity: getHeat(ctoCount),
    status: "ACTIVE",
    eventCount: ctoCount,
  });

  // Anello 1 (r = 140): Ring-0 Core Leads
  const ring0Leads = [
    "engineering_lead",
    "product_lead",
    "qa_lead",
    "ai_lead",
    "rnd_lead",
  ];
  ring0Leads.forEach((leadId, idx) => {
    const count = (agentEventCounts.get(leadId) ?? 0) + 1;
    const heat = getHeat(count);
    nodes.push({
      id: leadId,
      label: leadId,
      category: "RING_0_LEAD",
      ringLevel: 1,
      coordinates: computeRadialCoords(1, 140, idx, ring0Leads.length),
      heatIntensity: heat,
      status: heat > 0.4 ? "ACTIVE" : "VERIFIED",
      eventCount: count,
    });
    edges.push({
      id: `edge-cto-${leadId}`,
      source: "cto",
      target: leadId,
      relation: "COMMAND",
      activeParticleCount: Math.max(1, Math.min(5, count)),
      heatIntensity: heat,
    });
  });

  // Anello 2 (r = 260): Ring-1 Tech Specialists + Ring-2 Domain Experts
  const ring1And2 = [
    ...ring1Ids.map((id) => ({
      id,
      category: "RING_1_TECH_SPECIALIST" as const,
    })),
    ...ring2Ids.map((id) => ({
      id,
      category: "RING_2_DOMAIN_EXPERT" as const,
    })),
  ];

  ring1And2.forEach((spec, idx) => {
    const count = agentEventCounts.get(spec.id) ?? 1;
    const heat = getHeat(count);
    nodes.push({
      id: spec.id,
      label: spec.id,
      category: spec.category,
      ringLevel: 2,
      coordinates: computeRadialCoords(2, 260, idx, ring1And2.length),
      heatIntensity: heat,
      status: "VERIFIED",
      eventCount: count,
    });

    const parentLead =
      spec.category === "RING_1_TECH_SPECIALIST"
        ? "engineering_lead"
        : "rnd_lead";
    edges.push({
      id: `edge-${parentLead}-${spec.id}`,
      source: parentLead,
      target: spec.id,
      relation: "DELEGATION",
      activeParticleCount: Math.max(1, count),
      heatIntensity: heat,
    });
  });

  // Anello 3 (r = 380): Subsystem Clusters del Codice
  const subsystems = [
    {
      id: "sub_formal_prover",
      label: "gatekeeper/formal-prover",
      guardian: "qa_lead",
      events: qualityEvents + 2,
    },
    {
      id: "sub_quad_tier_slm",
      label: "distillation/quad-tier-slm",
      guardian: "ai_lead",
      events: 2,
    },
    {
      id: "sub_chaos_engine",
      label: "security/chaos-engine",
      guardian: "qa_lead",
      events: securityEvents + 2,
    },
    {
      id: "sub_dynamic_mcp",
      label: "mcp/dynamic-registry",
      guardian: "engineering_lead",
      events: 2,
    },
    {
      id: "sub_merkle_audit",
      label: "core/merkle-audit",
      guardian: "cto",
      events: Math.max(1, trajectory.nodes.length),
    },
  ];

  subsystems.forEach((sub, idx) => {
    const heat = getHeat(sub.events);
    nodes.push({
      id: sub.id,
      label: sub.label,
      category: "SUBSYSTEM_CLUSTER",
      ringLevel: 3,
      coordinates: computeRadialCoords(3, 380, idx, subsystems.length),
      heatIntensity: heat,
      status: "VERIFIED",
      eventCount: sub.events,
    });
    edges.push({
      id: `edge-${sub.guardian}-${sub.id}`,
      source: sub.guardian,
      target: sub.id,
      relation: "GATEKEEPER_GUARD",
      activeParticleCount: Math.max(1, Math.min(6, sub.events)),
      heatIntensity: heat,
    });
  });

  const hotspots = nodes
    .filter((n) => n.heatIntensity >= 0.4)
    .sort((a, b) => b.heatIntensity - a.heatIntensity)
    .map((n) => n.id);

  return SpatialArchitectureGraphSchema.parse({
    targetPath: resolvedPath,
    nodes,
    edges,
    hotspots,
    totalTrajectoryEventsSampled: trajectory.nodes.length,
    generatedAt: new Date().toISOString(),
  });
}
