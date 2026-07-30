/**
 * Verify every pi-brain tool opts into JSON-schema constrained sampling.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import piBrainExtension from "../extensions/pi-brain.js";

interface CapturedTool {
  name: string;
  constrainedSampling?: unknown;
}

function createMockApi(): ExtensionAPI & { tools: CapturedTool[] } {
  const tools: CapturedTool[] = [];

  const api = {
    tools,
    registerTool: (tool: any) => {
      tools.push({ name: tool.name, constrainedSampling: tool.constrainedSampling });
    },
    registerCommand: () => {},
    on: () => {},
    setActiveTools: () => {},
  } as any;

  return api;
}

async function main() {
  const api = createMockApi();
  piBrainExtension(api);

  const expected = { type: "json_schema", strict: "prefer" };
  const failures: string[] = [];

  for (const tool of api.tools) {
    if (!tool.constrainedSampling) {
      failures.push(`${tool.name}: missing constrainedSampling`);
      continue;
    }
    const cs = tool.constrainedSampling as any;
    if (cs.type !== expected.type || cs.strict !== expected.strict) {
      failures.push(`${tool.name}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(cs)}`);
    }
  }

  if (api.tools.length === 0) {
    failures.push("No tools were registered");
  }

  if (failures.length > 0) {
    console.error("Constrained sampling check failed:");
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }

  console.log(`✓ All ${api.tools.length} pi-brain tools declare constrained sampling`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
