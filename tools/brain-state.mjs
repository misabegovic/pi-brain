#!/usr/bin/env node
/**
 * brain-state — regenerate state, roadmap, and options pages from the corpus.
 *
 * Preserves custom content outside of marker-delimited sections.
 *
 * Usage:
 *   node tools/brain-state.mjs [scope]
 *
 * If no scope is given, generates org-level pages at wiki/org/.
 */

import { readFile, writeFile, readdir, mkdir, access } from "node:fs/promises";
import { join, relative } from "node:path";
import { resolveHome } from "./lib/resolve-home.mjs";

const CWD = resolveHome(import.meta.dirname);
const WIKI_DIR = join(CWD, "wiki");
const SCOPE = process.argv[2] || "org";

async function pathExists(p) {
  try {
    await access(p);
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

function markerSection(lines, name) {
  return [`<!-- brain-state: ${name} -->`, ...lines, `<!-- /brain-state -->`];
}

function hasMarker(text, name) {
  return text.includes(`<!-- brain-state: ${name} -->`);
}

function replaceMarkerSection(text, name, newLines) {
  const startMarker = `<!-- brain-state: ${name} -->`;
  const endMarker = `<!-- /brain-state -->`;
  const startIdx = text.indexOf(startMarker);
  if (startIdx === -1) return text;
  const endIdx = text.indexOf(endMarker, startIdx + startMarker.length);
  if (endIdx === -1) return text;
  const before = text.slice(0, startIdx + startMarker.length);
  const after = text.slice(endIdx);
  const inner = newLines.length > 0 ? "\n" + newLines.join("\n") + "\n" : "\n";
  return before + inner + after;
}

async function main() {
  const files = await getMarkdownFiles(WIKI_DIR);
  const scopeDir = join(WIKI_DIR, SCOPE);
  const pages = [];
  for (const file of files) {
    if (file.includes("/_state/")) continue;
    const text = await readFile(file, "utf-8");
    const { valid, frontmatter, body } = parseFrontmatter(text);
    if (!valid) continue;
    pages.push({
      path: relative(scopeDir, file),
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

  await mkdir(scopeDir, { recursive: true });

  const stateTemplate = [
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
    ...markerSection(highConfidence.map((p) => `- [${p.title}](${p.path})`), "stable"),
    "",
    "## What is uncertain",
    "",
    ...markerSection(uncertain.map((p) => `- [${p.title}](${p.path})`), "uncertain"),
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

  const roadmapTemplate = [
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
    ...markerSection(committed.map((p) => `- [${p.title}](${p.path})`), "committed"),
    "",
    "## In shaping",
    "",
    ...markerSection(shaping.map((p) => `- [${p.title}](${p.path})`), "shaping"),
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

  const optionsTemplate = [
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
    ...markerSection(shaping.map((p) => `- [${p.title}](${p.path})`), "shaping"),
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

  const targets = [
    { name: "state.md", template: stateTemplate, sections: ["stable", "uncertain"] },
    { name: "roadmap.md", template: roadmapTemplate, sections: ["committed", "shaping"] },
    { name: "options.md", template: optionsTemplate, sections: ["shaping"] },
  ];

  for (const target of targets) {
    const targetPath = join(scopeDir, target.name);
    const exists = await pathExists(targetPath);
    if (!exists) {
      await writeFile(targetPath, target.template.join("\n"), "utf-8");
      console.log(`Created ${SCOPE}/${target.name}`);
      continue;
    }

    const existing = await readFile(targetPath, "utf-8");
    const hasAnyMarker = target.sections.some((name) => hasMarker(existing, name));
    if (!hasAnyMarker) {
      console.warn(`Skipping ${SCOPE}/${target.name}: existing file has no brain-state markers. Delete it to regenerate from template.`);
      continue;
    }

    let updated = existing;
    for (const sectionName of target.sections) {
      const sectionLines = markerSection(
        extractSectionLines(target.template, sectionName),
        sectionName
      );
      // Strip markers; replaceMarkerSection adds them back.
      const innerLines = sectionLines.slice(1, -1);
      updated = replaceMarkerSection(updated, sectionName, innerLines);
    }

    if (updated !== existing) {
      await writeFile(targetPath, updated, "utf-8");
      console.log(`Updated ${SCOPE}/${target.name}`);
    } else {
      console.log(`No changes ${SCOPE}/${target.name}`);
    }
  }
}

function extractSectionLines(template, name) {
  const startMarker = `<!-- brain-state: ${name} -->`;
  const endMarker = `<!-- /brain-state -->`;
  const startIdx = template.indexOf(startMarker);
  if (startIdx === -1) return [];
  const endIdx = template.indexOf(endMarker, startIdx);
  if (endIdx === -1) return [];
  return template.slice(startIdx + 1, endIdx);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
