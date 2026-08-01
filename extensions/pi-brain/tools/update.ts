import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { join, relative } from "node:path";
import { readdir, stat } from "node:fs/promises";
import { execFilePromise, runBrainScript, pathExists } from "../utils.ts";
import { readAutonomy } from "../brain-home.ts";
import { resolveResource, readPackageVersion } from "../resources.ts";
import { appendAutoIngestBatch, appendLog } from "../inbox.ts";
import { requireBrain, setupHint } from "../context.ts";
import {
  getLatestTemplateVersion,
  cloneUpstreamTemplate,
  readTemplateVersion,
  updateTemplateVersion,
  diffTemplatePaths,
  applyTemplateChange,
} from "../template-update.ts";

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

function notFound() {
  return { content: [{ type: "text" as const, text: setupHint() }], details: {} };
}

export function registerUpdateTools(pi: ExtensionAPI) {
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
      if (!home) return notFound();

      const targetVersion = params.version || "latest";
      const packageRef = targetVersion === "latest"
        ? "@misabegovic/pi-brain@latest"
        : `@misabegovic/pi-brain@${targetVersion}`;

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
      if (!home) return notFound();

      const script = await resolveResource(join("tools", "connectors", "run.mjs"), home);
      if (!(await pathExists(script))) {
        return { content: [{ type: "text" as const, text: "Connector runner not found at tools/connectors/run.mjs" }], details: {} };
      }

      const startTime = Date.now();
      const autonomy = await readAutonomy(home);
      const result = await runBrainScript(script, [], home);
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
}
