#!/usr/bin/env node
/**
 * brain-sync — standalone validation + view regeneration for pi-brain.
 *
 * Run from the root of a pi-brain clone:
 *   node tools/brain-sync.mjs
 *
 * Exits 0 if valid and views are fresh, 1 otherwise.
 */

import { readFile, writeFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const CWD = process.cwd();

async function pathExists(p) {
  try {
    await readFile(p);
    return true;
  } catch {
    return false;
  }
}

async function getMarkdownFiles(dir) {
  const result = [];
  async function walk(current) {
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join(current, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith(".")) {
        await walk(full);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        result.push(full);
      }
    }
  }
  await walk(dir);
  return result;
}

function parseFrontmatter(text) {
  const trimmed = text.trim();
  if (!trimmed.startsWith("---")) return { valid: false, frontmatter: "", body: trimmed };
  const end = trimmed.indexOf("---", 3);
  if (end === -1) return { valid: false, frontmatter: "", body: trimmed };
  return {
    valid: true,
    frontmatter: trimmed.slice(3, end).trim(),
    body: trimmed.slice(end + 3).trim(),
  };
}

function getYamlValue(text, key) {
  const match = text.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  return match?.[1].trim();
}

async function validate() {
  const wikiDir = join(CWD, "wiki");
  if (!(await pathExists(join(wikiDir, "index.md")))) {
    console.error("wiki/index.md not found — run /brain:setup first");
    return false;
  }

  const files = await getMarkdownFiles(wikiDir);
  let errors = [];
  for (const file of files) {
    if (file.includes("/_state/")) continue;
    const text = await readFile(file, "utf-8");
    const { valid, frontmatter } = parseFrontmatter(text);
    const rel = relative(CWD, file);
    if (!valid) {
      errors.push(`${rel}: missing or malformed frontmatter`);
      continue;
    }
    for (const key of ["kind", "status", "confidence"]) {
      if (!getYamlValue(frontmatter, key)) {
        errors.push(`${rel}: missing ${key}`);
      }
    }
  }

  if (errors.length > 0) {
    console.error("Validation errors:");
    for (const err of errors) console.error(`  ${err}`);
    return false;
  }
  return true;
}

async function regenerateViews() {
  const wikiDir = join(CWD, "wiki");
  const files = await getMarkdownFiles(wikiDir);
  const pages = [];
  for (const file of files) {
    if (file.includes("/_state/")) continue;
    const text = await readFile(file, "utf-8");
    const { valid, frontmatter, body } = parseFrontmatter(text);
    if (!valid) continue;
    const kind = getYamlValue(frontmatter, "kind") ?? "unknown";
    const title = body.split("\n")[0].replace(/^#+\s*/, "").trim();
    pages.push({ path: relative(CWD, file), kind, title });
  }

  const byKind = new Map();
  for (const page of pages) {
    if (!byKind.has(page.kind)) byKind.set(page.kind, []);
    byKind.get(page.kind).push({ path: page.path, title: page.title });
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

  await writeFile(join(CWD, "wiki", "index.md"), lines.join("\n"), "utf-8");
  console.log(`Regenerated wiki/index.md with ${pages.length} pages across ${byKind.size} kinds.`);
}

async function main() {
  const valid = await validate();
  await regenerateViews();
  if (!valid) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
