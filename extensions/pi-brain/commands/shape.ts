import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { writeFile, mkdir, copyFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { pathExists } from "../utils.ts";
import { readOrg } from "../brain-home.ts";
import { validateMarkdown, regenerateViews } from "../views.ts";
import { requireBrain } from "../context.ts";

export function registerShapeCommands(pi: ExtensionAPI) {
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
        `org: "${org.trim()}"`,
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

      const home = { path: cwd };
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
        errors.length > 0 ? "warning" : "info"
      );
    },
  });
}
