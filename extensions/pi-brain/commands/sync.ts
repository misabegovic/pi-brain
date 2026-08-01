import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { join } from "node:path";
import { runBrainScript, pathExists } from "../utils.ts";
import { validateMarkdown, regenerateViews } from "../views.ts";
import { resolveResource } from "../resources.ts";
import { requireBrain } from "../context.ts";

export function registerSyncCommands(pi: ExtensionAPI) {
  pi.registerCommand("brain:sync", {
    description: "Run a pi-brain health sweep",
    handler: async (_args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const errors = await validateMarkdown(home);
      const viewMessage = await regenerateViews(home);
      const errorText = errors.length > 0 ? errors.map((e) => `${e.path}: ${e.errors.join(", ")}`).join("\n") : "No validation errors.";
      ctx.ui.notify(`${viewMessage}\n${errorText}`, errors.length > 0 ? "warning" : "info");
    },
  });

  pi.registerCommand("brain:update", {
    description: "Pull upstream pi-brain template updates into this clone",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const tokens = args.trim().split(/\s+/).filter(Boolean);
      const apply = tokens.includes("--apply");
      const versionFlag = tokens.find((t) => t.startsWith("--version="));
      const version = versionFlag ? versionFlag.replace("--version=", "") : undefined;
      pi.sendUserMessage(`/tool:brain_update ${apply ? "apply=true " : ""}${version ? `version=${version}` : ""}`.trim());
    },
  });

  pi.registerCommand("brain:connect", {
    description: "Run configured pull connectors to snapshot external sources",
    handler: async (_args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const script = await resolveResource(join("tools", "connectors", "run.mjs"), home);
      if (!(await pathExists(script))) {
        ctx.ui.notify("Connector runner not found", "error");
        return;
      }
      const result = await runBrainScript(script, [], home);
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
      ctx.ui.notify(output || "Connectors finished.", result.code === 0 ? "info" : "error");
    },
  });
}
