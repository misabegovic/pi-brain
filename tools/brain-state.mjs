#!/usr/bin/env node
/**
 * brain-state — regenerate state, roadmap, and options pages from the corpus.
 *
 * Usage:
 *   node tools/brain-state.mjs [scope]
 *
 * If no scope is given, generates org-level pages at wiki/org/.
 */

import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";

const CWD = import.meta.dirname ? dirname(import.meta.dirname) : process.cwd();
const WIKI_DIR = join(CWD, "wiki");
const SCOPE = process.argv[2] || "org";

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
      if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "_state") {
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
  return match?.[1].trim().replace(/^["']|["']$/g, "");
}

function extractTitle(body) {
  return body.split("\n")[0].replace(/^#+\s*/, "").trim();
}

async function main() {
  const files = await getMarkdownFiles(WIKI_DIR);
  const pages = [];
  for (const file of files) {
    if (file.includes("/_state/")) continue;
    const text = await readFile(file, "utf-8");
    const { valid, frontmatter, body } = parseFrontmatter(text);
    if (!valid) continue;
    const rel = file.replace(WIKI_DIR + "/", "").replace(/\.md$/, "");
    pages.push({
      path: rel + ".md",
      kind: getYamlValue(frontmatter, "kind") || "unknown",
      status: getYamlValue(frontmatter, "status") || "",
      confidence: getYamlValue(frontmatter, "confidence") || "",
      title: extractTitle(body),
    });
  }

  const committed = pages.filter((p) => ["accepted", "living"].includes(p.status));
  const shaping = pages.filter((p) => ["draft", "suggested"].includes(p.status));
  const highConfidence = pages.filter((p) => p.confidence === "high");
  const uncertain = pages.filter((p) => ["low", "medium"].includes(p.confidence));

  const scopeDir = join(WIKI_DIR, SCOPE);
  await mkdir(scopeDir, { recursive: true });

  const stateLines = [
    "---",
    "kind: state",
    "status: living",
    "confidence: medium",
    "---",
    "",
    `# State — ${SCOPE}`,
    "",
    "## Where we are",
    "",
    "Summarize the current truth for this scope. Be honest about gaps.",
    "",
    "## What is stable",
    "",
    ...highConfidence.map((p) => `- [${p.title}](${p.path})`),
    "",
    "## What is uncertain",
    "",
    ...uncertain.map((p) => `- [${p.title}](${p.path})`),
    "",
    "## What changed recently",
    "",
    "- See log/log.md and recent source snapshots.",
    "",
    "## What needs attention",
    "",
    "- Check wiki/_state/inbox.md and wiki/_state/links.json.",
    "",
  ];

  const roadmapLines = [
    "---",
    "kind: roadmap",
    "status: living",
    "confidence: medium",
    "---",
    "",
    `# Roadmap — ${SCOPE}`,
    "",
    "## Committed",
    "",
    ...committed.map((p) => `- [${p.title}](${p.path})`),
    "",
    "## In shaping",
    "",
    ...shaping.map((p) => `- [${p.title}](${p.path})`),
    "",
    "## Candidate",
    "",
    "- AI-suggested pages under ai-suggestions/ awaiting graduation.",
    "",
    "## Parked",
    "",
    "- Options explicitly deferred.",
    "",
  ];

  const optionsLines = [
    "---",
    "kind: options",
    "status: living",
    "confidence: low",
    "---",
    "",
    `# Options — ${SCOPE}`,
    "",
    "## Where we could go next",
    "",
    ...shaping.map((p) => `- [${p.title}](${p.path})`),
    "",
    "## What we are not doing",
    "",
    "- Options considered and rejected, with reasons.",
    "",
    "## Triggers for revisiting",
    "",
    "- Conditions that would make a parked option worth shaping again.",
    "",
  ];

  await writeFile(join(scopeDir, "state.md"), stateLines.join("\n"), "utf-8");
  await writeFile(join(scopeDir, "roadmap.md"), roadmapLines.join("\n"), "utf-8");
  await writeFile(join(scopeDir, "options.md"), optionsLines.join("\n"), "utf-8");

  console.log(`Regenerated ${SCOPE}/state.md, ${SCOPE}/roadmap.md, ${SCOPE}/options.md`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
