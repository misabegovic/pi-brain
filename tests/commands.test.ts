/**
 * Command tests: exercise non-agent /brain:* commands against a temporary brain home.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import piBrainExtension from "../extensions/pi-brain.js";
import { mkdtemp, writeFile, mkdir, rm, readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

interface MockApi extends ExtensionAPI {
  tools: any[];
  commands: Record<string, (args: string, ctx: any) => Promise<void>>;
  handlers: Record<string, any>;
  activeToolCalls: string[][];
}

async function createTempBrainHome(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "pi-brain-test-"));
  await mkdir(join(dir, "wiki", "brain", "prds"), { recursive: true });
  await mkdir(join(dir, "wiki", "_state"), { recursive: true });
  await mkdir(join(dir, "sources"), { recursive: true });
  await mkdir(join(dir, "log"), { recursive: true });
  await writeFile(join(dir, "brain.config.yml"), "org: Test Org\nactive_repos:\n  - test-repo\n", "utf-8");
  await writeFile(
    join(dir, "wiki", "index.md"),
    "---\nkind: meta\nstatus: living\nconfidence: high\n---\n\n# Test Home\n",
    "utf-8"
  );
  await writeFile(join(dir, "wiki", "_state", "inbox.md"), "---\nkind: inbox\n---\n\n# Inbox\n", "utf-8");
  await writeFile(join(dir, "sources", "README.md"), "# sources\n", "utf-8");
  await writeFile(join(dir, "log", "log.md"), "# log\n", "utf-8");
  return dir;
}

function createMockApi(): MockApi {
  const tools: any[] = [];
  const commands: Record<string, (args: string, ctx: any) => Promise<void>> = {};
  const handlers: Record<string, any> = {};
  const activeToolCalls: string[][] = [];
  const api = {
    tools,
    commands,
    handlers,
    activeToolCalls,
    registerTool: (tool: any) => {
      tools.push({ name: tool.name, execute: tool.execute });
    },
    registerCommand: (name: string, cmd: any) => {
      commands[name] = cmd.handler;
    },
    on: (event: string, handler: any) => {
      handlers[event] = handler;
    },
    getActiveTools: () => ["read", "bash", "edit", "write"],
    setActiveTools: (names: string[]) => {
      activeToolCalls.push(names);
    },
    sendUserMessage: () => {},
  } as unknown as MockApi;
  return api;
}

async function main() {
  const home = await createTempBrainHome();
  try {
    // Create a PRD with a data_model intent block
    const prdContent = [
      "---",
      "kind: prd",
      "status: accepted",
      "confidence: medium",
      "---",
      "",
      "# PRD — Test types",
      "",
      "## Intent",
      "",
      "```intent:data_model:User",
      "fields:",
      "  - name: id",
      "    type: string",
      "  - name: email",
      "    type: string",
      "```",
      "",
    ].join("\n");
    await writeFile(join(home, "wiki", "brain", "prds", "test-types.md"), prdContent, "utf-8");

    const api = createMockApi();
    piBrainExtension(api);

    const ctx = { cwd: home, ui: { notify: () => {} } };

    // Test /brain:build
    if (!api.commands["brain:build"]) throw new Error("brain:build command missing");
    await api.commands["brain:build"]("brain types", ctx);
    const generatedPath = join(home, "wiki", "brain", "ai-suggestions", "build", "types", "generated.ts");
    const generated = await readFile(generatedPath, "utf-8");
    if (!generated.includes("interface User")) throw new Error("Expected User interface in generated output");
    console.log("✓ brain:build generated TypeScript from intent blocks");

    // Test /brain:diff
    if (!api.commands["brain:diff"]) throw new Error("brain:diff command missing");
    await api.commands["brain:diff"]("brain types", ctx);
    console.log("✓ brain:diff ran without error");

    // Test /brain:sync-code (proposal generation, no --apply)
    if (!api.commands["brain:sync-code"]) throw new Error("brain:sync-code command missing");
    await api.commands["brain:sync-code"]("brain types", ctx);
    const proposalsDir = join(home, "wiki", "brain", "ai-suggestions", "sync-code", "types");
    const proposalFiles = await readdir(proposalsDir);
    if (proposalFiles.length === 0) throw new Error("Expected sync-code proposals");
    console.log("✓ brain:sync-code generated proposals");

    // Test /brain:revise
    if (!api.commands["brain:revise"]) throw new Error("brain:revise command missing");
    let userMessageSent = false;
    (api as any).sendUserMessage = () => { userMessageSent = true; };
    await api.commands["brain:revise"]("brain prds/test-types", ctx);
    if (!userMessageSent) throw new Error("Expected brain:revise to send a user message");
    console.log("✓ brain:revise sent revision prompt");

    // Test /brain:enqueue and /brain:run-tasks
    if (!api.commands["brain:enqueue"]) throw new Error("brain:enqueue command missing");
    await api.commands["brain:enqueue"]("brain sync test-task", ctx);
    if (!api.commands["brain:run-tasks"]) throw new Error("brain:run-tasks command missing");
    await api.commands["brain:run-tasks"]("", ctx);
    console.log("✓ brain:enqueue and brain:run-tasks executed");

    // Test /brain:rfc-contribute
    if (!api.commands["brain:rfc-contribute"]) throw new Error("brain:rfc-contribute command missing");
    await mkdir(join(home, "wiki", "brain", "rfcs"), { recursive: true });
    await writeFile(
      join(home, "wiki", "brain", "rfcs", "test-rfc.md"),
      "---\nkind: rfc\nstatus: draft\nconfidence: low\n---\n\n# RFC — Test\n\n## Contributions\n",
      "utf-8"
    );
    await api.commands["brain:rfc-contribute"]("brain test-rfc human Test contribution", ctx);
    const rfcContent = await readFile(join(home, "wiki", "brain", "rfcs", "test-rfc.md"), "utf-8");
    if (!rfcContent.includes("Test contribution")) throw new Error("Expected RFC contribution");
    console.log("✓ brain:rfc-contribute appended contribution");

    console.log("✓ commands test passed");
  } finally {
    await rm(home, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
