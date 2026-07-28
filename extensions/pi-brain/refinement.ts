import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { BrainHome } from "./types.ts";
import { readAutonomy } from "./brain-home.ts";

const pendingRefinement = new Set<string>();

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

    pendingRefinement.add(sessionFile);

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
