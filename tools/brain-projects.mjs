#!/usr/bin/env node
/**
 * brain-projects — list onboarded projects in this pi-brain clone.
 *
 * Usage:
 *   node tools/brain-projects.mjs
 */

import { readFile, readdir } from "node:fs/promises";
import { join, dirname } from "node:path";

const CWD = import.meta.dirname ? dirname(import.meta.dirname) : process.cwd();
const WIKI_DIR = join(CWD, "wiki");
const CONFIG_PATH = join(CWD, "brain.config.yml");

function extractYamlValue(text, key) {
  const match = text.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  return match?.[1].trim().replace(/^["']|["']$/g, "");
}

function parseFrontmatter(text) {
  const trimmed = text.trim();
  if (!trimmed.startsWith("---")) return null;
  const end = trimmed.indexOf("---", 3);
  if (end === -1) return null;
  return trimmed.slice(3, end).trim();
}

async function getScopesFromConfig() {
  try {
    const text = await readFile(CONFIG_PATH, "utf-8");
    const match = text.match(/active_repos:\n((?:  - .*\n)*)/);
    if (!match) return [];
    return match[1].match(/- (.*)/g)?.map((line) => line.replace("- ", "").trim()) ?? [];
  } catch {
    return [];
  }
}

async function main() {
  const scopes = await getScopesFromConfig();
  if (scopes.length === 0) {
    console.log("No active projects. Use /brain:ingest-repo to onboard one.");
    return;
  }

  console.log(`Projects in this pi-brain (${scopes.length}):\n`);
  for (const scope of scopes) {
    const indexPath = join(WIKI_DIR, scope, "index.md");
    let status = "?";
    let confidence = "?";
    let title = scope;
    try {
      const text = await readFile(indexPath, "utf-8");
      const fm = parseFrontmatter(text);
      if (fm) {
        status = extractYamlValue(fm, "status") || "?";
        confidence = extractYamlValue(fm, "confidence") || "?";
      }
      const firstLine = text.split("\n").find((l) => l.startsWith("# ")) || "";
      title = firstLine.replace(/^#\s*/, "").trim() || scope;
    } catch {
      // no index.md yet
    }
    console.log(`- ${title}`);
    console.log(`  scope: ${scope}`);
    console.log(`  status: ${status}, confidence: ${confidence}`);
    console.log(`  wiki: wiki/${scope}/index.md`);
    console.log("");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
