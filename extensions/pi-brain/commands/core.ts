import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { countInboxItems, listInboxItems } from "../utils.ts";
import { readOrg, countPages, countSources, countPagesByKind, readInbox } from "../brain-home.ts";
import { searchFiles } from "../search.ts";
import { requireBrain } from "../context.ts";

export function registerCoreCommands(pi: ExtensionAPI) {
  pi.registerCommand("brain", {
    description: "Show the pi-brain briefing",
    handler: async (_args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const org = await readOrg(home);
      const pages = await countPages(home);
      const sources = await countSources(home);
      const inbox = await readInbox(home);
      const inboxCount = countInboxItems(inbox);
      const kindCounts = await countPagesByKind(home);
      const recentItems = listInboxItems(inbox, 3);

      const lines = [
        `${org} — ${pages} pages · ${sources} sources · ${inboxCount} inbox items`,
        "",
        "Pages:",
        ...Array.from(kindCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([kind, count]) => `  ${kind}: ${count}`),
      ];

      if (recentItems.length > 0) {
        lines.push("", "Needs you:");
        for (const item of recentItems) {
          const summary = item.summary.length > 60 ? item.summary.slice(0, 57) + "..." : item.summary;
          lines.push(`  • ${summary}`);
        }
      }

      ctx.ui.notify(lines.join("\n"), "info");
    },
  });

  pi.registerCommand("brain:capture", {
    description: "Capture a note into the pi-brain inbox",
    handler: async (args, ctx) => {
      if (!args.trim()) {
        ctx.ui.notify("Usage: /brain:capture <note>", "warning");
        return;
      }
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;

      const id = args
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 48)
        .replace(/(^-|-$)/g, "") || "capture";
      const date = new Date().toISOString().slice(0, 10);
      const entry = [
        "",
        `### ${id} (${date})`,
        "",
        `- **kind:** task`,
        `- **scope:** brain`,
        `- **summary:** ${args}`,
        "",
      ].join("\n");

      const inboxPath = join(home.path, "wiki", "_state", "inbox.md");
      const current = await readInbox(home);
      await writeFile(inboxPath, current.trimEnd() + entry + "\n", "utf-8");
      ctx.ui.notify(`Captured: ${id}`, "info");
    },
  });

  pi.registerCommand("brain:ask", {
    description: "Ask the pi-brain a question",
    handler: async (args, ctx) => {
      if (!args.trim()) {
        ctx.ui.notify("Usage: /brain:ask <question>", "warning");
        return;
      }
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const results = await searchFiles(home, args);
      const text = results.length > 0 ? results.map((r) => `[${r.score}] ${r.path}\n  ${r.snippet}`).join("\n\n") : "No matches.";
      ctx.ui.notify(text, "info");
    },
  });

  pi.registerCommand("brain:tend", {
    description: "Digest the pi-brain tend queue",
    handler: async (_args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const inbox = await readInbox(home);
      const count = countInboxItems(inbox);
      ctx.ui.notify(`${count} inbox item(s)\n\n${inbox.slice(0, 1500)}`, "info");
    },
  });
}
