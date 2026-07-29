/**
 * Integration test: run the pi-brain extension tools against a temporary
 * pi-brain home on disk.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import piBrainExtension from "../extensions/pi-brain.js";
import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

interface MockTool {
  name: string;
  execute: (...args: any[]) => Promise<any>;
}

interface MockApi extends ExtensionAPI {
  tools: MockTool[];
  activeToolCalls: string[][];
  handlers: Record<string, any>;
}

async function createTempBrainHome(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "pi-brain-test-"));
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
  const tools: MockTool[] = [];
  const activeToolCalls: string[][] = [];
  const handlers: Record<string, any> = {};
  const api = {
    tools,
    activeToolCalls,
    handlers,
    registerTool: (tool: any) => {
      tools.push({ name: tool.name, execute: tool.execute });
    },
    registerCommand: () => {},
    on: (event: string, handler: any) => {
      handlers[event] = handler;
    },
    getActiveTools: () => ["read", "bash", "edit", "write"],
    setActiveTools: (names: string[]) => {
      activeToolCalls.push(names);
    },
  } as any;
  return api;
}

async function main() {
  const home = await createTempBrainHome();
  try {
    const api = createMockApi();
    piBrainExtension(api);

    const ctx = { cwd: home } as any;

    // Capture
    const capture = api.tools.find((t) => t.name === "brain_capture");
    if (!capture) throw new Error("brain_capture tool missing");
    const captureResult = await capture.execute("id", { note: "We decided to use SQLite for the index." }, undefined, () => {}, ctx);
    if (!captureResult.content[0].text.includes("Captured to inbox")) {
      throw new Error(`Unexpected capture result: ${captureResult.content[0].text}`);
    }

    // Status
    const status = api.tools.find((t) => t.name === "brain_status");
    if (!status) throw new Error("brain_status tool missing");
    const statusResult = await status.execute("id", {}, undefined, () => {}, ctx);
    const statusText = statusResult.content[0].text;
    if (!statusText.includes("Test Org") || !statusText.includes("Inbox items: 1")) {
      throw new Error(`Unexpected status result: ${statusText}`);
    }

    // Views
    const views = api.tools.find((t) => t.name === "brain_views");
    if (!views) throw new Error("brain_views tool missing");
    const viewsResult = await views.execute("id", {}, undefined, () => {}, ctx);
    if (!viewsResult.content[0].text.includes("Regenerated wiki/index.md")) {
      throw new Error(`Unexpected views result: ${viewsResult.content[0].text}`);
    }

    // Ask
    const ask = api.tools.find((t) => t.name === "brain_ask");
    if (!ask) throw new Error("brain_ask tool missing");
    const askResult = await ask.execute("id", { question: "SQLite index" }, undefined, () => {}, ctx);
    if (!askResult.content[0].text.includes("inbox.md")) {
      throw new Error(`Unexpected ask result: ${askResult.content[0].text}`);
    }

    // Validate
    const validate = api.tools.find((t) => t.name === "brain_validate");
    if (!validate) throw new Error("brain_validate tool missing");
    const validateResult = await validate.execute("id", {}, undefined, () => {}, ctx);
    if (!validateResult.content[0].text.includes("All wiki pages pass")) {
      throw new Error(`Unexpected validate result: ${validateResult.content[0].text}`);
    }

    // Ingest a file
    const ingest = api.tools.find((t) => t.name === "brain_ingest");
    if (!ingest) throw new Error("brain_ingest tool missing");
    const sampleFile = join(home, "sources", "sample-doc.txt");
    await writeFile(sampleFile, "This is a sample document for ingestion.", "utf-8");
    const ingestResult = await ingest.execute(
      "id",
      { source: sampleFile, kind: "doc", summary: "Sample doc" },
      undefined,
      () => {},
      ctx
    );
    if (!ingestResult.content[0].text.includes("Ingested to sources/doc/")) {
      throw new Error(`Unexpected ingest result: ${ingestResult.content[0].text}`);
    }

    // Phase 2: tool tiers — fire session_start and verify brain-home tool set
    const tmpApi = createMockApi();
    piBrainExtension(tmpApi);
    const sessionStartHandler = tmpApi.handlers["session_start"];
    if (!sessionStartHandler) throw new Error("session_start handler missing");
    const mockCtx = {
      cwd: home,
      ui: { setWidget: () => {}, setStatus: () => {}, theme: { fg: (_: string, text: string) => text } },
    };
    await sessionStartHandler({}, mockCtx);
    if (tmpApi.activeToolCalls.length === 0) {
      throw new Error("setActiveTools was never called during session_start");
    }
    const activeNames = tmpApi.activeToolCalls[tmpApi.activeToolCalls.length - 1];
    if (!activeNames.includes("brain_ask") || !activeNames.includes("brain_capture")) {
      throw new Error(`Unexpected active tools: ${activeNames.join(", ")}`);
    }
    if (!activeNames.includes("read") || !activeNames.includes("bash") || !activeNames.includes("edit") || !activeNames.includes("write")) {
      throw new Error(`Built-in tools were dropped from active set: ${activeNames.join(", ")}`);
    }
    if (activeNames.includes("brain_convert") || activeNames.includes("brain_ingest_repo")) {
      throw new Error(`Bootstrap tools should not be active inside a brain home: ${activeNames.join(", ")}`);
    }

    console.log("✓ integration test passed");
  } finally {
    await rm(home, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
