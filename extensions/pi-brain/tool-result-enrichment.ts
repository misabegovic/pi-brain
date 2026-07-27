import type { BrainHome, ToolResultEnrichmentConfig } from "./types.ts";
import { relative } from "node:path";
import { searchFiles } from "./search.ts";
import { loadActiveConstraints, matchGlob } from "./state.ts";

function isInsideBrain(home: BrainHome, targetPath: string): boolean {
  if (!targetPath) return false;
  const rel = relative(home.path, targetPath);
  return !rel.startsWith("..") && !rel.startsWith("node_modules/");
}

function getTextContent(content: any): string {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((c: any) => (typeof c === "string" ? c : c.text ?? "")).join("");
  }
  return "";
}

export async function enrichToolResult(
  home: BrainHome,
  event: any,
  config: ToolResultEnrichmentConfig
): Promise<{ content: any[]; details?: Record<string, unknown> } | undefined> {
  if (!config.enabled) return undefined;

  const toolName = event.toolName as string;
  const input = event.input ?? {};
  const originalContent = getTextContent(event.content);
  const patches: string[] = [];

  // Size warning.
  if (originalContent.length > config.largeOutputThreshold) {
    patches.push(`[pi-brain] Tool output is large (${originalContent.length} chars). Consider summarizing or reading a narrower slice.`);
  }

  // Path-aware enrichment for reads and bash inside the brain home.
  const targetPath = input.path ?? "";
  if ((toolName === "read" || toolName === "bash") && isInsideBrain(home, targetPath)) {
    const relPath = relative(home.path, targetPath);

    const constraints = await loadActiveConstraints(home);
    const matching = constraints.filter((c) => c.globs.some((g) => matchGlob(relPath, g)));
    if (matching.length > 0) {
      patches.push(
        "[pi-brain] Active constraints for this path:",
        ...matching.map((c) => `- ${c.title}`)
      );
    }

    const related = await searchFiles(home, relPath);
    const records = related
      .filter((r) => r.path.includes("/records/"))
      .slice(0, config.maxRelated);
    if (records.length > 0) {
      patches.push("[pi-brain] Related records:", ...records.map((r) => `- ${r.path}: ${r.snippet}`));
    }
  }

  if (patches.length === 0) return undefined;

  const appended = "\n\n" + patches.join("\n");
  const newContent = Array.isArray(event.content)
    ? [...event.content, { type: "text", text: appended }]
    : [{ type: "text", text: originalContent + appended }];

  return { content: newContent, details: event.details };
}
