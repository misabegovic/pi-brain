import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import type { BrainHome } from "./types.ts";
import { readAutonomy } from "./brain-home.ts";
import { getTrustLevel, recordOperation, shouldProceed, shouldNotify } from "./autonomy.ts";

const pendingRefinement = new Set<string>();
const MAX_SUGGESTIONS = 5;

async function countRefinementSuggestions(home: BrainHome): Promise<number> {
  try {
    const files = await readdir(join(home.path, "wiki", "brain", "ai-suggestions", "refinement"));
    return files.filter((f) => f.endsWith(".md")).length;
  } catch {
    return 0;
  }
}

function getSessionFile(ctx: ExtensionContext): string | undefined {
  return ctx.sessionManager?.getSessionFile?.();
}

function lastEntryIsRefinementTrigger(ctx: ExtensionContext): boolean {
  const entries = ctx.sessionManager?.getEntries() ?? [];
  const last = entries[entries.length - 1];
  if (!last) return false;
  return (
    last.type === "custom" &&
    (last as { customType?: string }).customType === "brain-refinement-trigger"
  );
}

export function registerRefinement(
  pi: ExtensionAPI,
  getHome: (cwd: string) => Promise<BrainHome | null>,
) {
  // Clear the refinement gate when the user sends real input, so a future
  // idle window can run refinement again.
  pi.on("input", async (event, ctx) => {
    if (event.source !== "interactive") return;
    const sessionFile = getSessionFile(ctx);
    if (sessionFile) pendingRefinement.delete(sessionFile);
  });

  // Trigger a refinement turn when the agent becomes idle in auto mode.
  pi.on("agent_settled", async (_event, ctx) => {
    if (!ctx.isIdle()) return;

    const sessionFile = getSessionFile(ctx);
    if (!sessionFile) return;

    // Already triggered in this idle window.
    if (pendingRefinement.has(sessionFile)) return;

    // Do not loop: if the last thing that happened was our own trigger,
    // the current settled state is the end of the refinement turn.
    if (lastEntryIsRefinementTrigger(ctx)) return;

    const home = await getHome(ctx.cwd);
    if (!home) return;

    const state = await readAutonomy(home);
    if (!state.enabled) return;

    const trust = await getTrustLevel(home, "refine");

    const suggestionCount = await countRefinementSuggestions(home);
    if (suggestionCount > MAX_SUGGESTIONS) {
      if (shouldNotify(trust)) {
        recordOperation(sessionFile, {
          class: "refine",
          description: `Skipped refinement protocol: ${suggestionCount} suggestions queued (max ${MAX_SUGGESTIONS})`,
          timestamp: Date.now(),
        });
      }
      return;
    }

    if (!shouldProceed(trust)) return;

    pendingRefinement.add(sessionFile);

    if (shouldNotify(trust)) {
      recordOperation(sessionFile, {
        class: "refine",
        description: "Ran autonomous refinement protocol",
        timestamp: Date.now(),
      });
    }

    pi.sendMessage(
      {
        customType: "brain-refinement-trigger",
        content: "Run the autonomous refinement protocol.",
        display: false,
      },
      { triggerTurn: true },
    );
  });
}
