import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { resolve, relative } from "node:path";
import { stat } from "node:fs/promises";
import { readAutonomy } from "../brain-home.ts";
import { appendInboxItem, appendAutoIngestBatch, ingestFile, ingestDirectory, ingestUrl } from "../inbox.ts";
import { requireBrain, setupHint } from "../context.ts";

function notFound() {
  return { content: [{ type: "text" as const, text: setupHint() }], details: {} };
}

export function registerIngestTools(pi: ExtensionAPI) {
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
      if (!home) return notFound();

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
