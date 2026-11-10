import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createMcpServer, MCP_OS_TOOLS } from "../src/mcp/server.js";
import { McpClientBridge } from "../src/mcp/client.js";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

describe("Model Context Protocol (MCP) Server & Client Bridge (TCK-4.3)", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-test-"));
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Cleanup best effort
    }
  });

  describe("MCP Server Tools Catalog", () => {
    it("espone i tre strumenti deterministici fondamentali dell'OS", () => {
      const toolNames = MCP_OS_TOOLS.map((t) => t.name);
      expect(toolNames).toContain("inspect_stack");
      expect(toolNames).toContain("run_gatekeeper");
      expect(toolNames).toContain("run_doctor");

      for (const tool of MCP_OS_TOOLS) {
        expect(tool.name.length).toBeGreaterThan(2);
        expect(tool.description.length).toBeGreaterThan(10);
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe("object");
      }
    });
  });

  describe("MCP Server & Client Bridge Interoperability", () => {
    it("connette Server e Client Bridge via InMemoryTransport ed esegue Lazy Tool Discovery", async () => {
      const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

      const server = createMcpServer();
      await server.connect(serverTransport);

      const clientBridge = new McpClientBridge(
        { serverName: "test-server" },
        clientTransport
      );

      await clientBridge.connect();
      expect(clientBridge.isConnected()).toBe(true);

      // Lazy Tool Discovery: restituisce solo metadati leggeri (Context as RAM)
      const lazyTools = await clientBridge.discoverToolsLazy();
      expect(lazyTools.length).toBeGreaterThanOrEqual(3);

      const inspectToolMeta = lazyTools.find((t) => t.name === "inspect_stack");
      expect(inspectToolMeta).toBeDefined();
      expect(inspectToolMeta!.name).toBe("inspect_stack");
      expect(inspectToolMeta!.description).toContain("tech stack");
      // Nessuno schema pesante nella lista leggera
      expect((inspectToolMeta as any).inputSchema).toBeUndefined();

      // JIT Schema Retrieval: lo schema completo è conservato nel registry in RAM
      const fullDefinition = clientBridge.getToolDefinition("inspect_stack");
      expect(fullDefinition).toBeDefined();
      expect(fullDefinition!.inputSchema.properties).toHaveProperty("targetPath");

      await clientBridge.disconnect();
      await server.close();
      expect(clientBridge.isConnected()).toBe(false);
    });

    it("esegue inspect_stack via MCP Client Bridge ricevendo lo stack formattato", async () => {
      // Crea un mini-progetto Rust in tempDir
      await fs.writeFile(path.join(tempDir, "Cargo.toml"), `[package]\nname = "test_pkg"\nversion = "0.1.0"\n`);
      await fs.mkdir(path.join(tempDir, "src"), { recursive: true });
      await fs.writeFile(path.join(tempDir, "src/main.rs"), "fn main() {}\n");

      const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
      const server = createMcpServer();
      await server.connect(serverTransport);

      const clientBridge = new McpClientBridge(
        { serverName: "test-server" },
        clientTransport
      );
      await clientBridge.connect();

      // Invoca il tool inspect_stack attraverso il bridge
      const response = await clientBridge.callTool({
        name: "inspect_stack",
        arguments: { targetPath: tempDir },
      });

      expect(response.isError).toBe(false);
      expect(response.content.length).toBeGreaterThan(0);

      const jsonText = response.content[0].text;
      const parsedStack = JSON.parse(jsonText);
      expect(parsedStack.languages).toContain("rust");
      expect(parsedStack.packageManagers).toContain("cargo");

      await clientBridge.disconnect();
      await server.close();
    });

    it("esegue run_doctor via MCP Client Bridge ricevendo la diagnostica di sistema", async () => {
      const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
      const server = createMcpServer();
      await server.connect(serverTransport);

      const clientBridge = new McpClientBridge(
        { serverName: "test-server" },
        clientTransport
      );
      await clientBridge.connect();

      const response = await clientBridge.callTool({
        name: "run_doctor",
        arguments: {},
      });

      expect(response.isError).toBe(false);
      const report = JSON.parse(response.content[0].text);
      expect(report.os).toBeDefined();
      expect(report.toolchain).toBeDefined();
      expect(report.toolchain).toHaveProperty("git");

      await clientBridge.disconnect();
      await server.close();
    });

    it("gestisce appropriatamente chiamate a tool inesistenti restituendo isError", async () => {
      const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
      const server = createMcpServer();
      await server.connect(serverTransport);

      const clientBridge = new McpClientBridge(
        { serverName: "test-server" },
        clientTransport
      );
      await clientBridge.connect();

      const response = await clientBridge.callTool({
        name: "non_existent_tool",
        arguments: {},
      });

      expect(response.isError).toBe(true);
      expect(response.content[0].text).toContain("unregistered");

      await clientBridge.disconnect();
      await server.close();
    });
  });
});
