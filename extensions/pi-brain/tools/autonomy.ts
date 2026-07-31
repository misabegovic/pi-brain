import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { readAutonomy, writeAutonomy } from "../brain-home.ts";
import { requireBrain, setupHint } from "../context.ts";

function notFound() {
  return { content: [{ type: "text" as const, text: setupHint() }], details: {} };
}

export function registerAutonomyTools(pi: ExtensionAPI) {
  pi.registerTool({
    name: "brain_autonomy",
    label: "Brain autonomy",
    description: "Read or toggle the autonomous brain-maintenance mode.",
    parameters: Type.Object({
      enabled: Type.Optional(Type.Boolean({ description: "Set to true/false to toggle; omit to read current state." })),
    }),
    constrainedSampling: { type: "json_schema" as const, strict: "prefer" as const },
    async execute(_toolCallId: string, params: any, _signal: AbortSignal | undefined, _onUpdate: unknown, ctx: ExtensionContext) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return notFound();

      const state = await readAutonomy(home);
      if (params.enabled !== undefined) {
        state.enabled = params.enabled;
        await writeAutonomy(home, state);
      }

      return {
        content: [
          {
            type: "text",
            text: `Autonomy is ${state.enabled ? "ON" : "OFF"}. ${
              state.enabled
                ? "The agent will proactively maintain the brain this session."
                : "The agent will only use brain tools when explicitly asked."
            }`,
          },
        ],
        details: {},
      };
    },
  });
}
