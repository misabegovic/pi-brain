/**
 * pi-brain extension — self-contained knowledge home
 *
 * The extension entry point. It wires together tools, commands, and hooks
 * defined in sibling modules. Shared utilities, brain-home access, search,
 * views, inbox management, prompts, and state live in ./utils.ts, ./brain-home.ts,
 * ./resources.ts, ./search.ts, ./views.ts, ./inbox.ts, ./prompts.ts, and ./state.ts.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerTools } from "./tools.ts";
import { registerCommands } from "./commands.ts";
import { registerHooks } from "./hooks.ts";

// Phase 0 baseline: capture the last system prompt seen before_agent_start.
const lastSystemPrompt = { current: "" };

// Phase 3: track sessions that have already received the first-run briefing.
const briefedSessions = new Set<string>();

export const ALWAYS_ACTIVE_TOOLS = ["brain_status", "brain_capture"];
export const BRAIN_HOME_TOOLS = [
  "brain_ask",
  "brain_tend",
  "brain_validate",
  "brain_views",
  "brain_sync",
  "brain_update",
  "brain_pull_connectors",
  "brain_autonomy",
  "brain_links",
  "brain_state",
  "brain_deepdive",
  "brain_projects",
  "brain_ingest",
];
export const BOOTSTRAP_TOOLS = ["brain_convert", "brain_ingest_repo"];

export default function piBrainExtension(pi: ExtensionAPI) {
  registerTools(pi);
  registerCommands(pi, lastSystemPrompt);
  registerHooks(pi, lastSystemPrompt, briefedSessions, {
    always: ALWAYS_ACTIVE_TOOLS,
    home: BRAIN_HOME_TOOLS,
    bootstrap: BOOTSTRAP_TOOLS,
  });
}
