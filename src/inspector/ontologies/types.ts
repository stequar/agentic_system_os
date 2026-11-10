/**
 * Shared ontology types for the domain scanner (extracted from domain-miner.ts to
 * decompose the god-object and give the ontology packs a neutral home).
 */
export interface SemanticDomainClusterRule {
  id: string;
  title: string;
  boundedContext: string;
  keywords: string[];
  regexTriggers: RegExp[];
  invariants: string[];
  microRoleCard: string;
  selfHostingCluster?: boolean;
}
