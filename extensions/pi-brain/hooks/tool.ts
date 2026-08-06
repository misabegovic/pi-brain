import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { relative } from "node:path";
import { countInboxItems } from "../utils.ts";
import {
  readToolResultEnrichmentConfig,
  readEventBusConfig,
  countPages,
  countSources,
  readInbox,
} from "../brain-home.ts";
import { enrichToolResult } from "../tool-result-enrichment.ts";
import { emitBrainEvent } from "../events.ts";
import { loadActiveConstraints, matchGlob } from "../state.ts";
import { requireBrain } from "../context.ts";
import { STATE_CHANGING_BRAIN_TOOLS, renderBrainBriefing } from "./shared.ts";
import {
  classifyIntentTarget,
  gateFirstTouch,
  intentFirstGateReason,
  projectsRoot,
  readIntentFirstConfig,
  recordIntentTarget,
  sessionKey,
} from "../intent-first.ts";

export function registerToolHooks(pi: ExtensionAPI) {
  pi.on("tool_call", async (event, ctx) => {
    const home = await requireBrain(ctx.cwd);
    if (!home) return {};
    const toolName = (event as any).toolCall?.name;
    if (toolName !== "write" && toolName !== "edit") return {};

    const args = (event as any).toolCall?.arguments ?? {};
    const targetPath = args.path ?? "";
    if (!targetPath) return {};

    const relPath = relative(home.path, targetPath);
    if (relPath.startsWith("..")) return {};

    const constraints = await loadActiveConstraints(home);
    for (const constraint of constraints) {
      if (constraint.globs.some((g) => matchGlob(relPath, g))) {
        return {
          block: true,
          reason: `Blocked by active constraint "${constraint.title}". This path matches a protected glob. Draft or graduate an ADR before making this change.`,
        };
      }
    }
    return {};
  });

  pi.on("tool_call", async (event, ctx) => {
    const home = await requireBrain(ctx.cwd);
    if (!home) return {};
    const toolName = (event as any).toolCall?.name;
    if (toolName !== "write" && toolName !== "edit") return {};

    const targetPath = (event as any).toolCall?.arguments?.path ?? "";
    const target = classifyIntentTarget(home, projectsRoot(), targetPath);
    if (!target || target.kind !== "code") return {};

    const config = await readIntentFirstConfig(home);
    if (!config.enabled) return {};
    if (!gateFirstTouch(sessionKey(ctx), target.repoName)) return {};

    return { block: true, reason: await intentFirstGateReason(home, target) };
  });

  pi.on("tool_result", async (event, ctx) => {
    const home = await requireBrain(ctx.cwd);
    if (!home) return;

    const toolName = (event as any).toolName as string;

    if ((toolName === "write" || toolName === "edit") && typeof event.input?.path === "string") {
      recordIntentTarget(sessionKey(ctx), classifyIntentTarget(home, projectsRoot(), event.input.path));
    }
    let shouldRefresh = false;

    if (STATE_CHANGING_BRAIN_TOOLS.has(toolName)) {
      shouldRefresh = true;
    } else if (
      (toolName === "write" || toolName === "edit") &&
      event.input &&
      typeof event.input.path === "string"
    ) {
      const targetPath = event.input.path as string;
      const relPath = relative(home.path, targetPath);
      if (
        !relPath.startsWith("..") &&
        (relPath === "wiki/_state/inbox.md" || relPath === "wiki/_state/auto-ingest-batch.json")
      ) {
        shouldRefresh = true;
      }
    }

    const enrichmentConfig = await readToolResultEnrichmentConfig(home);
    const enrichment = await enrichToolResult(home, event, enrichmentConfig);

    if (shouldRefresh && typeof pi.sendMessage === "function") {
      const message = await renderBrainBriefing(home);
      pi.sendMessage(message);
    }

    const eventBusConfig = await readEventBusConfig(home);
    if (eventBusConfig.enabled && shouldRefresh) {
      const pages = await countPages(home);
      const sources = await countSources(home);
      const inbox = await readInbox(home);
      emitBrainEvent(pi, { type: "brain:stateChanged", payload: { pages, sources, inbox: countInboxItems(inbox) } });
    }

    return enrichment;
  });
}
