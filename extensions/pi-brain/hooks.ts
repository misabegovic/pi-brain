import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { join, relative } from "node:path";
import { pathExists, countInboxItems } from "./utils.ts";
import { readAutoConnect, readHarvestCompaction, readAutonomy, countPages, countSources, readInbox } from "./brain-home.ts";
import { getPackageRoot } from "./resources.ts";
import { searchFiles } from "./search.ts";
import { replaceInboxItem, buildInboxEntry, autoGroom } from "./inbox.ts";
import { loadPrompt, hasAgentsMd } from "./prompts.ts";
import { loadActiveConstraints, matchGlob } from "./state.ts";
import { requireBrain, loadBriefing } from "./context.ts";
import type { BrainHome } from "./types.ts";

const STATE_CHANGING_BRAIN_TOOLS = new Set([
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

async function renderBrainBriefing(home: BrainHome) {
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

export function registerHooks(
  pi: ExtensionAPI,
  lastSystemPrompt: { current: string },
  briefedSessions: Set<string>,
  toolTiers: { always: string[]; home: string[]; bootstrap: string[] }
) {
  pi.on("session_start", async (_event, ctx) => {
    await loadBriefing(ctx);
    const home = await requireBrain(ctx.cwd);

    // Use setActiveTools additively: keep built-in/extension tools already
    // active and only add/remove pi-brain tier tools. This preserves the
    // default read/bash/edit/write tools and any other extension tools.
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

    // Tier 1: brain home present — base brain awareness.
    if (!agentsLoaded) {
      const base = await loadPrompt("brain-base.md", home);
      if (base) parts.push(base.replace("{BRAIN_HOME}", home.path));
    } else {
      parts.push(`You are working inside a pi-brain clone at ${home.path}. AGENTS.md already covers the brain contract; prefer brain_ask over guessing and use brain_capture freely.`);
    }

    // Tier 2: autonomy enabled — extended autonomy boundary.
    if (state.enabled) {
      const autonomy = await loadPrompt("brain-autonomy.md", home);
      if (autonomy) parts.push(autonomy);
      if (await readAutoConnect(home)) {
        parts.push("auto_connect is enabled in brain.config.yml — run brain_pull_connectors opportunistically at session start if connectors are configured, but do not block user work for it.");
      }
    }

    const systemPrompt = parts.length > 0 ? event.systemPrompt + "\n\n" + parts.join("\n\n") : event.systemPrompt;

    // First-run briefing message: volatile state that should not live in the system prompt.
    const sessionFile = ctx.sessionManager?.getSessionFile?.();
    let message;
    if (sessionFile && !briefedSessions.has(sessionFile)) {
      briefedSessions.add(sessionFile);
      message = await renderBrainBriefing(home);
    }

    return { systemPrompt, message };
  });

  pi.on("context", async (event, ctx) => {
    if (process.env.PI_BRAIN_EXPERIMENTAL_CONTEXT !== "1") return {};
    const home = await requireBrain(ctx.cwd);
    if (!home) return {};

    const messages = (event as any).messages ?? [];
    const lastUser = [...messages].reverse().find((m: any) => m.role === "user");
    if (!lastUser) return {};

    const query = typeof lastUser.content === "string" ? lastUser.content : "";
    if (!query) return {};

    const results = await searchFiles(home, query);
    const records = results.filter((r) => r.path.includes("/records/")).slice(0, 2);
    if (records.length === 0) return {};

    const injection = {
      role: "user",
      content: `Relevant records for this turn:\n${records.map((r) => `- ${r.path}: ${r.snippet}`).join("\n")}`,
    };

    return { messages: [...messages, injection] };
  });

  pi.on("tool_call", async (event, ctx) => {
    const home = await requireBrain(ctx.cwd);
    if (!home) return {};
    const toolName = (event as any).toolCall?.name;
    if (toolName !== "write" && toolName !== "edit") return {};

    const args = (event as any).toolCall?.arguments ?? {};
    const targetPath = args.path ?? "";
    if (!targetPath) return {};

    const relPath = relative(home.path, targetPath);
    if (relPath.startsWith("..")) return {}; // outside brain home

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

  pi.on("session_before_compact", async (event, ctx) => {
    const home = await requireBrain(ctx.cwd);
    if (!home) return {};
    if (!(await readHarvestCompaction(home))) return {};

    const entries = (event as any).branchEntries ?? [];
    const harvests: string[] = [];
    const decisionPattern = /\b(decided|decision|we agreed|let's|let us|we will|we should|we must|constraint|no-go|rabbit hole|open question|todo|action item)\b/i;

    for (const entry of entries) {
      if (entry.type !== "message") continue;
      const msg = entry.message;
      if (!msg || msg.role !== "user") continue;
      const text = typeof msg.content === "string" ? msg.content : "";
      if (decisionPattern.test(text)) {
        const snippet = text.length > 200 ? text.slice(0, 197) + "..." : text;
        harvests.push(`- ${snippet.replace(/\n/g, " ")}`);
      }
    }

    if (harvests.length === 0) return {};

    const note = [
      "Compaction harvest (confidence: low):",
      ...harvests,
      "",
      "Review and either capture as a real inbox item or discard.",
    ].join("\n");

    const id = "compaction-harvest";
    const date = new Date().toISOString().slice(0, 10);
    const entry = buildInboxEntry(id, date, "compaction-harvest", note);
    await replaceInboxItem(home, id, entry);

    return {};
  });

  // Live-refresh the brain status widget after state-changing operations.
  pi.on("tool_result", async (event, ctx) => {
    const home = await requireBrain(ctx.cwd);
    if (!home) return;

    const toolName = (event as any).toolName as string;
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

    if (!shouldRefresh) return;
    if (typeof pi.sendMessage !== "function") return;

    const message = await renderBrainBriefing(home);
    pi.sendMessage(message);
  });
}
