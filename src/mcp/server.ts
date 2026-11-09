import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { detectProjectStack } from "../inspector/detector.js";
import { runGatekeeper } from "../gatekeeper/runner.js";
import { proveAstInvariants } from "../gatekeeper/formal-prover.js";
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
      "Ispeziona lo stack tecnologico di un progetto (linguaggi, framework, package manager, comandi di test raccomandati ed entry point).",
    inputSchema: {
      type: "object",
      properties: {
        targetPath: {
          type: "string",
          description: "Percorso assoluto o relativo del workspace da ispezionare",
        },
      },
      required: ["targetPath"],
    },
  },
  {
    name: "run_gatekeeper",
    description:
      "Esegue il Deterministic Gatekeeper verificando compilazione, linter e test con output strutturato.",
    inputSchema: {
      type: "object",
      properties: {
        targetPath: {
          type: "string",
          description: "Percorso del workspace su cui eseguire i controlli",
        },
        testCommands: {
          type: "array",
          items: { type: "string" },
          description: "Lista di comandi di test da eseguire. Se vuota, usa i comandi configurati",
        },
      },
      required: ["targetPath"],
    },
  },
  {
    name: "run_doctor",
    description:
      "Esegue la diagnostica di salute dell'ambiente locale e della toolchain di sviluppo (git, node, python, swift, docker, go, rust).",
    inputSchema: {
      type: "object",
      properties: {
        targetPath: {
          type: "string",
          description: "Percorso opzionale del workspace da diagnosticare",
        },
      },
    },
  },
  {
    name: "prove_ast_invariants",
    description:
      "Esegue il Neuro-Symbolic Formal AST Prover (Hoare Logic {P} C {Q}) su un file o frammento di codice, restituendo una prova formale o un controesempio eseguibile.",
    inputSchema: {
      type: "object",
      properties: {
        targetFilePath: {
          type: "string",
          description: "Percorso del file target sottoposto a verifica formale",
        },
        sourceCode: {
          type: "string",
          description: "Codice sorgente da analizzare simbolicamente",
        },
        targetSymbol: {
          type: "string",
          description: "Simbolo opzionale (funzione/metodo) da verificare",
        },
        invariants: {
          type: "array",
          items: { type: "string" },
          description: "Lista di invarianti formali da verificare",
        },
      },
      required: ["targetFilePath", "sourceCode"],
    },
  },
  {
    name: "dispatch_quad_tier_inference",
    description:
      "Instrada un task nello sciame gerarchico Quad-Tier (Tier 0 Kahneman Gate -> Tier 1 Local SLM Qwen3/Gemma3/Phi-4 -> Tier 2 Cloud SOTA -> Tier 3 Deep Reasoning) con verifica speculativa formale.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "Prompt o codice da elaborare",
        },
        domain: {
          type: "string",
          description:
            "Dominio specializzato (AST_REFACTOR, DOCSTRING_GEN, SYNTHETIC_FIXTURES, CAVEMAN_ENCODING, FAST_TRIAGE)",
        },
        complexityScore: {
          type: "number",
          description: "Stima complessità (0.0 - 1.0)",
        },
      },
      required: ["prompt"],
    },
  },
  {
    name: "run_chaos_experiment",
    description:
      "Esegue un esperimento di Chaos Engineering in un'arena effimera isolata (zero impatto sul repo) e restituisce il certificato ChaosFaultInjection con Resilience Score (0-100).",
    inputSchema: {
      type: "object",
      properties: {
        faultType: {
          type: "string",
          description:
            "Tipo di guasto sintetico (AST_MUTATION_OFF_BY_ONE, ADVERSARIAL_PROMPT_INJECTION, DISK_WAL_PARTIAL_CORRUPT, RACE_CONDITION_ASYNC_QUEUE, NETWORK_LATENCY_SPIKE, CIRCULAR_DEPENDENCY_DEADLOCK)",
        },
      },
      required: ["faultType"],
    },
  },
  {
    name: "execute_voice_command",
    description:
      "Interpreta un comando vocale/testuale esecutivo in italiano del CEO (Executive Voice Director), esegue l'azione corrispondente e sintetizza il briefing parlato.",
    inputSchema: {
      type: "object",
      properties: {
        transcript: {
          type: "string",
          description: "Trascrizione del comando vocale in italiano (es. 'attiva checkpoint spike', 'qual è lo stato')",
        },
        targetPath: {
          type: "string",
          description: "Percorso del workspace target",
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

      if (name === "prove_ast_invariants") {
        const targetFilePath = (args?.targetFilePath as string) || "unknown.ts";
        const sourceCode = (args?.sourceCode as string) || "";
        const targetSymbol = args?.targetSymbol as string | undefined;
        const invariants = Array.isArray(args?.invariants)
          ? (args.invariants as string[])
          : undefined;
        const proof = proveAstInvariants({
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

      throw new Error(`Tool sconosciuto o non registrato: '${name}'`);
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
