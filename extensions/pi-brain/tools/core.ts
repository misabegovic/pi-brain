import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { writeFile } from "node:fs/promises";
import { join as pathJoin } from "node:path";
import { countInboxItems, listInboxItems } from "../utils.ts";
import { readOrg, countPages, countSources, countPagesByKind, readInbox } from "../brain-home.ts";
import { searchFiles } from "../search.ts";
import { validateMarkdown, regenerateViews } from "../views.ts";
import { appendLog } from "../inbox.ts";
import { requireBrain, setupHint } from "../context.ts";
import { wrapTool } from "../tool-wrapper.ts";

function notFound() {
  return { content: [{ type: "text" as const, text: setupHint() }], details: {} };
}

export function registerCoreTools(pi: ExtensionAPI) {
  pi.registerTool({
    name: "brain_status",
    label: "Brain status",
    description: "Read the pi-brain status dashboard and inbox summary.",
    parameters: Type.Object({}),
    constrainedSampling: { type: "json_schema" as const, strict: "prefer" as const },
    async execute(_toolCallId: string, _params: any, _signal: AbortSignal | undefined, _onUpdate: unknown, ctx: ExtensionContext) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return notFound();

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
      if (!home) return notFound();

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

      const inboxPath = pathJoin(home.path, "wiki", "_state", "inbox.md");
      const current = await readInbox(home);
      await writeFile(inboxPath, current.trimEnd() + entry + "\n", "utf-8");

      return {
        content: [{ type: "text" as const, text: `Captured to inbox: ${id}` }],
        details: {},
      };
    },
  };

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
      if (!home) return notFound();

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
      if (!home) return notFound();

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
      if (!home) return notFound();

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
      if (!home) return notFound();

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
      if (!home) return notFound();

      const errors = await validateMarkdown(home);
      const viewMessage = await regenerateViews(home);
      const errorText = errors.length > 0 ? errors.map((e) => `${e.path}: ${e.errors.join(", ")}`).join("\n") : "No validation errors.";

      return {
        content: [{ type: "text" as const, text: `${viewMessage}\n\n${errorText}` }],
        details: {},
      };
    },
  });
}
