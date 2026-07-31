import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { join, resolve } from "node:path";
import { readFile, writeFile, readdir, stat } from "node:fs/promises";
import { pathExists } from "../utils.ts";
import { requireBrain, setupHint } from "../context.ts";

function notFound() {
  return { content: [{ type: "text" as const, text: setupHint() }], details: { files: [] } };
}

export function registerDeepdiveTool(pi: ExtensionAPI) {
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
      if (!home) return notFound();

      const target = resolve(params.target);
      if (!(await pathExists(target))) {
        return { content: [{ type: "text" as const, text: `Target not found: ${target}` }], details: { files: [] } };
      }

      const maxFiles = params.max_files ?? 10;
      const fileStat = await stat(target);
      const records: Array<{ path: string; kind: string; snippet: string }> = [];

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
}
