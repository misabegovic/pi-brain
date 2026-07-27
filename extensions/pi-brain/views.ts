import { readFile, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import type { BrainHome } from "./types.ts";
import { getMarkdownFiles, parseFrontmatter, extractSimpleYamlValue } from "./utils.ts";

export async function validateMarkdown(home: BrainHome): Promise<Array<{ path: string; errors: string[] }>> {
  const files = await getMarkdownFiles(join(home.path, "wiki"));
  const result: Array<{ path: string; errors: string[] }> = [];
  for (const file of files) {
    if (file.includes("/_state/")) continue;
    const text = await readFile(file, "utf-8");
    const { valid, frontmatter } = parseFrontmatter(text);
    const errors: string[] = [];
    if (!valid) errors.push("missing or malformed frontmatter");
    else {
      if (!extractSimpleYamlValue(frontmatter, "kind")) errors.push("missing kind");
      if (!extractSimpleYamlValue(frontmatter, "status")) errors.push("missing status");
      if (!extractSimpleYamlValue(frontmatter, "confidence")) errors.push("missing confidence");
    }
    if (errors.length > 0) {
      result.push({ path: relative(home.path, file), errors });
    }
  }
  return result;
}

export async function regenerateViews(home: BrainHome): Promise<string> {
  const files = await getMarkdownFiles(join(home.path, "wiki"));
  const pages: Array<{ path: string; kind: string; title: string }> = [];
  for (const file of files) {
    if (file.includes("/_state/")) continue;
    const text = await readFile(file, "utf-8");
    const { valid, frontmatter, body } = parseFrontmatter(text);
    if (!valid) continue;
    const kind = extractSimpleYamlValue(frontmatter, "kind") ?? "unknown";
    const title = body.split("\n")[0].replace(/^#+\s*/, "").trim();
    pages.push({ path: relative(home.path, file), kind, title });
  }

  const byKind = new Map<string, Array<{ path: string; title: string }>>();
  for (const page of pages) {
    if (!byKind.has(page.kind)) byKind.set(page.kind, []);
    byKind.get(page.kind)!.push({ path: page.path, title: page.title });
  }

  const lines = [
    "---",
    "kind: meta",
    "status: living",
    "confidence: high",
    "---",
    "",
    "# pi-brain home",
    "",
    "This is the synthesis layer for this pi-brain instance.",
    "",
    "## Pages",
    "",
  ];
  for (const [kind, items] of byKind) {
    lines.push(`### ${kind}`);
    for (const item of items) {
      lines.push(`- [${item.title}](${item.path})`);
    }
    lines.push("");
  }
  lines.push(
    "## Getting started",
    "",
    "1. Update `brain.config.yml`.",
    "2. Use `/brain:capture` to drop notes into the inbox.",
    "3. Use `/brain:shape` to turn pitches into ADRs/PRDs.",
    "4. Use `/brain:tend` to digest queued work.",
    ""
  );

  await writeFile(join(home.path, "wiki", "index.md"), lines.join("\n"), "utf-8");
  return `Regenerated wiki/index.md with ${pages.length} pages across ${byKind.size} kinds.`;
}
