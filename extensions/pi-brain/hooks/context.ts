import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { readContextInjectionConfig, readHarvestConfig } from "../brain-home.ts";
import { buildInjectedMessages } from "../context-injection.ts";
import { runCompactionHarvest } from "../compaction-harvest.ts";
import { requireBrain } from "../context.ts";

export function registerContextHooks(pi: ExtensionAPI) {
  pi.on("context", async (event, ctx) => {
    const home = await requireBrain(ctx.cwd);
    if (!home) return {};

    const config = await readContextInjectionConfig(home);
    const messages = (event as any).messages ?? [];
    const injected = await buildInjectedMessages(home, messages, config);
    if (!injected) return {};

    return { messages: injected };
  });

  pi.on("session_before_compact", async (event, ctx) => {
    const home = await requireBrain(ctx.cwd);
    if (!home) return {};

    const config = await readHarvestConfig(home);
    const entries = (event as any).branchEntries ?? [];
    await runCompactionHarvest(home, entries, config);

    return {};
  });
}
