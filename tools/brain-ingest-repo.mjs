#!/usr/bin/env node
/**
 * brain-ingest-repo — onboard a repository as a maintained project in pi-brain.
 *
 * Usage:
 *   node tools/brain-ingest-repo.mjs <path-or-url> [scope]
 *
 * What it does:
 * - Resolves the repo path (clones URLs to a temp dir if needed).
 * - Ingests a lightweight snapshot into sources/repos/<scope>/.
 * - Creates wiki/<scope>/ with index.md, state.md, roadmap.md, options.md.
 * - Adds <scope> to brain.config.yml active_repos if missing.
 * - Logs the onboarding.
 */

import { readFile, writeFile, readdir, mkdir, cp } from "node:fs/promises";
import { join, basename, dirname } from "node:path";
import { execFile } from "node:child_process";

const CWD = import.meta.dirname ? dirname(import.meta.dirname) : process.cwd();
const REPO_SOURCE_DIR = join(CWD, "sources", "repos");
const WIKI_DIR = join(CWD, "wiki");
const CONFIG_PATH = join(CWD, "brain.config.yml");

function execFilePromise(file, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = execFile(file, args, { cwd: options.cwd, maxBuffer: 8 * 1024 * 1024 });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (d) => { stdout += String(d); });
    child.stderr?.on("data", (d) => { stderr += String(d); });
    child.on("error", reject);
    child.on("close", (code) => resolve({ stdout, stderr, code: code ?? 0 }));
  });
}

async function pathExists(p) {
  try {
    await readdir(p);
    return true;
  } catch {
    return false;
  }
}

async function getRepoInfo(repoPath) {
  let name = basename(repoPath).replace(/\.git$/, "");
  let url = "";
  let branch = "";
  try {
    const remotes = await execFilePromise("git", ["remote", "get-url", "origin"], { cwd: repoPath });
    url = remotes.stdout.trim();
    const branchRes = await execFilePromise("git", ["branch", "--show-current"], { cwd: repoPath });
    branch = branchRes.stdout.trim();
  } catch {
    // not a git repo or no origin
  }
  return { name, url, branch };
}

async function getFileTree(repoPath, depth = 0) {
  if (depth > 2) return [];
  const entries = await readdir(repoPath, { withFileTypes: true });
  const tree = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "dist" || entry.name === "build") continue;
    const full = join(repoPath, entry.name);
    if (entry.isDirectory()) {
      tree.push(entry.name + "/");
      const children = await getFileTree(full, depth + 1);
      tree.push(...children.map((c) => "  " + c));
    } else {
      tree.push(entry.name);
    }
  }
  return tree;
}

function readConfig() {
  return readFile(CONFIG_PATH, "utf-8").catch(() => "");
}

async function addActiveRepo(scope) {
  let text = await readConfig();
  if (!text) {
    text = `org: "${scope}"\nactive_repos:\n  - ${scope}\narchived_repos: []\nconnectors:\n  github:\n    repos: []\n`;
  } else if (!text.includes(`- ${scope}`)) {
    text = text.replace(/(active_repos:\n(?:  - .*\n)*)/, `$1  - ${scope}\n`);
  }
  await writeFile(CONFIG_PATH, text, "utf-8");
}

