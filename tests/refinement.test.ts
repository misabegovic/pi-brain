/**
 * Refinement tests: verify the autonomous refinement protocol throttle.
 */

import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { registerRefinement } from "../extensions/pi-brain/refinement.js";

interface MockApi extends ExtensionAPI {
  handlers: Record<string, (event: any, ctx: ExtensionContext) => Promise<void>>;
  sent: any[];
}

async function createTempBrainHome(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "pi-brain-refinement-test-"));
  await mkdir(join(dir, "wiki", "brain", "ai-suggestions", "refinement"), { recursive: true });
  await mkdir(join(dir, "wiki", "_state"), { recursive: true });
  await writeFile(join(dir, "brain.config.yml"), "org: Test Org\nactive_repos:\n  - test-repo\n", "utf-8");
  await writeFile(join(dir, "wiki", "_state", "autonomy.json"), JSON.stringify({ enabled: true }), "utf-8");
  await writeFile(join(dir, "wiki", "_state", "inbox.md"), "---\nkind: inbox\n---\n\n# Inbox\n", "utf-8");
  return dir;
}

async function addSuggestionFiles(home: string, count: number): Promise<void> {
  for (let i = 0; i < count; i++) {
    await writeFile(
      join(home, "wiki", "brain", "ai-suggestions", "refinement", `suggestion-${i}.md`),
      "---\nkind: ai-suggestion\n---\n\n# suggestion\n",
      "utf-8"
    );
  }
}

function createMockApi(): MockApi {
  const handlers: Record<string, (event: any, ctx: ExtensionContext) => Promise<void>> = {};
  const sent: any[] = [];
  const api = {
    handlers,
    sent,
    on: (event: string, handler: any) => {
      handlers[event] = handler;
    },
    sendMessage: (msg: any, _opts?: any) => {
      sent.push(msg);
    },
  } as unknown as MockApi;
  return api;
}

function createContext(cwd: string): ExtensionContext {
  return {
    cwd,
    isIdle: () => true,
    sessionManager: {
      getSessionFile: () => join(cwd, ".pi", "session.json"),
      getEntries: () => [],
    },
    ui: { notify: () => {} },
  } as unknown as ExtensionContext;
}

async function main() {
  const home = await createTempBrainHome();
  try {
    const api = createMockApi();
    registerRefinement(api, async (cwd: string) => ({ path: cwd }));

    const handler = api.handlers["agent_settled"];
    if (!handler) throw new Error("agent_settled handler not registered");

    // With 5 suggestions, refinement should trigger.
    await addSuggestionFiles(home, 5);
    await handler({}, createContext(home));
    if (api.sent.length !== 1) throw new Error(`Expected 1 trigger with 5 suggestions, got ${api.sent.length}`);
    console.log("✓ refinement triggers with 5 suggestions");

    // With 6 suggestions, refinement should be skipped.
    api.sent.length = 0;
    await addSuggestionFiles(home, 1);
    await handler({}, createContext(home));
    if (api.sent.length !== 0) throw new Error(`Expected 0 triggers with 6 suggestions, got ${api.sent.length}`);
    console.log("✓ refinement is throttled with 6 suggestions");

    console.log("✓ refinement test passed");
  } finally {
    await rm(home, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
