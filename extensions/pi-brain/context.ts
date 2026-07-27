import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { BrainHome } from "./types.ts";
import { findBrainHome, readOrg, countPages, countSources, readInbox, countPagesByKind } from "./brain-home.ts";
import { countInboxItems, listInboxItems } from "./utils.ts";

export async function requireBrain(cwd: string, ctx?: ExtensionContext): Promise<BrainHome | null> {
  const home = await findBrainHome(cwd);
  if (!home && ctx) {
    ctx.ui.notify("pi-brain: no pi-brain home found", "warning");
  }
  return home;
}

export function setupHint(): string {
  return [
    "No pi-brain home here yet.",
    "",
    "Run /brain:setup to create one,",
    "or set PI_BRAIN_HOME / .pi/brain-home to point to an existing clone.",
  ].join("\n");
}

export async function loadBriefing(ctx: ExtensionContext) {
  const home = await requireBrain(ctx.cwd, ctx);
  if (!home) {
    ctx.ui.setWidget("pi-brain", [setupHint()]);
    return;
  }

  const org = await readOrg(home);
  const pages = await countPages(home);
  const sources = await countSources(home);
  const inbox = await readInbox(home);
  const inboxCount = countInboxItems(inbox);
  const kindCounts = await countPagesByKind(home);
  const recentItems = listInboxItems(inbox, 3);

  const lines = [
    `🧠 ${org}`,
    `   ${pages} wiki pages · ${sources} sources · ${inboxCount} inbox items`,
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
    lines.push("", "Use /brain:tend to digest.");
  } else {
    lines.push("", "Inbox is empty. Everything is tended.");
  }

  ctx.ui.setWidget("pi-brain", lines);

  const theme = ctx.ui.theme;
  if (inboxCount > 0) {
    ctx.ui.setStatus(
      "pi-brain",
      theme.fg("warning", `🧠 ${inboxCount} brain item${inboxCount === 1 ? "" : "s"} waiting`)
    );
  } else {
    ctx.ui.setStatus("pi-brain", theme.fg("success", "🧠 brain up to date"));
  }
}
