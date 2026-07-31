import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerBrainEntryRenderers } from "./entry-renderers.ts";
import { registerBrainShortcuts } from "./shortcuts.ts";
import { registerBrainShutdown } from "./session-shutdown.ts";
import { registerRefinement } from "./refinement.ts";
import { registerLifecycleHooks } from "./hooks/lifecycle.ts";
import { registerContextHooks } from "./hooks/context.ts";
import { registerToolHooks } from "./hooks/tool.ts";
import { requireBrain } from "./context.ts";

export function registerHooks(
  pi: ExtensionAPI,
  lastSystemPrompt: { current: string },
  briefedSessions: Set<string>,
  toolTiers: { always: string[]; home: string[]; bootstrap: string[] }
) {
  registerBrainEntryRenderers(pi);
  registerBrainShortcuts(pi);
  registerBrainShutdown(pi, briefedSessions, lastSystemPrompt);
  registerRefinement(pi, (cwd) => requireBrain(cwd));

  registerLifecycleHooks(pi, lastSystemPrompt, briefedSessions, toolTiers);
  registerContextHooks(pi);
  registerToolHooks(pi);
}
