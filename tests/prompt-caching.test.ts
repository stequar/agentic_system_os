import { describe, it, expect } from "vitest";
import {
  UNIVERSAL_TIER1_PREFIX,
  getUniversalTier1Sha256,
  estimateTokenCount,
  buildTwoTierPromptBundle,
} from "../src/generator/templates/cached-kernel.js";
import { PromptCacheAdapter } from "../src/core/prompt-cache-adapter.js";
import { TwoTierPromptBundleSchema } from "../src/contracts/prompts.js";
import {
  buildMobileManagerPrompt,
  buildBackendManagerPrompt,
  buildFrontendManagerPrompt,
  buildGoManagerPrompt,
  buildRustManagerPrompt,
  buildLeadEngineerPrompt,
} from "../src/generator/templates/roles-prompts.js";

describe("Two-Tier Prompt Engine & Universal Prefix Caching (TCK-10.1)", () => {
  it("verifica che il Tier 1 Universal Prefix superi la soglia minima di 1024 token per il caching", () => {
    const estimatedTokens = estimateTokenCount(UNIVERSAL_TIER1_PREFIX);
    expect(estimatedTokens).toBeGreaterThanOrEqual(1024);
    expect(UNIVERSAL_TIER1_PREFIX.length).toBeGreaterThan(4000);
  });

  it("garantisce che l'hash SHA-256 del Tier 1 sia rigorosamente immutabile e byte-identico inter-ruolo", () => {
    const sha1 = getUniversalTier1Sha256();
    expect(sha1).toBeDefined();
    expect(sha1).toHaveLength(64);

    const bundleMobile = buildTwoTierPromptBundle({
      roleId: "mobile_manager",
      roleName: "Mobile Engineering Lead",
      level: "L2",
      description: "Mobile Lead",
      targetLanguages: ["swift"],
      targetFrameworks: ["swiftui"],
      enableSubagents: true,
      enableWriteTools: true,
    });

    const bundleBackend = buildTwoTierPromptBundle({
      roleId: "backend_manager",
      roleName: "Backend Engineering Lead",
      level: "L2",
      description: "Backend Lead",
      targetLanguages: ["python"],
      targetFrameworks: ["fastapi"],
      enableSubagents: true,
      enableWriteTools: true,
    });

    const bundleRust = buildTwoTierPromptBundle({
      roleId: "rust_manager",
      roleName: "Rust Systems Lead",
      level: "L2",
      description: "Rust Lead",
      targetLanguages: ["rust"],
      targetFrameworks: [],
      enableSubagents: true,
      enableWriteTools: true,
    });

    // Gli hash del prefisso Tier 1 devono essere rigorosamente identici bit-a-bit
    expect(bundleMobile.sha256Tier1).toBe(sha1);
    expect(bundleBackend.sha256Tier1).toBe(sha1);
    expect(bundleRust.sha256Tier1).toBe(sha1);
    expect(bundleMobile.tier1UniversalPrefix).toBe(bundleBackend.tier1UniversalPrefix);
    expect(bundleBackend.tier1UniversalPrefix).toBe(bundleRust.tier1UniversalPrefix);
  });

  it("genera un TwoTierPromptBundle valido rispetto allo schema Zod", () => {
    const bundle = buildTwoTierPromptBundle(
      {
        roleId: "lead_engineer",
        roleName: "Lead Systems Engineer",
        level: "L2",
        description: "Lead Systems Engineer",
        targetLanguages: ["typescript"],
        targetFrameworks: ["node"],
        enableSubagents: true,
        enableWriteTools: true,
      },
      "Ticket TCK-10.1: Implementazione Universal Prefix Caching"
    );

    const parsed = TwoTierPromptBundleSchema.safeParse(bundle);
    expect(parsed.success).toBe(true);
    expect(bundle.roleId).toBe("lead_engineer");
    expect(bundle.tier3TaskSuffix).toContain("Ticket TCK-10.1");
    expect(bundle.estimatedTier1Tokens).toBeGreaterThanOrEqual(1024);
  });

  it("adatta correttamente il bundle per Anthropic Claude con breakpoint ephemeral cache_control", () => {
    const bundle = buildTwoTierPromptBundle({
      roleId: "frontend_manager",
      roleName: "Frontend Engineering Lead",
      level: "L2",
      description: "Frontend Lead",
      targetLanguages: ["typescript"],
      targetFrameworks: ["react"],
      enableSubagents: true,
      enableWriteTools: true,
    });

    const anthropicPayload = PromptCacheAdapter.formatForAnthropic(bundle, {
      taskMessage: "Risolvi issue #42",
    });

    expect(anthropicPayload.system).toHaveLength(2);
    // Il primo blocco (Tier 1) deve avere il marcatore di cache esplicito
    expect(anthropicPayload.system[0].cache_control).toEqual({ type: "ephemeral" });
    expect(anthropicPayload.system[0].text).toBe(UNIVERSAL_TIER1_PREFIX);
    // Il secondo blocco contiene le regole di ruolo
    expect(anthropicPayload.system[1].cache_control).toBeUndefined();
    expect(anthropicPayload.system[1].text).toContain("Frontend Engineering Lead");
    expect(anthropicPayload.userContent).toBe("Risolvi issue #42");
  });

  it("adatta correttamente il bundle per OpenAI con prefisso invariante idoneo al caching", () => {
    const bundle = buildTwoTierPromptBundle({
      roleId: "go_manager",
      roleName: "Go Engineering Lead",
      level: "L2",
      description: "Go Lead",
      targetLanguages: ["go"],
      targetFrameworks: [],
      enableSubagents: true,
      enableWriteTools: true,
    });

    const openAiPayload = PromptCacheAdapter.formatForOpenAi(bundle, {
      taskMessage: "Implementa goroutine pool",
    });

    expect(openAiPayload.systemMessage.startsWith(UNIVERSAL_TIER1_PREFIX)).toBe(true);
    expect(openAiPayload.systemMessage).toContain("Go Engineering Lead");
    expect(openAiPayload.userMessage).toBe("Implementa goroutine pool");
    expect(openAiPayload.isPrefixEligible).toBe(true);
  });

  it("adatta correttamente il bundle per Google Gemini con systemInstruction", () => {
    const bundle = buildTwoTierPromptBundle({
      roleId: "mobile_manager",
      roleName: "Mobile Engineering Lead",
      level: "L2",
      description: "Mobile Lead",
      targetLanguages: ["swift"],
      targetFrameworks: ["swiftui"],
      enableSubagents: true,
      enableWriteTools: true,
    });

    const geminiPayload = PromptCacheAdapter.formatForGemini(bundle, {
      taskMessage: "Verifica ARC weak self",
    });

    expect(geminiPayload.systemInstruction).toBe(UNIVERSAL_TIER1_PREFIX);
    expect(geminiPayload.userContent).toContain("Mobile Engineering Lead");
    expect(geminiPayload.userContent).toContain("Verifica ARC weak self");
  });

  it("esegue il dispatch polimorfico tramite PromptCacheAdapter.adapt", () => {
    const bundle = buildTwoTierPromptBundle({
      roleId: "lead_engineer",
      roleName: "Lead Engineer",
      level: "L2",
      description: "Lead",
      targetLanguages: ["generic"],
      targetFrameworks: [],
      enableSubagents: true,
      enableWriteTools: true,
    });

    const adaptedAnthropic = PromptCacheAdapter.adapt(bundle, "anthropic");
    expect(adaptedAnthropic.provider).toBe("anthropic");
    expect(adaptedAnthropic.anthropic?.system[0].cache_control).toEqual({ type: "ephemeral" });
    expect(adaptedAnthropic.estimatedCacheHitRate).toBeGreaterThanOrEqual(0.8);

    const adaptedOpenAi = PromptCacheAdapter.adapt(bundle, "openai");
    expect(adaptedOpenAi.provider).toBe("openai");
    expect(adaptedOpenAi.openai?.isPrefixEligible).toBe(true);

    const adaptedGemini = PromptCacheAdapter.adapt(bundle, "gemini");
    expect(adaptedGemini.provider).toBe("gemini");
    expect(adaptedGemini.gemini?.systemInstruction).toBe(UNIVERSAL_TIER1_PREFIX);
  });
});