async function main() {
  const rawTarget = process.argv[2];
  const scope = process.argv[3];
  if (!rawTarget) {
    console.error("Usage: node tools/brain-ingest-repo.mjs <path-or-url> [scope]");
    process.exit(1);
  }

  let repoPath = rawTarget;
  let isTempClone = false;

  if (rawTarget.startsWith("http://") || rawTarget.startsWith("https://") || rawTarget.includes(":") && rawTarget.includes("@")) {
    const tmpDir = join(CWD, ".tmp", "brain-ingest-" + Date.now());
    await mkdir(tmpDir, { recursive: true });
    console.log(`Cloning ${rawTarget}...`);
    const result = await execFilePromise("git", ["clone", "--depth", "1", rawTarget, tmpDir]);
    if (result.code !== 0) {
      console.error(result.stderr || result.stdout);
      process.exit(1);
    }
    repoPath = tmpDir;
    isTempClone = true;
  }

  const info = await getRepoInfo(repoPath);
  const chosenScope = scope || info.name;

  // Snapshot into sources/repos/<scope>/
  const snapshotDir = join(REPO_SOURCE_DIR, chosenScope);
  await mkdir(snapshotDir, { recursive: true });
  await cp(repoPath, snapshotDir, { recursive: true, force: true, filter: (src) => {
    const name = basename(src);
    return !name.startsWith(".") && name !== "node_modules" && name !== "dist" && name !== "build";
  }});

  // Create wiki/<scope>/
  const scopeWikiDir = join(WIKI_DIR, chosenScope);
  await mkdir(scopeWikiDir, { recursive: true });

  const tree = await getFileTree(repoPath);
  const treeText = tree.length ? tree.slice(0, 50).join("\n") : "(empty tree)";

  const indexLines = [
    "---",
    "kind: project",
    "status: active",
    "confidence: medium",
    `repo_path: ${repoPath}`,
    info.url ? `repo_url: ${info.url}` : "",
    info.branch ? `branch: ${info.branch}` : "",
    "---",
    "",
    `# Project: ${chosenScope}`,
    "",
    "## Overview",
    "",
    "Describe what this project does and why it matters.",
    "",
    "## Repository",
    "",
    `- Local path: \`${repoPath}\``,
    info.url ? `- URL: ${info.url}` : "",
    info.branch ? `- Branch: \`${info.branch}\`` : "",
    "",
    "## File tree",
    "",
    "```",
    treeText,
    "```",
    "",
    "## Related",
    "",
    "- [State](state.md)",
    "- [Roadmap](roadmap.md)",
    "- [Options](options.md)",
    "",
  ].filter(Boolean);

  const stateLines = [
    "---",
    "kind: state",
    "status: living",
    "confidence: low",
    "---",
    "",
    `# State — ${chosenScope}`,
    "",
    "## Where we are",
    "",
    "Initial ingestion. Verify the repo state and update confidence.",
    "",
    "## What is stable",
    "",
    "- Repository ingested.",
    "",
    "## What is uncertain",
    "",
    "- Purpose and boundaries.",
    "- Active workstreams.",
    "",
    "## What needs attention",
    "",
    "- Run /brain:deepdive on key files.",
    "",
  ];

  const roadmapLines = [
    "---",
    "kind: roadmap",
    "status: living",
    "confidence: low",
    "---",
    "",
    `# Roadmap — ${chosenScope}`,
    "",
    "## Committed",
    "",
    "- Onboard project into pi-brain.",
    "",
    "## In shaping",
    "",
    "- Define first initiatives.",
    "",
    "## Candidate",
    "",
    "- TBD.",
    "",
  ];

  const optionsLines = [
    "---",
    "kind: options",
    "status: living",
    "confidence: low",
    "---",
    "",
    `# Options — ${chosenScope}`,
    "",
    "## Where we could go next",
    "",
    "- TBD.",
    "",
    "## What we are not doing",
    "",
    "- TBD.",
    "",
  ];

  await writeFile(join(scopeWikiDir, "index.md"), indexLines.join("\n"), "utf-8");
  await writeFile(join(scopeWikiDir, "state.md"), stateLines.join("\n"), "utf-8");
  await writeFile(join(scopeWikiDir, "roadmap.md"), roadmapLines.join("\n"), "utf-8");
  await writeFile(join(scopeWikiDir, "options.md"), optionsLines.join("\n"), "utf-8");

  await addActiveRepo(chosenScope);

  // Log
  const logPath = join(CWD, "log", "log.md");
  const logEntry = `\n- ${new Date().toISOString()} — ingested repo ${info.url || repoPath} as scope \`${chosenScope}\`\n`;
  try {
    const existing = await readFile(logPath, "utf-8");
    await writeFile(logPath, existing + logEntry, "utf-8");
  } catch {
    await writeFile(logPath, `# Log\n\n${logEntry}`, "utf-8");
  }

  if (isTempClone) {
    // temp dir left for deepdives; user can delete manually or we could clean up
  }

  console.log(`Ingested repo as scope \`${chosenScope}\``);
  console.log(`Sources: ${snapshotDir}`);
  console.log(`Wiki: ${scopeWikiDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
