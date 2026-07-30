import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { readFile, writeFile, readdir, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { execFilePromise, pathExists, countInboxItems, listInboxItems } from "./utils.ts";
import { readOrg, readAutonomy, writeAutonomy, countPages, countSources, countPagesByKind, readInbox } from "./brain-home.ts";
import { resolveResource, readPackageVersion } from "./resources.ts";
import { searchFiles } from "./search.ts";
import { validateMarkdown, regenerateViews } from "./views.ts";
import { appendInboxItem, appendAutoIngestBatch, appendLog, ingestFile, ingestDirectory, ingestUrl } from "./inbox.ts";
import { requireBrain, setupHint } from "./context.ts";
import { wrapTool } from "./tool-wrapper.ts";
import {
  getLatestTemplateVersion,
  cloneUpstreamTemplate,
  readTemplateVersion,
  updateTemplateVersion,
  diffTemplatePaths,
  applyTemplateChange,
} from "./template-update.ts";

export async function findRecentSources(home: { path: string }, since: number): Promise<string[]> {
  const sourcesDir = join(home.path, "sources");
  if (!(await pathExists(sourcesDir))) return [];

  const results: string[] = [];
  async function walk(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile()) {
        const info = await stat(fullPath);
        if (info.mtimeMs >= since || info.birthtimeMs >= since) {
          results.push(relative(home.path, fullPath));
        }
      }
    }
  }
  await walk(sourcesDir);
  return results;
}

