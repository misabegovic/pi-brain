import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { join } from "node:path";
import { pathExists } from "../utils.ts";
import { readAutonomy, readAutoConnect } from "../brain-home.ts";
import { getPackageRoot } from "../resources.ts";
import { autoGroom } from "../inbox.ts";
import { loadPrompt, hasAgentsMd } from "../prompts.ts";
import { requireBrain, loadBriefing } from "../context.ts";
import { formatSummary, getSessionSummary, clearSessionSummary } from "../autonomy.ts";
import { renderBrainBriefing } from "./shared.ts";
import { sessionKey, takeIntentDebt } from "../intent-first.ts";

export function registerLifecycleHooks(
  pi: ExtensionAPI,
  lastSystemPrompt: { current: string },
  briefedSessions: Set<string>,
  toolTiers: { always: string[]; home: string[]; bootstrap: string[] }
) {
  pi.on("agent_settled", async (_event, ctx) => {
    if (!ctx.isIdle()) return;
    const sessionFile = ctx.sessionManager?.getSessionFile?.();
    if (!sessionFile) return;
    const summary = getSessionSummary(sessionFile);
    if (summary.length === 0) return;
    if (ctx.hasUI) {
      ctx.ui.notify(formatSummary(summary), "info");
    }
    clearSessionSummary(sessionFile);
  });

  pi.on("session_start", async (_event, ctx) => {
    await loadBriefing(ctx);
    const home = await requireBrain(ctx.cwd);

    if (typeof pi.getActiveTools === "function" && typeof pi.setActiveTools === "function") {
      const active = new Set(pi.getActiveTools());
      if (home) {
        toolTiers.home.forEach((name) => active.add(name));
        toolTiers.bootstrap.forEach((name) => active.delete(name));
      } else {
        toolTiers.bootstrap.forEach((name) => active.add(name));
        toolTiers.home.forEach((name) => active.delete(name));
      }
      toolTiers.always.forEach((name) => active.add(name));
      pi.setActiveTools([...active]);
    }

    if (home) {
      const state = await readAutonomy(home);
      if (state.enabled) {
        await autoGroom(home);
      }
    }
  });

  pi.on("session_tree", async (_event, ctx) => {
    await loadBriefing(ctx);
  });

  pi.on("resources_discover", async (_event, ctx) => {
    const pkgRoot = getPackageRoot();
    const home = await requireBrain(ctx.cwd);
    const overrides: { skillPaths: string[]; promptPaths: string[]; themePaths: string[] } = {
      skillPaths: [],
      promptPaths: [],
      themePaths: [],
    };
    if (home) {
      const overrideSkills = join(home.path, ".brain", "overrides", "skills");
      const overridePrompts = join(home.path, ".brain", "overrides", "prompts");
      const overrideThemes = join(home.path, ".brain", "overrides", "themes");
      if (await pathExists(overrideSkills)) overrides.skillPaths.push(overrideSkills);
      if (await pathExists(overridePrompts)) overrides.promptPaths.push(overridePrompts);
      if (await pathExists(overrideThemes)) overrides.themePaths.push(overrideThemes);
    }
    return {
      skillPaths: [join(pkgRoot, "skills"), ...overrides.skillPaths],
      promptPaths: [...overrides.promptPaths],
      themePaths: [...overrides.themePaths],
    };
  });

  pi.on("before_agent_start", async (event, ctx) => {
    const home = await requireBrain(ctx.cwd);
    lastSystemPrompt.current = event.systemPrompt ?? "";
    if (!home) return {};

    const state = await readAutonomy(home);
    const agentsLoaded = hasAgentsMd(event.systemPromptOptions?.contextFiles);
    const parts: string[] = [];

    if (!agentsLoaded) {
      const base = await loadPrompt("brain-base.md", home);
      if (base) parts.push(base.replace("{BRAIN_HOME}", home.path));
    } else {
      parts.push(`You are working inside a pi-brain clone at ${home.path}. AGENTS.md already covers the brain contract; prefer brain_ask over guessing and use brain_capture freely.`);
    }

    const intentDebt = takeIntentDebt(sessionKey(ctx));
    if (intentDebt) parts.push(intentDebt);

    if (state.enabled) {
      const autonomy = await loadPrompt("brain-autonomy.md", home);
      if (autonomy) parts.push(autonomy);
      if (await readAutoConnect(home)) {
        parts.push("auto_connect is enabled in brain.config.yml — run brain_pull_connectors opportunistically at session start if connectors are configured, but do not block user work for it.");
      }
    }

    const systemPrompt = parts.length > 0 ? event.systemPrompt + "\n\n" + parts.join("\n\n") : event.systemPrompt;

    const sessionFile = ctx.sessionManager?.getSessionFile?.();
    let message;
    if (sessionFile && !briefedSessions.has(sessionFile)) {
      briefedSessions.add(sessionFile);
      message = await renderBrainBriefing(home);
    }

    return { systemPrompt, message };
  });
}
