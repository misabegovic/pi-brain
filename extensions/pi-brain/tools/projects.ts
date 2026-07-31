import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { join } from "node:path";
import { execFilePromise, pathExists } from "../utils.ts";
import { resolveResource } from "../resources.ts";
import { requireBrain, setupHint } from "../context.ts";

function notFound() {
  return { content: [{ type: "text" as const, text: setupHint() }], details: {} };
}

export function registerProjectTools(pi: ExtensionAPI) {
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
      if (!home) return notFound();

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
      if (!home) return notFound();

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
}
