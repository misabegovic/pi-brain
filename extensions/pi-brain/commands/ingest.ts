import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { join } from "node:path";
import { runBrainScript, pathExists } from "../utils.ts";
import { resolveResource } from "../resources.ts";
import { requireBrain } from "../context.ts";

export function registerIngestCommands(pi: ExtensionAPI) {
  pi.registerCommand("brain:ingest-repo", {
    description: "Onboard a repository as a maintained pi-brain project",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const [target, scope] = args.trim().split(/\s+/);
      if (!target) {
        ctx.ui.notify("Usage: /brain:ingest-repo <path-or-url> [scope]", "error");
        return;
      }
      const script = await resolveResource(join("tools", "brain-ingest-repo.mjs"), home);
      if (!(await pathExists(script))) {
        ctx.ui.notify("Repo ingest runner not found", "error");
        return;
      }
      const cmdArgs = scope ? [target, scope] : [target];
      const result = await runBrainScript(script, cmdArgs, home);
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
      ctx.ui.notify(output || "Repo ingested.", result.code === 0 ? "info" : "error");
    },
  });

  pi.registerCommand("brain:projects", {
    description: "List onboarded pi-brain projects",
    handler: async (_args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const script = await resolveResource(join("tools", "brain-projects.mjs"), home);
      if (!(await pathExists(script))) {
        ctx.ui.notify("Projects runner not found", "error");
        return;
      }
      const result = await runBrainScript(script, [], home);
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
      ctx.ui.notify(output || "No projects found.", result.code === 0 ? "info" : "error");
    },
  });
}
