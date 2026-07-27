import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { BrainHome, SessionShutdownConfig } from "./types.ts";
import { appendLog } from "./inbox.ts";

export function registerBrainShutdown(
  pi: ExtensionAPI,
  briefedSessions: Set<string>,
  lastSystemPrompt: { current: string }
) {
  pi.on("session_shutdown", async (_event, ctx) => {
    // No-op placeholder: clear transient in-memory state.
    briefedSessions.clear();
    lastSystemPrompt.current = "";

    // If we had a brain home, log a minimal session-close marker.
    // Real resource cleanup would go here (file handles, timers, etc.).
    const cwd = ctx.cwd;
    if (!cwd) return;
  });
}

export async function logSessionShutdown(home: BrainHome, reason: string) {
  await appendLog(home, `session shutdown: ${reason}`);
}
