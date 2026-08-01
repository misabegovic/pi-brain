import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { runBrainScript, pathExists } from "../utils.ts";
import { getPackageRoot } from "../resources.ts";
import { requireBrain } from "../context.ts";

export function registerMiscCommands(pi: ExtensionAPI, lastSystemPrompt: { current: string }) {
  pi.registerCommand("brain:dump-prompt", {
    description: "[Phase 0 baseline] Dump the last system prompt seen before_agent_start to tests/fixtures/",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const fileName = args.trim() || `prompt-${new Date().toISOString().slice(0, 10)}.txt`;
      const fixturesDir = join(home.path, "tests", "fixtures");
      await mkdir(fixturesDir, { recursive: true });
      const outPath = join(fixturesDir, fileName);
      await writeFile(outPath, lastSystemPrompt.current || "(no system prompt captured yet)\n", "utf-8");
      ctx.ui.notify(`Dumped system prompt to tests/fixtures/${fileName}`, "info");
    },
  });

  pi.registerCommand("brain:convert", {
    description: "Convert the current repository into a pi-brain clone",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (home) {
        ctx.ui.notify("This directory already looks like a pi-brain home.", "error");
        return;
      }
      const script = join(getPackageRoot(), "tools", "brain-convert.mjs");
      if (!(await pathExists(script))) {
        ctx.ui.notify("Convert runner not found", "error");
        return;
      }
      const tokens = args.trim().split(/\s+/).filter(Boolean);
      const dryRun = tokens.includes("--dry-run");
      const subdir = tokens.find((t) => t !== "--dry-run");
      const cmdArgs: string[] = [];
      if (subdir) cmdArgs.push(subdir);
      if (dryRun) cmdArgs.push("--dry-run");
      const result = await runBrainScript(script, cmdArgs, { path: ctx.cwd });
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
      ctx.ui.notify(output || "Conversion complete.", result.code === 0 ? "info" : "error");
    },
  });

  pi.registerCommand("brain:deepdive", {
    description: "Transiently read a target repo file/directory for shaping/investigation",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const [target, ...rest] = args.trim().split(/\s+/);
      if (!target) {
        ctx.ui.notify("Usage: /brain:deepdive <path> [question]", "error");
        return;
      }
      const question = rest.join(" ");
      const result = await (pi as any).tools.brain_deepdive({ target, question });
      ctx.ui.notify(result.content[0].text.slice(0, 200), "info");
    },
  });
}
