import { describe, it, expect } from "vitest";
import { z } from "zod";
import { ToolScoper, DEFAULT_OS_TOOLS } from "../src/core/tool-scoper.js";
import { ConstrainedDecoder, ConstrainedDecodingError } from "../src/core/constrained-decoder.js";

describe("State-Driven Dynamic Tool Pruner & Schema-Guided Constrained Decoder (TCK-10.3)", () => {
  describe("Dynamic Tool Scoping (ToolScoper)", () => {
    it("garantisce che gli Universal Core Tools siano sempre attivi in qualsiasi stato FSM", () => {
      const scoper = new ToolScoper();

      const states = ["STANDUP", "SPECIFY", "IMPLEMENT", "GATEKEEPER", "CODE_REVIEW"];
      for (const state of states) {
        const result = scoper.scopeTools(state, "L2");
        expect(result.activeTools).toContain("read_wiki_index");
        expect(result.activeTools).toContain("report_status");
        expect(result.activeTools).toContain("query_audit");
      }
    });

    it("esegue il pruning selettivo in base allo stato della Macchina a Stati (FSM)", () => {
      const scoper = new ToolScoper();

      // Fase SPECIFY: tool di specifica attivi, tool di implementazione e merge prunati
      const specifyScope = scoper.scopeTools("SPECIFY", "L2");
      expect(specifyScope.activeTools).toContain("decompose_ticket");
      expect(specifyScope.activeTools).toContain("validate_contract");
      expect(specifyScope.prunedTools).toContain("apply_atomic_patch");
      expect(specifyScope.prunedTools).toContain("quarantine_test");
      expect(specifyScope.prunedTools).toContain("approve_pr");
      expect(specifyScope.tokensSavedEstimate).toBeGreaterThan(1000);

      // Fase IMPLEMENT: tool di codice e test attivi, tool di specifica e review prunati
      const implementScope = scoper.scopeTools("IMPLEMENT", "L2");
      expect(implementScope.activeTools).toContain("read_ast_slice");
      expect(implementScope.activeTools).toContain("apply_atomic_patch");
      expect(implementScope.activeTools).toContain("run_target_test");
      expect(implementScope.prunedTools).toContain("decompose_ticket");
      expect(implementScope.prunedTools).toContain("approve_pr");

      // Fase GATEKEEPER: tool di gatekeeper e quarantena attivi, scrittura codice esclusa
      const gatekeeperScope = scoper.scopeTools("GATEKEEPER", "L2");
      expect(gatekeeperScope.activeTools).toContain("run_gatekeeper");
      expect(gatekeeperScope.activeTools).toContain("quarantine_test");
      expect(gatekeeperScope.prunedTools).toContain("apply_atomic_patch");

      // Fase CODE_REVIEW: tool di scorecard e approvazione attivi
      const reviewScope = scoper.scopeTools("CODE_REVIEW", "L2");
      expect(reviewScope.activeTools).toContain("generate_scorecard");
      expect(reviewScope.activeTools).toContain("approve_pr");
      expect(reviewScope.prunedTools).toContain("apply_atomic_patch");
    });

    it("applica il principio dei minimi privilegi ai Leaf Developers L3", () => {
      const scoper = new ToolScoper();

      // Un Leaf Dev L3 in fase IMPLEMENT non deve MAI avere accesso a tool di coordinamento o gestione git
      const leafScope = scoper.scopeTools("IMPLEMENT", "L3");
      expect(leafScope.activeTools).toContain("read_ast_slice");
      expect(leafScope.activeTools).toContain("apply_atomic_patch");
      expect(leafScope.activeTools).toContain("run_target_test");

      // Tool L1/L2 severamente prunati per L3
      expect(leafScope.prunedTools).toContain("decompose_ticket");
      expect(leafScope.prunedTools).toContain("query_audit");
      expect(leafScope.prunedTools).toContain("quarantine_test");
      expect(leafScope.prunedTools).toContain("approve_pr");
    });

    it("consente la registrazione dinamica di nuovi tool preservando il corretto scoping", () => {
      const scoper = new ToolScoper();
      scoper.registerTool({
        name: "custom_profiler",
        description: "Strumento di profiling CPU e allocazione RAM",
        inputSchema: { type: "object", properties: { target: { type: "string" } } },
        isCoreUniversal: false,
        allowedStates: ["GATEKEEPER"],
        allowedLevels: ["L2"],
        estimatedSchemaTokens: 300,
      });

      const gatekeeperResult = scoper.scopeTools("GATEKEEPER", "L2");
      expect(gatekeeperResult.activeTools).toContain("custom_profiler");

      const implementResult = scoper.scopeTools("IMPLEMENT", "L2");
      expect(implementResult.prunedTools).toContain("custom_profiler");
    });
  });

  describe("Schema-Guided Constrained Decoder (ConstrainedDecoder)", () => {
    const TestPayloadSchema = z.object({
      ticketId: z.string(),
      status: z.enum(["IN_PROGRESS", "COMPLETED", "FAILED"]),
      confidence: z.number().min(0).max(1),
      notes: z.string().optional(),
      tags: z.array(z.string()).default([]),
    });

    it("genera uno Strict JSON Schema conforme a standard API (additionalProperties: false)", () => {
      const strictSchema = ConstrainedDecoder.toStrictJsonSchema(TestPayloadSchema);

      expect(strictSchema.type).toBe("object");
      expect(strictSchema.additionalProperties).toBe(false);
      expect(strictSchema.required).toContain("ticketId");
      expect(strictSchema.required).toContain("status");
      expect(strictSchema.required).toContain("confidence");
      expect(strictSchema.required).not.toContain("notes"); // opzionale
      expect(strictSchema.properties.status.enum).toEqual(["IN_PROGRESS", "COMPLETED", "FAILED"]);
    });

    it("decodifica correttamente JSON puro privo di inquinamento", () => {
      const validJson = JSON.stringify({
        ticketId: "TCK-10.3",
        status: "COMPLETED",
        confidence: 0.99,
        tags: ["decoding", "strict"],
      });

      const decoded = ConstrainedDecoder.decode(validJson, TestPayloadSchema);
      expect(decoded.ticketId).toBe("TCK-10.3");
      expect(decoded.status).toBe("COMPLETED");
      expect(decoded.confidence).toBe(0.99);
      expect(decoded.tags).toEqual(["decoding", "strict"]);
    });

    it("rimuove e ripara markdown code fences ```json e preamboli conversazionali", () => {
      const fencedOutput = `
      Certamente! Ecco la risposta strutturata richiesta per il ticket:
      \`\`\`json
      {
        "ticketId": "TCK-10.3",
        "status": "IN_PROGRESS",
        "confidence": 0.85
      }
      \`\`\`
      Fammi sapere se hai bisogno di ulteriori chiarimenti!
      `;

      const decoded = ConstrainedDecoder.decode(fencedOutput, TestPayloadSchema);
      expect(decoded.ticketId).toBe("TCK-10.3");
      expect(decoded.status).toBe("IN_PROGRESS");
      expect(decoded.confidence).toBe(0.85);
    });

    it("lancia ConstrainedDecodingError in caso di violazione dello schema Zod", () => {
      const invalidData = JSON.stringify({
        ticketId: "TCK-10.3",
        status: "INVALID_STATUS", // enum violation
        confidence: 5.0, // max 1 violation
      });

      expect(() => ConstrainedDecoder.decode(invalidData, TestPayloadSchema)).toThrow(
        ConstrainedDecodingError
      );
    });

    it("supporta safeDecode restituendo esito strutturato senza lanciare eccezioni", () => {
      const badInput = "Questo non è assolutamente un JSON valido";

      const result = ConstrainedDecoder.safeDecode(badInput, TestPayloadSchema);
      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.parsingErrors.length).toBeGreaterThan(0);
    });

    it("genera configurazioni API valide per OpenAI e Anthropic", () => {
      const openAiConfig = ConstrainedDecoder.getOpenAiStrictConfig(TestPayloadSchema, "PatchResponse");
      expect(openAiConfig.type).toBe("json_schema");
      expect(openAiConfig.json_schema.strict).toBe(true);
      expect(openAiConfig.json_schema.schema.additionalProperties).toBe(false);

      const anthropicConfig = ConstrainedDecoder.getAnthropicForcedToolConfig("submit_patch", TestPayloadSchema);
      expect(anthropicConfig.tools).toHaveLength(1);
      expect(anthropicConfig.tools[0].name).toBe("submit_patch");
      expect(anthropicConfig.tool_choice).toEqual({ type: "tool", name: "submit_patch" });
    });
  });
});
