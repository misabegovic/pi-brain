import { countInboxItems } from "../utils.ts";
import { countPages, countSources, readInbox } from "../brain-home.ts";
import type { BrainHome } from "../types.ts";

export const STATE_CHANGING_BRAIN_TOOLS = new Set([
  "brain_capture",
  "brain_ingest",
  "brain_pull_connectors",
  "brain_sync",
  "brain_update",
  "brain_state",
  "brain_views",
  "brain_validate",
  "brain_links",
  "brain_convert",
  "brain_ingest_repo",
  "brain_autonomy",
]);

export async function renderBrainBriefing(home: BrainHome) {
  const pages = await countPages(home);
  const sources = await countSources(home);
  const inbox = await readInbox(home);
  const inboxCount = countInboxItems(inbox);
  return {
    customType: "pi-brain-briefing",
    content: `🧠 Brain home: ${home.path} — ${pages} pages, ${sources} sources, ${inboxCount} inbox items.`,
    display: false,
  };
}