export function registerTools(pi: ExtensionAPI) {

  pi.registerTool({
    name: "brain_status",
    label: "Brain status",
    description: "Read the pi-brain status dashboard and inbox summary.",
    parameters: Type.Object({}),
    constrainedSampling: { type: "json_schema" as const, strict: "prefer" as const },
    async execute(_toolCallId: string, _params: any, _signal: AbortSignal | undefined, _onUpdate: unknown, ctx: ExtensionContext) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text" as const, text: setupHint() }], details: {} };

      const org = await readOrg(home);
      const pages = await countPages(home);
      const sources = await countSources(home);
      const inbox = await readInbox(home);
      const inboxCount = countInboxItems(inbox);
      const kindCounts = await countPagesByKind(home);
      const recentItems = listInboxItems(inbox, 5);

      const kindLines = Array.from(kindCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([kind, count]) => `  ${kind}: ${count}`);

      const inboxLines = recentItems.map((item) => {
        const summary = item.summary.length > 80 ? item.summary.slice(0, 77) + "..." : item.summary;
        return `  • ${summary}`;
      });

      return {
        content: [
          {
            type: "text",
            text: [
              `Org: ${org}`,
              `Wiki pages: ${pages}`,
              `Sources: ${sources}`,
              `Inbox items: ${inboxCount}`,
              "",
              "Pages by kind:",
              ...kindLines,
              "",
              inboxCount > 0 ? "Needs you:" : "Inbox empty.",
              ...inboxLines,
            ].join("\n"),
          },
        ],
        details: {},
      };
    },
  });

  const brainCaptureTool = {
    name: "brain_capture",
    label: "Brain capture",
    description: "Capture a note into the pi-brain inbox.",
    parameters: Type.Object({
      note: Type.String({ description: "The note to capture." }),
      scope: Type.Optional(Type.String({ description: "Optional repo/org/brain scope." })),
      kind: Type.Optional(Type.Union(
        [
          Type.Literal("decision"),
          Type.Literal("insight"),
          Type.Literal("task"),
          Type.Literal("source"),
        ],
        { description: "Optional kind: decision, insight, task, source." }
      )),
    }),
    constrainedSampling: { type: "json_schema" as const, strict: "prefer" as const },
    async execute(_toolCallId: string, params: any, _signal: AbortSignal | undefined, _onUpdate: unknown, ctx: ExtensionContext) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text" as const, text: setupHint() }], details: {} };

      const id = params.note
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 48)
        .replace(/(^-|-$)/g, "") || "capture";
      const date = new Date().toISOString().slice(0, 10);
      const kind = params.kind ?? "task";
      const scope = params.scope ?? "brain";

      const entry = [
        "",
        `### ${id} (${date})`,
        "",
        `- **kind:** ${kind}`,
        `- **scope:** ${scope}`,
        `- **summary:** ${params.note}`,
        "",
      ].join("\n");

      const inboxPath = join(home.path, "wiki", "_state", "inbox.md");
      const current = await readInbox(home);
      await writeFile(inboxPath, current.trimEnd() + entry + "\n", "utf-8");

      return {
        content: [{ type: "text" as const, text: `Captured to inbox: ${id}` }],
        details: {},
      };
    },
  };

  // Dogfood the wrapper policy on a brain-internal tool: the base capture
  // always succeeds, and the after-hook just appends a log entry. If the
  // hook fails, the capture is preserved.
  brainCaptureTool.execute = wrapTool(brainCaptureTool.execute, {
    name: "brain_capture",
    after: async (_result, [_toolCallId, params, _signal, _onUpdate, ctx]) => {
      const home = await requireBrain(ctx.cwd);
      if (!home) return;
      await appendLog(home, `capture: ${params.note.slice(0, 120)}`);
    },
  });

  pi.registerTool(brainCaptureTool);

  pi.registerTool({
    name: "brain_ask",
    label: "Brain ask",
    description: "Ask the pi-brain a question over the wiki and sources corpus.",
    parameters: Type.Object({
      question: Type.String({ description: "The question to ask." }),
    }),
    constrainedSampling: { type: "json_schema" as const, strict: "prefer" as const },
    async execute(_toolCallId: string, params: any, _signal: AbortSignal | undefined, _onUpdate: unknown, ctx: ExtensionContext) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text" as const, text: setupHint() }], details: {} };

      const results = await searchFiles(home, params.question);
      if (results.length === 0) {
        return { content: [{ type: "text" as const, text: "No matches found." }], details: {} };
      }

      const text = results
        .map((r) => `[score ${r.score}] ${r.path}\n  ${r.snippet}`)
        .join("\n\n");
      return { content: [{ type: "text", text }], details: {} };
    },
  });

  pi.registerTool({
    name: "brain_tend",
    label: "Brain tend",
    description: "List the pi-brain inbox queue.",
    parameters: Type.Object({}),
    constrainedSampling: { type: "json_schema" as const, strict: "prefer" as const },
    async execute(_toolCallId: string, _params: any, _signal: AbortSignal | undefined, _onUpdate: unknown, ctx: ExtensionContext) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text" as const, text: setupHint() }], details: {} };

      const inbox = await readInbox(home);
      const count = countInboxItems(inbox);
      return {
        content: [
          {
            type: "text",
            text: `Inbox items: ${count}\n\n${inbox.slice(0, 3000)}\n\nAsk the user which items to digest.`,
          },
        ],
        details: {},
      };
    },
  });

  pi.registerTool({
    name: "brain_validate",
    label: "Brain validate",
    description: "Validate frontmatter conformance of wiki pages.",
    parameters: Type.Object({}),
    constrainedSampling: { type: "json_schema" as const, strict: "prefer" as const },
    async execute(_toolCallId: string, _params: any, _signal: AbortSignal | undefined, _onUpdate: unknown, ctx: ExtensionContext) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text" as const, text: setupHint() }], details: {} };

      const errors = await validateMarkdown(home);
      if (errors.length === 0) {
        return { content: [{ type: "text" as const, text: "All wiki pages pass frontmatter validation." }], details: {} };
      }

      const text = errors.map((e) => `${e.path}: ${e.errors.join(", ")}`).join("\n");
      return { content: [{ type: "text", text }], details: {} };
    },
  });

  pi.registerTool({
    name: "brain_views",
    label: "Brain views",
    description: "Regenerate the pi-brain index view from the wiki corpus.",
    parameters: Type.Object({}),
    constrainedSampling: { type: "json_schema" as const, strict: "prefer" as const },
    async execute(_toolCallId: string, _params: any, _signal: AbortSignal | undefined, _onUpdate: unknown, ctx: ExtensionContext) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text" as const, text: setupHint() }], details: {} };

      const message = await regenerateViews(home);
      return { content: [{ type: "text" as const, text: message }], details: {} };
    },
  });

  pi.registerTool({
    name: "brain_sync",
    label: "Brain sync",
    description: "Run validate and regenerate views.",
    parameters: Type.Object({}),
    constrainedSampling: { type: "json_schema" as const, strict: "prefer" as const },
    async execute(_toolCallId: string, _params: any, _signal: AbortSignal | undefined, _onUpdate: unknown, ctx: ExtensionContext) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text" as const, text: setupHint() }], details: {} };

      const errors = await validateMarkdown(home);
      const viewMessage = await regenerateViews(home);
      const errorText = errors.length > 0 ? errors.map((e) => `${e.path}: ${e.errors.join(", ")}`).join("\n") : "No validation errors.";

      return {
        content: [{ type: "text" as const, text: `${viewMessage}\n\n${errorText}` }],
        details: {},
      };
    },
  });

  pi.registerTool({
    name: "brain_update",
    label: "Brain update",
    description: "Update pi-brain. Tries the package-manager path first, then falls back to the legacy GitHub release diff/apply flow.",
    parameters: Type.Object({
      version: Type.Optional(Type.String({ description: "Target version tag (e.g., v0.2.2). Defaults to latest." })),
      apply: Type.Optional(Type.Boolean({ description: "If true, apply changes. If false, show the diff summary." })),
    }),
    constrainedSampling: { type: "json_schema" as const, strict: "prefer" as const },
    async execute(_toolCallId: string, params: any, _signal: AbortSignal | undefined, _onUpdate: unknown, ctx: ExtensionContext) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text" as const, text: setupHint() }], details: {} };

      const targetVersion = params.version || "latest";
      const packageRef = targetVersion === "latest"
        ? "@misabegovic/pi-brain@latest"
        : `@misabegovic/pi-brain@${targetVersion}`;

      // Primary path: package-manager update.
      const pkgResult = await execFilePromise("pi", ["install", packageRef], { cwd: home.path });
      if (pkgResult.code === 0) {
        await updateTemplateVersion(home, targetVersion === "latest" ? `v${(await readPackageVersion())}` : targetVersion);
        await appendLog(home, `applied package update to ${packageRef}`);
        return {
          content: [{
            type: "text",
            text: `Package update succeeded: ${packageRef}\n${pkgResult.stdout}\n\nYour global pi-brain installation is now up to date.`,
          }],
          details: {},
        };
      }

      // Fallback path: legacy GitHub release diff/apply.
      try {
        const currentVersion = await readTemplateVersion(home);
        const ghTargetVersion = params.version || (await getLatestTemplateVersion());

        if (currentVersion === ghTargetVersion) {
          return {
            content: [{ type: "text" as const, text: `Package update failed; GitHub fallback shows this clone is already on template version ${ghTargetVersion}.\n\nPackage error:\n${pkgResult.stderr || pkgResult.stdout}` }],
            details: {},
          };
        }

        const upstreamDir = await cloneUpstreamTemplate(home, ghTargetVersion);
        const changes = await diffTemplatePaths(home, upstreamDir);

        if (changes.length === 0) {
          return {
            content: [{ type: "text" as const, text: `Package update failed; GitHub fallback found no template-owned changes between ${currentVersion || "unknown"} and ${ghTargetVersion}.\n\nPackage error:\n${pkgResult.stderr || pkgResult.stdout}` }],
            details: {},
          };
        }

        const summary = changes.map((c) => `- ${c.status}: ${c.path}`).join("\n");

        if (!params.apply) {
          return {
            content: [{
              type: "text",
              text: `Package update failed; GitHub fallback diff from ${currentVersion || "unknown"} to ${ghTargetVersion}:\n${summary}\n\nPackage error:\n${pkgResult.stderr || pkgResult.stdout}\n\nRun again with apply=true to apply these GitHub-fallback changes, or run \`pi install ${packageRef}\` manually.`,
            }],
            details: {},
          };
        }

        for (const change of changes) {
          await applyTemplateChange(home, upstreamDir, change);
        }
        await updateTemplateVersion(home, ghTargetVersion);
        await appendLog(home, `applied GitHub-fallback template update from ${currentVersion || "unknown"} to ${ghTargetVersion}`);

        return {
          content: [{
            type: "text",
            text: `Package update failed; applied ${changes.length} GitHub-fallback change(s) from ${currentVersion || "unknown"} to ${ghTargetVersion}.\n${summary}\n\nPackage error:\n${pkgResult.stderr || pkgResult.stdout}`,
          }],
          details: {},
        };
      } catch (err: any) {
        return {
          content: [{ type: "text" as const, text: `Update failed. Package path failed and GitHub fallback also failed.\n\nPackage error:\n${pkgResult.stderr || pkgResult.stdout}\n\nFallback error: ${err?.message ?? err}` }],
          details: {},
        };
      }
    },
  });

  pi.registerTool({
    name: "brain_pull_connectors",
    label: "Brain pull connectors",
    description: "Run configured pull connectors (GitHub, etc.) to snapshot external sources into sources/.",
    parameters: Type.Object({}),
    constrainedSampling: { type: "json_schema" as const, strict: "prefer" as const },
    async execute(_toolCallId: string, _params: any, _signal: AbortSignal | undefined, _onUpdate: unknown, ctx: ExtensionContext) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text" as const, text: setupHint() }], details: {} };

      const script = await resolveResource(join("tools", "connectors", "run.mjs"), home);
      if (!(await pathExists(script))) {
        return { content: [{ type: "text" as const, text: "Connector runner not found at tools/connectors/run.mjs" }], details: {} };
      }

      const startTime = Date.now();
      const autonomy = await readAutonomy(home);
      const result = await execFilePromise("node", [script], { cwd: home.path });
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");

      if (autonomy.enabled) {
        const recent = await findRecentSources(home, startTime);
        for (const path of recent) {
          await appendAutoIngestBatch(home, `auto-connect: ${path}`, join(home.path, path));
        }
      }

      return {
        content: [{ type: "text" as const, text: output || "Connectors finished with no output." }],
        details: {},
      };
    },
  });

  pi.registerTool({
    name: "brain_autonomy",
    label: "Brain autonomy",
    description: "Read or toggle the autonomous brain-maintenance mode.",
    parameters: Type.Object({
      enabled: Type.Optional(Type.Boolean({ description: "Set to true/false to toggle; omit to read current state." })),
    }),
    constrainedSampling: { type: "json_schema" as const, strict: "prefer" as const },
    async execute(_toolCallId: string, params: any, _signal: AbortSignal | undefined, _onUpdate: unknown, ctx: ExtensionContext) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text" as const, text: setupHint() }], details: {} };

      const state = await readAutonomy(home);
      if (params.enabled !== undefined) {
        state.enabled = params.enabled;
        await writeAutonomy(home, state);
      }

      return {
        content: [
          {
            type: "text",
            text: `Autonomy is ${state.enabled ? "ON" : "OFF"}. ${
              state.enabled
                ? "The agent will proactively maintain the brain this session."
                : "The agent will only use brain tools when explicitly asked."
            }`,
          },
        ],
        details: {},
      };
    },
  });







  pi.registerTool({
    name: "brain_convert",
    label: "Brain convert",
    description: "Convert the current repository into a pi-brain clone by moving project code into a subdirectory and scaffolding the brain structure.",
    parameters: Type.Object({
      subdir: Type.Optional(Type.String({ description: "Subdirectory for existing project code (default: files)." })),
      dry_run: Type.Optional(Type.Boolean({ description: "Preview the conversion without moving files." })),
    }),
    constrainedSampling: { type: "json_schema" as const, strict: "prefer" as const },
    async execute(_toolCallId: string, params: any, _signal: AbortSignal | undefined, _onUpdate: unknown, ctx: ExtensionContext) {
      const home = await requireBrain(ctx.cwd);
      if (home) {
        return { content: [{ type: "text" as const, text: "This directory already looks like a pi-brain home. Aborting to avoid data loss." }], details: {} };
      }

      const script = join(ctx.cwd, "tools", "brain-convert.mjs");
      if (!(await pathExists(script))) {
        return { content: [{ type: "text" as const, text: "Convert runner not found at tools/brain-convert.mjs" }], details: {} };
      }

      const args = [script];
      if (params.subdir) args.push(params.subdir);
      if (params.dry_run) args.push("--dry-run");
      const result = await execFilePromise("node", args, { cwd: ctx.cwd });
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
      return {
        content: [{ type: "text" as const, text: output || "Conversion complete." }],
        details: {},
      };
    },
  });
  pi.registerTool({
    name: "brain_projects",
    label: "Brain projects",
    description: "List onboarded projects in this pi-brain clone.",
    parameters: Type.Object({}),
    constrainedSampling: { type: "json_schema" as const, strict: "prefer" as const },
    async execute(_toolCallId: string, _params: any, _signal: AbortSignal | undefined, _onUpdate: unknown, ctx: ExtensionContext) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text" as const, text: setupHint() }], details: {} };

      const script = await resolveResource(join("tools", "brain-projects.mjs"), home);
      if (!(await pathExists(script))) {
        return { content: [{ type: "text" as const, text: "Projects runner not found at tools/brain-projects.mjs" }], details: {} };
      }

      const result = await execFilePromise("node", [script], { cwd: home.path });
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
      return {
        content: [{ type: "text" as const, text: output || "No projects found." }],
        details: {},
      };
    },
  });
  pi.registerTool({
    name: "brain_ingest_repo",
    label: "Brain ingest repo",
    description: "Onboard a repository as a maintained project: snapshot into sources/repos/<scope>/, scaffold wiki/<scope>/, and add to active_repos.",
    parameters: Type.Object({
      target: Type.String({ description: "Path or URL to the repository." }),
      scope: Type.Optional(Type.String({ description: "Scope name (default: repo basename)." })),
    }),
    constrainedSampling: { type: "json_schema" as const, strict: "prefer" as const },
    async execute(_toolCallId: string, params: any, _signal: AbortSignal | undefined, _onUpdate: unknown, ctx: ExtensionContext) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text" as const, text: setupHint() }], details: {} };

      const script = await resolveResource(join("tools", "brain-ingest-repo.mjs"), home);
      if (!(await pathExists(script))) {
        return { content: [{ type: "text" as const, text: "Repo ingest runner not found at tools/brain-ingest-repo.mjs" }], details: {} };
      }

      const args = params.scope ? [script, params.target, params.scope] : [script, params.target];
      const result = await execFilePromise("node", args, { cwd: home.path });
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
      return {
        content: [{ type: "text" as const, text: output || "Repo ingested." }],
        details: {},
      };
    },
  });
  pi.registerTool({
    name: "brain_deepdive",
    label: "Brain deepdive",
    description: "Read a file or directory in a target repository transiently for shaping/investigation. Does NOT copy content into sources/.",
    parameters: Type.Object({
      target: Type.String({ description: "Absolute or relative path to a file or directory." }),
      question: Type.Optional(Type.String({ description: "What to look for." })),
      max_files: Type.Optional(Type.Number({ description: "Max files to read when target is a directory.", default: 10 })),
      store: Type.Optional(Type.Boolean({ description: "Store a lightweight record in wiki/_state/deepdives.json.", default: true })),
    }),
    constrainedSampling: { type: "json_schema" as const, strict: "prefer" as const },
    async execute(_toolCallId: string, params: any, _signal: AbortSignal | undefined, _onUpdate: unknown, ctx: ExtensionContext) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text" as const, text: setupHint() }], details: { files: [] } };

      const target = resolve(params.target);
      if (!(await pathExists(target))) {
        return { content: [{ type: "text" as const, text: `Target not found: ${target}` }], details: { files: [] } };
      }

      const maxFiles = params.max_files ?? 10;
      const fileStat = await stat(target);
      const records = [];

      async function* walk(dir: string, depth = 0): AsyncGenerator<string> {
        if (depth > 2) return;
        const entries = await readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "dist" || entry.name === "build") continue;
          const full = join(dir, entry.name);
          if (entry.isDirectory()) {
            yield* walk(full, depth + 1);
          } else {
            yield full;
          }
        }
      }

      if (fileStat.isFile()) {
        const content = await readFile(target, "utf-8");
        records.push({ path: target, kind: "file", snippet: content.slice(0, 50000) });
      } else if (fileStat.isDirectory()) {
        const files: string[] = [];
        for await (const f of walk(target)) {
          files.push(f);
          if (files.length >= maxFiles) break;
        }
        for (const f of files) {
          try {
            const content = await readFile(f, "utf-8");
            records.push({ path: f, kind: "file", snippet: content.slice(0, 10000) });
          } catch {
            // skip unreadable
          }
        }
      }

      if (params.store !== false) {
        const recordFile = join(home.path, "wiki", "_state", "deepdives.json");
        let existing: any[] = [];
        try {
          existing = JSON.parse(await readFile(recordFile, "utf-8"));
        } catch {
          // empty
        }
        existing.push({
          at: new Date().toISOString(),
          target,
          question: params.question ?? "",
          files: records.map((r) => r.path),
        });
        await writeFile(recordFile, JSON.stringify(existing.slice(-50), null, 2), "utf-8");
      }

      const questionLine = params.question ? `Question: ${params.question}\n` : "";
      const summary = records.map((r) => `--- ${r.path} ---\n${r.snippet}`).join("\n\n");
      return {
        content: [{ type: "text" as const, text: `${questionLine}Deepdive into ${target}\n\n${summary}` }],
        details: { files: records.map((r) => r.path) },
      };
    },
  });
  pi.registerTool({
    name: "brain_state",
    label: "Brain state",
    description: "Regenerate state, roadmap, and options pages from the corpus.",
    parameters: Type.Object({
      scope: Type.Optional(Type.String({ description: "Scope to regenerate (default: org)." })),
    }),
    constrainedSampling: { type: "json_schema" as const, strict: "prefer" as const },
    async execute(_toolCallId: string, params: any, _signal: AbortSignal | undefined, _onUpdate: unknown, ctx: ExtensionContext) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text" as const, text: setupHint() }], details: {} };

      const script = await resolveResource(join("tools", "brain-state.mjs"), home);
      if (!(await pathExists(script))) {
        return { content: [{ type: "text" as const, text: "State runner not found at tools/brain-state.mjs" }], details: {} };
      }

      const args = params.scope ? [script, params.scope] : [script];
      const result = await execFilePromise("node", args, { cwd: home.path });
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
      return {
        content: [{ type: "text" as const, text: output || "State pages regenerated." }],
        details: {},
      };
    },
  });
  pi.registerTool({
    name: "brain_links",
    label: "Brain links",
    description: "Derive the pi-brain link graph: orphans, hubs, dead links, and suggestions.",
    parameters: Type.Object({}),
    constrainedSampling: { type: "json_schema" as const, strict: "prefer" as const },
    async execute(_toolCallId: string, _params: any, _signal: AbortSignal | undefined, _onUpdate: unknown, ctx: ExtensionContext) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text" as const, text: setupHint() }], details: {} };

      const script = await resolveResource(join("tools", "brain-links.mjs"), home);
      if (!(await pathExists(script))) {
        return { content: [{ type: "text" as const, text: "Link graph runner not found at tools/brain-links.mjs" }], details: {} };
      }

      const result = await execFilePromise("node", [script], { cwd: home.path });
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
      return {
        content: [{ type: "text" as const, text: output || "Link graph finished with no output." }],
        details: {},
      };
    },
  });
  pi.registerTool({
    name: "brain_ingest",
    label: "Brain ingest",
    description: "Ingest a file, directory, or URL into sources/ and queue synthesis in the inbox.",
    parameters: Type.Object({
      source: Type.String({ description: "File path, directory path, or URL to ingest." }),
      kind: Type.Optional(
        Type.String({
          description: "Source kind: repo, doc, conversation, web. Auto-detected by default.",
        })
      ),
      summary: Type.Optional(Type.String({ description: "Optional one-line summary of the source." })),
    }),
    constrainedSampling: { type: "json_schema" as const, strict: "prefer" as const },
    async execute(_toolCallId: string, params: any, _signal: AbortSignal | undefined, _onUpdate: unknown, ctx: ExtensionContext) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text" as const, text: setupHint() }], details: {} };

      const isUrl = /^https?:\/\//i.test(params.source);
      let sourcePath = params.source;
      if (!isUrl) {
        sourcePath = resolve(ctx.cwd, params.source);
      }

      let detectedKind = params.kind;
      if (!detectedKind) {
        if (isUrl) detectedKind = "web";
        else {
          const s = await stat(sourcePath).catch(() => null);
          if (s?.isDirectory()) detectedKind = "repo";
          else detectedKind = "doc";
        }
      }

      try {
        let targetPath: string;
        if (isUrl) {
          targetPath = await ingestUrl(home, params.source, detectedKind, params.summary);
        } else {
          const s = await stat(sourcePath);
          if (s.isDirectory()) {
            targetPath = await ingestDirectory(home, sourcePath, detectedKind, params.summary);
          } else {
            targetPath = await ingestFile(home, sourcePath, detectedKind, params.summary);
          }
        }

        const relativePath = relative(home.path, targetPath);
        const autonomy = await readAutonomy(home);
        if (autonomy.enabled) {
          await appendAutoIngestBatch(home, params.source, targetPath);
        } else {
          const note = `Ingested ${params.source} → ${relativePath}. Synthesize into wiki if useful.`;
          await appendInboxItem(home, `ingest-${params.source}`, note);
        }

        return {
          content: [{ type: "text" as const, text: `Ingested to ${relativePath}` }],
          details: {},
        };
      } catch (err: any) {
        return {
          content: [{ type: "text" as const, text: `Ingest failed: ${err?.message ?? err}` }],
          details: {},
        };
      }
    },
  });

}
