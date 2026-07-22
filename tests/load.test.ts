/**
 * Smoke test: load the pi-brain extension with a mock ExtensionAPI
 * and verify it registers the expected tools, commands, and event handlers.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import piBrainExtension from "../extensions/pi-brain";

interface MockTool {
  name: string;
  label: string;
  description: string;
}

interface MockCommand {
  name: string;
  description: string;
}

function createMockApi(): ExtensionAPI & {
  tools: MockTool[];
  commands: MockCommand[];
  handlers: Record<string, number>;
} {
  const tools: MockTool[] = [];
  const commands: MockCommand[] = [];
  const handlers: Record<string, number> = {};

  const api = {
    tools,
    commands,
    handlers,
    registerTool: (tool: any) => {
      tools.push({ name: tool.name, label: tool.label, description: tool.description });
    },
    registerCommand: (name: string, options: any) => {
      commands.push({ name, description: options.description });
    },
    on: (event: string, _handler: any) => {
      handlers[event] = (handlers[event] ?? 0) + 1;
    },
  } as any;

  return api;
}

async function main() {
  const api = createMockApi();
  piBrainExtension(api);

  const expectedTools = [
    "brain_status",
    "brain_capture",
    "brain_ask",
    "brain_tend",
    "brain_validate",
    "brain_views",
    "brain_sync",
    "brain_pull_connectors",
    "brain_autonomy",
    "brain_links",
    "brain_state",
    "brain_deepdive",
    "brain_ingest_repo",
    "brain_projects",
    "brain_convert",
    "brain_ingest",
  ];
  const expectedCommands = ["brain", "brain:capture", "brain:ask", "brain:tend", "brain:sync", "brain:shape", "brain:in", "brain:setup", "brain:connect", "brain:auto", "brain:continue", "brain:investigate", "brain:links", "brain:groom", "brain:state", "brain:deepdive", "brain:ingest-repo", "brain:projects", "brain:convert"];

  const missingTools = expectedTools.filter((n) => !api.tools.some((t) => t.name === n));
  const missingCommands = expectedCommands.filter((n) => !api.commands.some((c) => c.name === n));

  if (missingTools.length > 0) {
    throw new Error(`Missing tools: ${missingTools.join(", ")}`);
  }
  if (missingCommands.length > 0) {
    throw new Error(`Missing commands: ${missingCommands.join(", ")}`);
  }
  if (!api.handlers["session_start"] || !api.handlers["session_tree"]) {
    throw new Error("Missing session_start or session_tree handler");
  }

  console.log("✓ pi-brain extension loaded cleanly");
  console.log(`  Tools: ${api.tools.map((t) => t.name).join(", ")}`);
  console.log(`  Commands: ${api.commands.map((c) => c.name).join(", ")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
