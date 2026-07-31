import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { readAutonomy, writeAutonomy } from "../brain-home.ts";
import { requireBrain } from "../context.ts";

export function registerAutonomyCommands(pi: ExtensionAPI) {
  pi.registerCommand("brain:auto", {
    description: "Toggle autonomous brain-maintenance mode",
    handler: async (_args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const state = await readAutonomy(home);
      state.enabled = !state.enabled;
      await writeAutonomy(home, state);
      ctx.ui.notify(
        state.enabled
          ? "Autonomy ON — pi will proactively maintain the brain this session."
          : "Autonomy OFF — pi will only use brain tools when explicitly asked.",
        "info"
      );
    },
  });

  pi.registerCommand("brain:continue", {
    description: "Continue in-flight pi-brain work",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const message = args.trim() ? `/skill:brain-continue ${args.trim()}` : "/skill:brain-continue";
      pi.sendUserMessage(message);
    },
  });

  pi.registerCommand("brain:investigate", {
    description: "Investigate a bug, risk, or open question",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      if (!args.trim()) {
        ctx.ui.notify("Usage: /brain:investigate <question>", "warning");
        return;
      }
      pi.sendUserMessage(`/skill:brain-investigate ${args.trim()}`);
    },
  });
}
