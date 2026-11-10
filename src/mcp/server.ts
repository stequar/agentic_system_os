import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { detectProjectStack } from "../inspector/detector.js";
import { runGatekeeper } from "../gatekeeper/runner.js";
import { scanCodeHeuristics } from "../gatekeeper/formal-prover.js";
import { dispatchQuadTierInference } from "../distillation/quad-tier-dispatcher.js";
import { runChaosExperiment, type ChaosFaultType } from "../security/chaos-engine.js";
import { executeExecutiveVoiceCommand } from "../studio/voice-director.js";
import { runEnvironmentDoctor } from "../doctor/health.js";
import { ToolScoper } from "../core/tool-scoper.js";
import type { DynamicMcpRegistry } from "./dynamic-registry.js";

/**
 * Funzione di logging di sicurezza: invia TUTTO l'output diagnostico
 * tassativamente su stderr. process.stdout è riservato esclusivamente
 * allo stream JSON-RPC del protocollo MCP stdio.
 */
function logStderr(...args: unknown[]): void {
  console.error("[AgenticOS MCP Server]", ...args);
}

/**
 * Strumenti deterministici esposti dall'OS attraverso il protocollo MCP.
 */
export const MCP_OS_TOOLS = [
  {
    name: "inspect_stack",
    description:
      "Inspect a project's tech stack (languages, frameworks, package managers, recommended test commands, and entry point).",
    inputSchema: {
      type: "object",
      properties: {
        targetPath: {
          type: "string",
          description: "Absolute or relative path of the workspace to inspect",
        },
      },
      required: ["targetPath"],
    },
  },
  {
    name: "run_gatekeeper",
    description:
      "Run the Deterministic Gatekeeper, verifying compilation, linter, and tests with structured output.",
    inputSchema: {
      type: "object",
      properties: {
        targetPath: {
          type: "string",
          description: "Path of the workspace to run the checks on",
        },
        testCommands: {
          type: "array",
          items: { type: "string" },
          description: "List of test commands to run. If empty, uses the configured commands",
        },
      },
      required: ["targetPath"],
    },
  },
  {
    name: "run_doctor",
    description:
      "Run health diagnostics on the local environment and dev toolchain (git, node, python, swift, docker, go, rust).",
    inputSchema: {
      type: "object",
      properties: {
        targetPath: {
          type: "string",
          description: "Optional path of the workspace to diagnose",
        },
      },
    },
  },
  {
    name: "scan_code_heuristics",
    description:
      "Run a regex-based heuristic scan — NOT a formal proof or SMT/SAT solver — over a file or code fragment, flagging known risk patterns (division by zero, null-deref, out-of-bounds, Hoare annotations) and generating a best-effort executable counterexample.",
    inputSchema: {
      type: "object",
      properties: {
        targetFilePath: {
          type: "string",
          description: "Path of the target file submitted to the heuristic scan",
        },
        sourceCode: {
          type: "string",
          description: "Source code to analyze heuristically",
        },
        targetSymbol: {
          type: "string",
          description: "Optional symbol (function/method) to analyze",
        },
        invariants: {
          type: "array",
          items: { type: "string" },
          description: "List of risk patterns/invariants to check",
        },
      },
      required: ["targetFilePath", "sourceCode"],
    },
  },
  {
    name: "dispatch_quad_tier_inference",
    description:
      "Route a task through the hierarchical Quad-Tier swarm (Tier 0 Kahneman Gate -> Tier 1 Local SLM Qwen3/Gemma3/Phi-4 -> Tier 2 Cloud SOTA -> Tier 3 Deep Reasoning) with speculative verification.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "Prompt or code to process",
        },
        domain: {
          type: "string",
          description:
            "Specialized domain (AST_REFACTOR, DOCSTRING_GEN, SYNTHETIC_FIXTURES, CAVEMAN_ENCODING, FAST_TRIAGE)",
        },
        complexityScore: {
          type: "number",
          description: "Complexity estimate (0.0 - 1.0)",
        },
      },
      required: ["prompt"],
    },
  },
  {
    name: "run_chaos_experiment",
    description:
      "Run a Chaos Engineering experiment in an isolated ephemeral arena (zero impact on the repo) and return the ChaosFaultInjection certificate with a Resilience Score (0-100).",
    inputSchema: {
      type: "object",
      properties: {
        faultType: {
          type: "string",
          description:
            "Synthetic fault type (AST_MUTATION_OFF_BY_ONE, ADVERSARIAL_PROMPT_INJECTION, DISK_WAL_PARTIAL_CORRUPT, RACE_CONDITION_ASYNC_QUEUE, NETWORK_LATENCY_SPIKE, CIRCULAR_DEPENDENCY_DEADLOCK)",
        },
      },
      required: ["faultType"],
    },
  },
  {
    name: "execute_voice_command",
    description:
      "Interpret an executive voice/text command from the CEO (Executive Voice Director), run the corresponding action, and synthesize the spoken briefing.",
    inputSchema: {
      type: "object",
      properties: {
        transcript: {
          type: "string",
          description: "Voice-command transcript (e.g. 'enable spike checkpoint', 'what is the status')",
        },
        targetPath: {
          type: "string",
          description: "Target workspace path",
        },
      },
      required: ["transcript"],
    },
  },
];

/**
 * Diagnostica sicura dell'ambiente toolchain tramite `runEnvironmentDoctor` (execFile, zero shell injection).
 */
