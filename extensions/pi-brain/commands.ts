import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { writeFile, mkdir, copyFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import type { BrainHome } from "./types.ts";
import { execFilePromise, pathExists, countInboxItems, listInboxItems } from "./utils.ts";
import { readOrg, readAutonomy, writeAutonomy, countPages, countSources, countPagesByKind, readInbox } from "./brain-home.ts";
import { resolveResource, getPackageRoot } from "./resources.ts";
import { searchFiles } from "./search.ts";
import { validateMarkdown, regenerateViews } from "./views.ts";
import { requireBrain } from "./context.ts";
import { registerCollaboration } from "./collaboration.ts";
import { registerBuild } from "./build.ts";

export function registerCommands(pi: ExtensionAPI, lastSystemPrompt: { current: string }) {
  registerCollaboration(pi);
  registerBuild(pi);
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
      ctx.ui.notify(`Captured: ${id}`, "success");
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

  pi.registerCommand("brain:sync", {
    description: "Run a pi-brain health sweep",
    handler: async (_args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const errors = await validateMarkdown(home);
      const viewMessage = await regenerateViews(home);
      const errorText = errors.length > 0 ? errors.map((e) => `${e.path}: ${e.errors.join(", ")}`).join("\n") : "No validation errors.";
      ctx.ui.notify(`${viewMessage}\n${errorText}`, errors.length > 0 ? "warning" : "success");
    },
  });

  pi.registerCommand("brain:update", {
    description: "Pull upstream pi-brain template updates into this clone",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const tokens = args.trim().split(/\s+/).filter(Boolean);
      const apply = tokens.includes("--apply");
      const versionFlag = tokens.find((t) => t.startsWith("--version="));
      const version = versionFlag ? versionFlag.replace("--version=", "") : undefined;
      pi.sendUserMessage(`/tool:brain_update ${apply ? "apply=true " : ""}${version ? `version=${version}` : ""}`.trim());
    },
  });

  pi.registerCommand("brain:shape", {
    description: "Human-gated ADR/PRD/epic/bet authoring in pi-brain",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const message = args.trim() ? `/skill:brain-shape ${args.trim()}` : "/skill:brain-shape";
      pi.sendUserMessage(message);
    },
  });

  pi.registerCommand("brain:in", {
    description: "Ingest a file, directory, or URL into sources/",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      if (!args.trim()) {
        ctx.ui.notify("Usage: /brain:in <path-or-url> [kind] [summary]", "warning");
        return;
      }
      const message = `/skill:brain-ingest ${args.trim()}`;
      pi.sendUserMessage(message);
    },
  });

  pi.registerCommand("brain:setup", {
    description: "Set up or reconfigure this directory as a pi-brain home",
    handler: async (_args, ctx) => {
      if (!ctx.hasUI) {
        ctx.ui.notify("/brain:setup requires interactive TUI mode", "error");
        return;
      }

      const cwd = ctx.cwd;
      const alreadyHome = await pathExists(join(cwd, "brain.config.yml"));

      if (alreadyHome) {
        const ok = await ctx.ui.confirm("pi-brain setup", "This directory is already configured. Reconfigure?");
        if (!ok) return;
      }

      const defaultOrg = alreadyHome ? (await readOrg({ path: cwd })) : "my-project";
      const org = await ctx.ui.input("Organisation or project name", defaultOrg);
      if (!org || !org.trim()) return;

      const defaultRepos = alreadyHome
        ? ""
        : cwd.split(/[\\/]/).pop() ?? "my-project";
      const reposInput = await ctx.ui.input("Active repos (comma-separated)", defaultRepos);
      const repos = (reposInput ?? "")
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean);

      const configLines = [
        `# pi-brain configuration for ${org.trim()}.`,
        "",
        `org: \"${org.trim()}\"`,
        "",
        "active_repos:",
        ...repos.map((r) => `  - ${r}`),
        "",
        "archived_repos: []",
        "",
        "connectors:",
        "  github:",
        "    repos: []",
        "  notion:",
        "    pages: []",
        "  slack:",
        "    channels: []",
        "  datadog:",
        '    site: ""',
        "  langfuse:",
        '    host: ""',
        "  structure:",
        "    repos: []",
        "",
        "# Extract decisions/constraints/open questions before pi compacts context.",
        "harvest_compaction: true",
        "harvest_compaction_max_items: 5",
        "harvest_compaction_min_score: 1",
        "",
        "# Inject relevant brain records/constraints into agent context.",
        "inject_context: true",
        "inject_context_max_records: 2",
        "inject_context_min_score: 0",
        "",
        "# Enrich tool results with citations, related records, and size warnings.",
        "enrich_tool_results: true",
        "enrich_tool_results_max_related: 2",
        "enrich_tool_results_large_threshold: 4000",
        "",
        "# Register pi-brain keyboard shortcuts and CLI flags.",
        "brain_shortcuts: true",
        "",
        "# Publish lightweight state events on pi.events for cross-extension use.",
        "brain_event_bus: true",
        "",
        "# Clean up session-scoped state on shutdown.",
        "brain_session_shutdown: true",
        "",
        "# pi-brain template version this clone was created from or last updated to.",
        `template_version: "v0.3.2"`,
        "",
      ];
      await writeFile(join(cwd, "brain.config.yml"), configLines.join("\n"), "utf-8");

      await mkdir(join(cwd, "wiki", "_state"), { recursive: true });
      await mkdir(join(cwd, "sources"), { recursive: true });
      await mkdir(join(cwd, "log"), { recursive: true });
      await mkdir(join(cwd, ".brain", "overrides"), { recursive: true });

      const indexPath = join(cwd, "wiki", "index.md");
      if (!(await pathExists(indexPath))) {
        await writeFile(
          indexPath,
          "---\nkind: meta\nstatus: living\nconfidence: high\n---\n\n# Home\n\nWelcome to the pi-brain home for this project.\n",
          "utf-8"
        );
      }

      const inboxPath = join(cwd, "wiki", "_state", "inbox.md");
      if (!(await pathExists(inboxPath))) {
        await writeFile(
          inboxPath,
          "---\nkind: inbox\n---\n\n# Inbox\n\nQueued items waiting to be digested.\n",
          "utf-8"
        );
      }

      const sourcesReadmePath = join(cwd, "sources", "README.md");
      if (!(await pathExists(sourcesReadmePath))) {
        await writeFile(
          sourcesReadmePath,
          "# sources\n\nImmutable inputs for this pi-brain instance.\n",
          "utf-8"
        );
      }

      const logPath = join(cwd, "log", "log.md");
      if (!(await pathExists(logPath))) {
        await writeFile(logPath, "# log\n\nAppend-only operations log.\n", "utf-8");
      }

      const home: BrainHome = { path: cwd };
      await regenerateViews(home);
      const errors = await validateMarkdown(home);

      const gitDir = join(cwd, ".git");
      if (await pathExists(gitDir)) {
        const installHook = await ctx.ui.confirm("pi-brain setup", "Install the pre-commit validation hook?");
        if (installHook) {
          const hookSource = join(cwd, "tools", "git-hooks", "pre-commit");
          const hookTarget = join(gitDir, "hooks", "pre-commit");
          if (await pathExists(hookTarget)) {
            await unlink(hookTarget);
          }
          await copyFile(hookSource, hookTarget);
        }
      }

      ctx.ui.notify(
        `pi-brain set up for ${org.trim()}\nRepos: ${repos.join(", ") || "none"}\n${errors.length > 0 ? "Validation warnings present." : "Ready to capture, ingest, and shape."}`,
        errors.length > 0 ? "warning" : "success"
      );
    },
  });

  pi.registerCommand("brain:connect", {
    description: "Run configured pull connectors to snapshot external sources",
    handler: async (_args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const script = await resolveResource(join("tools", "connectors", "run.mjs"), home);
      if (!(await pathExists(script))) {
        ctx.ui.notify("Connector runner not found", "error");
        return;
      }
      const result = await execFilePromise("node", [script], { cwd: home.path });
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
      ctx.ui.notify(output || "Connectors finished.", result.code === 0 ? "success" : "error");
    },
  });

  pi.registerCommand("brain:auto", {
    description: "Toggle autonomous brain-maintenance mode",
    handler: async (_args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const state = await readAutonomy(home);
      state.enabled = !state.enabled;
      await writeAutonomy(home, state);
      ctx.ui.notify(
        state.enabled
          ? "Autonomy ON — pi will proactively maintain the brain this session."
          : "Autonomy OFF — pi will only use brain tools when explicitly asked.",
        "info"
      );
    },
  });

  pi.registerCommand("brain:continue", {
    description: "Continue in-flight pi-brain work",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const message = args.trim() ? `/skill:brain-continue ${args.trim()}` : "/skill:brain-continue";
      pi.sendUserMessage(message);
    },
  });

  pi.registerCommand("brain:investigate", {
    description: "Investigate a bug, risk, or open question",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      if (!args.trim()) {
        ctx.ui.notify("Usage: /brain:investigate <question>", "warning");
        return;
      }
      pi.sendUserMessage(`/skill:brain-investigate ${args.trim()}`);
    },
  });


  pi.registerCommand("brain:links", {
    description: "Derive and show the pi-brain link graph",
    handler: async (_args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const script = await resolveResource(join("tools", "brain-links.mjs"), home);
      if (!(await pathExists(script))) {
        ctx.ui.notify("Link graph runner not found", "error");
        return;
      }
      const result = await execFilePromise("node", [script], { cwd: home.path });
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
      ctx.ui.notify(output || "Link graph finished.", result.code === 0 ? "success" : "error");
    },
  });


  pi.registerCommand("brain:groom", {
    description: "Groom the pi-brain corpus",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const message = args.trim() ? `/skill:brain-groom ${args.trim()}` : "/skill:brain-groom";
      pi.sendUserMessage(message);
    },
  });


  pi.registerCommand("brain:state", {
    description: "Regenerate state, roadmap, and options pages",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const script = await resolveResource(join("tools", "brain-state.mjs"), home);
      if (!(await pathExists(script))) {
        ctx.ui.notify("State runner not found", "error");
        return;
      }
      const cmdArgs = args.trim() ? [script, args.trim()] : [script];
      const result = await execFilePromise("node", cmdArgs, { cwd: home.path });
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
      ctx.ui.notify(output || "State pages regenerated.", result.code === 0 ? "success" : "error");
    },
  });


  pi.registerCommand("brain:deepdive", {
    description: "Transiently read a target repo file/directory for shaping/investigation",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const [target, ...rest] = args.trim().split(/\s+/);
      if (!target) {
        ctx.ui.notify("Usage: /brain:deepdive <path> [question]", "error");
        return;
      }
      const question = rest.join(" ");
      const result = await pi.tools.brain_deepdive({ target, question });
      ctx.ui.notify(result.content[0].text.slice(0, 200), "success");
    },
  });


  pi.registerCommand("brain:ingest-repo", {
    description: "Onboard a repository as a maintained pi-brain project",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const [target, scope] = args.trim().split(/\s+/);
      if (!target) {
        ctx.ui.notify("Usage: /brain:ingest-repo <path-or-url> [scope]", "error");
        return;
      }
      const script = await resolveResource(join("tools", "brain-ingest-repo.mjs"), home);
      if (!(await pathExists(script))) {
        ctx.ui.notify("Repo ingest runner not found", "error");
        return;
      }
      const cmdArgs = scope ? [script, target, scope] : [script, target];
      const result = await execFilePromise("node", cmdArgs, { cwd: home.path });
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
      ctx.ui.notify(output || "Repo ingested.", result.code === 0 ? "success" : "error");
    },
  });


  pi.registerCommand("brain:projects", {
    description: "List onboarded pi-brain projects",
    handler: async (_args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const script = await resolveResource(join("tools", "brain-projects.mjs"), home);
      if (!(await pathExists(script))) {
        ctx.ui.notify("Projects runner not found", "error");
        return;
      }
      const result = await execFilePromise("node", [script], { cwd: home.path });
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
      ctx.ui.notify(output || "No projects found.", result.code === 0 ? "success" : "error");
    },
  });


  pi.registerCommand("brain:dump-prompt", {
    description: "[Phase 0 baseline] Dump the last system prompt seen before_agent_start to tests/fixtures/",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const fileName = args.trim() || `prompt-${new Date().toISOString().slice(0, 10)}.txt`;
      const fixturesDir = join(home.path, "tests", "fixtures");
      await mkdir(fixturesDir, { recursive: true });
      const outPath = join(fixturesDir, fileName);
      await writeFile(outPath, lastSystemPrompt.current || "(no system prompt captured yet)\n", "utf-8");
      ctx.ui.notify(`Dumped system prompt to tests/fixtures/${fileName}`, "info");
    },
  });

  pi.registerCommand("brain:convert", {
    description: "Convert the current repository into a pi-brain clone",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (home) {
        ctx.ui.notify("This directory already looks like a pi-brain home.", "error");
        return;
      }
      const script = join(getPackageRoot(), "tools", "brain-convert.mjs");
      if (!(await pathExists(script))) {
        ctx.ui.notify("Convert runner not found", "error");
        return;
      }
      const tokens = args.trim().split(/\s+/).filter(Boolean);
      const dryRun = tokens.includes("--dry-run");
      const subdir = tokens.find((t) => t !== "--dry-run");
      const cmdArgs = [script];
      if (subdir) cmdArgs.push(subdir);
      if (dryRun) cmdArgs.push("--dry-run");
      const result = await execFilePromise("node", cmdArgs, { cwd: ctx.cwd });
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
      ctx.ui.notify(output || "Conversion complete.", result.code === 0 ? "success" : "error");
    },
  });

}
