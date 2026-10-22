/**
 * Lifecycle hook tests: since pi 1.2.0 before_agent_start also fires for
 * runs started by pi.sendMessage with triggerTurn (the refinement run), so
 * the brain's handler must act only on user prompts.
 */

import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { registerLifecycleHooks } from "../extensions/pi-brain/hooks/lifecycle.js";
import { recordIntentTarget } from "../extensions/pi-brain/intent-first.js";

type Handler = (event: any, ctx: ExtensionContext) => Promise<any>;

async function createTempBrainHome(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "pi-brain-lifecycle-test-"));
  await mkdir(join(dir, "wiki", "_state"), { recursive: true });
  await writeFile(join(dir, "brain.config.yml"), "org: Test Org\n", "utf-8");
  await writeFile(join(dir, "wiki", "_state", "autonomy.json"), JSON.stringify({ enabled: true }), "utf-8");
  await writeFile(join(dir, "wiki", "_state", "inbox.md"), "---\nkind: inbox\n---\n\n# Inbox\n", "utf-8");
  return dir;
}

function createContext(cwd: string): ExtensionContext {
  return {
    cwd,
    isIdle: () => true,
    sessionManager: { getSessionFile: () => join(cwd, ".pi", "session.json"), getEntries: () => [] },
    ui: { notify: () => {} },
  } as unknown as ExtensionContext;
}

async function main() {
  const home = await createTempBrainHome();
  try {
    const handlers: Record<string, Handler> = {};
    const api = { on: (event: string, handler: Handler) => { handlers[event] = handler; } } as unknown as ExtensionAPI;
    const briefed = new Set<string>();
    registerLifecycleHooks(api, { current: "" }, briefed, { always: [], home: [], bootstrap: [] });

    const handler = handlers["before_agent_start"];
    if (!handler) throw new Error("before_agent_start handler not registered");
    const ctx = createContext(home);
    const sessionFile = join(home, ".pi", "session.json");

    recordIntentTarget(sessionFile, { kind: "code", repoName: "warehouse-app", relPath: "app/models/shift.rb" } as any);

    const custom = await handler(
      {
        type: "before_agent_start",
        messageType: "custom",
        systemPrompt: "base",
        systemPromptOptions: {},
        message: { customType: "brain-refinement-trigger", content: "Run the autonomous refinement protocol.", display: false },
      },
      ctx,
    );
    if (custom && (custom.systemPrompt !== undefined || custom.message !== undefined)) {
      throw new Error(`custom-message run was modified: ${JSON.stringify(custom)}`);
    }
    if (briefed.has(sessionFile)) throw new Error("custom-message run consumed the session briefing");
    console.log("✓ a triggerTurn custom run is left untouched");

    const user = await handler(
      { type: "before_agent_start", messageType: "user", prompt: "hello", systemPrompt: "base", systemPromptOptions: {} },
      ctx,
    );
    if (!user.systemPrompt.includes("intent debt")) throw new Error("user prompt did not receive the intent debt left by the custom run");
    if (!user.systemPrompt.includes("autonomy") && user.systemPrompt === "base") throw new Error("user prompt got no brain context");
    if (!briefed.has(sessionFile)) throw new Error("user prompt did not receive the session briefing");
    console.log("✓ the next user prompt still receives the one-shot intent debt and briefing");

    console.log("✓ lifecycle hooks test passed");
  } finally {
    await rm(home, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