async function diagnoseEnvironment(targetPath: string = process.cwd()): Promise<Record<string, unknown>> {
  const doctorReport = await runEnvironmentDoctor(targetPath, { timeoutMs: 2500 });
  const toolchain: Record<string, { status: string; output?: string; error?: string }> = {};

  for (const check of doctorReport.checks) {
    const key = check.checkName === "swiftc" ? "swift" : check.checkName;
    toolchain[key] = {
      status: check.status === "ok" ? "available" : "missing_or_failed",
      output: check.version || check.message,
    };
  }

  toolchain.node = {
    status: "available",
    output: process.version,
  };

  return {
    os: process.platform,
    arch: process.arch,
    timestamp: doctorReport.checkedAt,
    overallStatus: doctorReport.overallStatus,
    toolchain,
    doctorReport,
  };
}

/**
 * Istanzia e configura il Server MCP di Agentic Company OS.
 */
export function createMcpServer(options?: { dynamicRegistry?: DynamicMcpRegistry; fsmState?: string }): Server {
  const server = new Server(
    {
      name: "agentic-company-os",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  const scoper = new ToolScoper();

  // 1. Registrazione catalogo tool (ListTools) + ToolScoper & DynamicMcpRegistry
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    logStderr("Elenco tool richiesto da host MCP");
    const dynamicTools = options?.dynamicRegistry
      ? options.dynamicRegistry
          .discoverLazyMetadata()
          .map((meta) => options.dynamicRegistry?.getToolDefinition(meta.name))
          .filter((def): def is NonNullable<typeof def> => Boolean(def))
      : [];
    return {
      tools: [...MCP_OS_TOOLS, ...dynamicTools],
    };
  });

  // 2. Esecuzione tool deterministici (CallTool)
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    logStderr(`Invocazione tool MCP: '${name}' con parametri:`, args);

    try {
      if (name === "inspect_stack") {
        const targetPath = (args?.targetPath as string) || process.cwd();
        const stack = await detectProjectStack(targetPath);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(stack, null, 2),
            },
          ],
        };
      }

      if (name === "run_gatekeeper") {
        const targetPath = (args?.targetPath as string) || process.cwd();
        const testCommands = Array.isArray(args?.testCommands) ? (args.testCommands as string[]) : [];
        const result = await runGatekeeper(targetPath, testCommands);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      if (name === "run_doctor") {
        const targetPath = (args?.targetPath as string) || process.cwd();
        const report = await diagnoseEnvironment(targetPath);
        const scoped = scoper.scopeTools(options?.fsmState || "STANDUP", "L1");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ ...report, activeScopedToolsCount: scoped.activeToolsCount }, null, 2),
            },
          ],
        };
      }

      if (name === "scan_code_heuristics") {
        const targetFilePath = (args?.targetFilePath as string) || "unknown.ts";
        const sourceCode = (args?.sourceCode as string) || "";
        const targetSymbol = args?.targetSymbol as string | undefined;
        const invariants = Array.isArray(args?.invariants)
          ? (args.invariants as string[])
          : undefined;
        const proof = scanCodeHeuristics({
          targetFilePath,
          sourceCode,
          targetSymbol,
          invariants,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(proof, null, 2),
            },
          ],
        };
      }

      if (name === "dispatch_quad_tier_inference") {
        const prompt = (args?.prompt as string) || "";
        const domain = args?.domain as any;
        const complexityScore =
          typeof args?.complexityScore === "number"
            ? args.complexityScore
            : undefined;
        const dispatchResult = await dispatchQuadTierInference({
          prompt,
          domain,
          complexityScore,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(dispatchResult, null, 2),
            },
          ],
        };
      }

      if (name === "run_chaos_experiment") {
        const faultType = ((args?.faultType as string) ||
          "ADVERSARIAL_PROMPT_INJECTION") as ChaosFaultType;
        const chaosResult = await runChaosExperiment({ faultType });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(chaosResult, null, 2),
            },
          ],
        };
      }

      if (name === "execute_voice_command") {
        const transcript = (args?.transcript as string) || "stato piattaforma";
        const targetPath = (args?.targetPath as string) || process.cwd();
        const voiceResult = await executeExecutiveVoiceCommand({
          targetPath,
          transcript,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(voiceResult, null, 2),
            },
          ],
        };
      }

      if (options?.dynamicRegistry) {
        const activeDyn = options.dynamicRegistry.getToolDefinition(name);
        if (activeDyn) {
          const dynResult = await options.dynamicRegistry.invokeTool(
            name,
            (args as Record<string, unknown>) || {}
          );
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(dynResult, null, 2),
              },
            ],
            isError: !dynResult.success,
          };
        }
      }

      throw new Error(`Unknown or unregistered tool: '${name}'`);
    } catch (err: any) {
      logStderr(`Errore durante l'esecuzione del tool '${name}':`, err.message);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ error: err.message || String(err) }),
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

/**
 * Avvia il server MCP collegandolo al trasporto fornito (default: StdioServerTransport).
 * Garantisce che nessun output sporchi process.stdout al di fuori di JSON-RPC.
 */
export async function startMcpServer(customTransport?: Transport): Promise<{
  server: Server;
  transport: Transport;
}> {
  const server = createMcpServer();
  const transport = customTransport ?? new StdioServerTransport();

  await server.connect(transport);
  logStderr("Server MCP avviato con successo su stdio.");

  return { server, transport };
}
