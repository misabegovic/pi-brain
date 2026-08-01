import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { join } from "node:path";
import { runBrainScript, pathExists } from "../utils.ts";
import { resolveResource } from "../resources.ts";
import { requireBrain } from "../context.ts";

export function registerViewCommands(pi: ExtensionAPI) {
  pi.registerCommand("brain:links", {
    description: "Derive and show the pi-brain link graph",
    handler: async (_args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const script = await resolveResource(join("tools", "brain-links.mjs"), home);
      if (!(await pathExists(script))) {
        ctx.ui.notify("Link graph runner not found", "error");
        return;
      }
      const result = await runBrainScript(script, [], home);
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
      ctx.ui.notify(output || "Link graph finished.", result.code === 0 ? "info" : "error");
    },
  });

  pi.registerCommand("brain:groom", {
    description: "Groom the pi-brain corpus",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const message = args.trim() ? `/skill:brain-groom ${args.trim()}` : "/skill:brain-groom";
      pi.sendUserMessage(message);
    },
  });

  pi.registerCommand("brain:state", {
    description: "Regenerate state, roadmap, and options pages",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const script = await resolveResource(join("tools", "brain-state.mjs"), home);
      if (!(await pathExists(script))) {
        ctx.ui.notify("State runner not found", "error");
        return;
      }
      const cmdArgs = args.trim() ? [args.trim()] : [];
      const result = await runBrainScript(script, cmdArgs, home);
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
      ctx.ui.notify(output || "State pages regenerated.", result.code === 0 ? "info" : "error");
    },
  });
}
