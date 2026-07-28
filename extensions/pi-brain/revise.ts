import { readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { requireBrain } from "./context.ts";
import { pathExists } from "./utils.ts";

const ALLOWED_KINDS = new Set(["prds", "adrs", "bets", "records"]);

export function registerRevise(pi: ExtensionAPI) {
  pi.registerCommand("brain:revise", {
    description: "Propose a revision to an existing intent artifact (usage: /brain:revise <scope> <kind>/<slug>)",
    handler: async (args, ctx) => {
      const trimmed = args.trim();
      if (!trimmed) {
        ctx.ui.notify("Usage: /brain:revise <scope> <kind>/<slug>", "warning");
        return;
      }

      const parts = trimmed.split(/\s+/);
      if (parts.length !== 2) {
        ctx.ui.notify("Usage: /brain:revise <scope> <kind>/<slug>", "warning");
        return;
      }

      const [scope, kindSlug] = parts;
      const kindSlugParts = kindSlug.split("/");
      if (kindSlugParts.length !== 2) {
        ctx.ui.notify("Usage: /brain:revise <scope> <kind>/<slug>", "warning");
        return;
      }

      const [kind, slug] = kindSlugParts;
      if (!ALLOWED_KINDS.has(kind)) {
        ctx.ui.notify(`Unsupported kind: ${kind}. Use prds/adrs/bets/records.`, "warning");
        return;
      }

      const home = await requireBrain(ctx.cwd);
      if (!home) {
        ctx.ui.notify("No pi-brain home found.", "error");
        return;
      }

      const targetPath = join(home.path, "wiki", scope, kind, `${slug}.md`);
      if (!(await pathExists(targetPath))) {
        ctx.ui.notify(`Artifact not found: ${relative(home.path, targetPath)}`, "error");
        return;
      }

      const targetRel = relative(home.path, targetPath);
      const targetContent = await readFile(targetPath, "utf-8");

      const prompt = [
        `Review the following intent artifact and propose a concrete revision based on the current state of the pi-brain corpus.`,
        ``,
        `Target artifact: ${targetRel}`,
        ``,
        `---`,
        targetContent,
        `---`,
        ``,
        `Instructions:`,
        `- Identify gaps, outdated statements, missing links, or contradictions with other approved intent, sources, or code.`,
        `- Propose specific, minimal changes with rationale.`,
        `- Cite the source(s) that motivate each proposed change.`,
        `- Do NOT edit the approved artifact directly.`,
        `- Write the proposal to wiki/${scope}/ai-suggestions/revisions/${slug}.md using the revision-ai-suggestion template.`,
        `- If the revision feels structural, high-risk, or uncertain, capture an inbox task instead.`,
      ].join("\n");

      pi.sendUserMessage(prompt);
    },
  });
}
