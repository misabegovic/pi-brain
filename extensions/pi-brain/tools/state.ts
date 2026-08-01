import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { join } from "node:path";
import { runBrainScript, pathExists } from "../utils.ts";
import { resolveResource } from "../resources.ts";
import { requireBrain, setupHint } from "../context.ts";

function notFound() {
  return { content: [{ type: "text" as const, text: setupHint() }], details: {} };
}

export function registerStateTools(pi: ExtensionAPI) {
  pi.registerTool({
    name: "brain_state",
    label: "Brain state",
    description: "Regenerate state, roadmap, and options pages from the corpus.",
    parameters: Type.Object({
      scope: Type.Optional(Type.String({ description: "Scope to regenerate (default: org)." })),
    }),
    constrainedSampling: { type: "json_schema" as const, strict: "prefer" as const },
    async execute(_toolCallId: string, params: any, _signal: AbortSignal | undefined, _onUpdate: unknown, ctx: ExtensionContext) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return notFound();

      const script = await resolveResource(join("tools", "brain-state.mjs"), home);
      if (!(await pathExists(script))) {
        return { content: [{ type: "text" as const, text: "State runner not found at tools/brain-state.mjs" }], details: {} };
      }

      const args = params.scope ? [params.scope] : [];
      const result = await runBrainScript(script, args, home);
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
      return {
        content: [{ type: "text" as const, text: output || "State pages regenerated." }],
        details: {},
      };
    },
  });

  pi.registerTool({
    name: "brain_links",
    label: "Brain links",
    description: "Derive the pi-brain link graph: orphans, hubs, dead links, and suggestions.",
    parameters: Type.Object({}),
    constrainedSampling: { type: "json_schema" as const, strict: "prefer" as const },
    async execute(_toolCallId: string, _params: any, _signal: AbortSignal | undefined, _onUpdate: unknown, ctx: ExtensionContext) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return notFound();

      const script = await resolveResource(join("tools", "brain-links.mjs"), home);
      if (!(await pathExists(script))) {
        return { content: [{ type: "text" as const, text: "Link graph runner not found at tools/brain-links.mjs" }], details: {} };
      }

      const result = await runBrainScript(script, [], home);
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
      return {
        content: [{ type: "text" as const, text: output || "Link graph finished with no output." }],
        details: {},
      };
    },
  });
}
