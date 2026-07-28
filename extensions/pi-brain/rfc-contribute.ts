import { readFile, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { requireBrain } from "./context.ts";
import { pathExists } from "./utils.ts";
import { loadBrainAgent, runAgent } from "./collaboration.ts";

function formatContribution(author: string, task: string, text: string): string {
  const date = new Date().toISOString().slice(0, 10);
  const lines = [
    "",
    `### ${date} — ${author}`,
    "",
    `**Task:** ${task}`,
    "",
    text.trim(),
    "",
  ];
  return lines.join("\n");
}

function appendContribution(rfcText: string, contribution: string): string {
  const marker = "## Contributions";
  if (rfcText.includes(marker)) {
    return rfcText.replace(marker, `${marker}\n${contribution}`);
  }
  return rfcText.trimEnd() + "\n\n" + marker + "\n" + contribution;
}

export function registerRfcContribute(pi: ExtensionAPI) {
  pi.registerCommand("brain:rfc-contribute", {
    description: "Add an agent or human contribution to an RFC (usage: /brain:rfc-contribute <scope> <slug> <agent|human> <prompt>)",
    handler: async (args, ctx) => {
      const trimmed = args.trim();
      if (!trimmed) {
        ctx.ui.notify("Usage: /brain:rfc-contribute <scope> <slug> <agent|human> <prompt>", "warning");
        return;
      }

      const parts = trimmed.split(/\s+/);
      if (parts.length < 4) {
        ctx.ui.notify("Usage: /brain:rfc-contribute <scope> <slug> <agent|human> <prompt>", "warning");
        return;
      }

      const [scope, slug, author, ...taskParts] = parts;
      const task = taskParts.join(" ");
      const home = await requireBrain(ctx.cwd);
      if (!home) {
        ctx.ui.notify("No pi-brain home found.", "error");
        return;
      }

      const rfcPath = join(home.path, "wiki", scope, "rfcs", `${slug}.md`);
      if (!(await pathExists(rfcPath))) {
        ctx.ui.notify(`RFC not found: ${relative(home.path, rfcPath)}`, "error");
        return;
      }

      let contributionText = "";

      if (author === "human") {
        contributionText = task;
      } else {
        const agent = await loadBrainAgent(author);
        if (!agent) {
          ctx.ui.notify(`Agent not found: ${author}`, "error");
          return;
        }
        ctx.ui.notify(`Running ${author} on RFC...`, "info");
        const rfcContent = await readFile(rfcPath, "utf-8");
        const agentTask = [
          `Review the following RFC and contribute a focused perspective.`,
          ``,
          `Your task: ${task}`,
          ``,
          `---`,
          rfcContent,
          `---`,
          ``,
          `Provide a concise contribution that the RFC authors can act on. Do not rewrite the RFC.`,
        ].join("\n");
        const result = await runAgent(agent, agentTask, ctx.cwd);
        if (result.exitCode !== 0) {
          ctx.ui.notify(`Agent ${author} failed: ${result.error || result.output}`, "error");
          return;
        }
        contributionText = result.output;
      }

      const rfcText = await readFile(rfcPath, "utf-8");
      const contribution = formatContribution(author, task, contributionText);
      const updated = appendContribution(rfcText, contribution);
      await writeFile(rfcPath, updated, "utf-8");

      ctx.ui.notify(`Added contribution to ${relative(home.path, rfcPath)}`, "info");
    },
  });
}
