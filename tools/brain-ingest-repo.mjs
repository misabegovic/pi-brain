#!/usr/bin/env node
/**
 * brain-ingest-repo — onboard a repository as a maintained project in pi-brain.
 *
 * The repository code stays outside the brain. This script only creates a
 * lightweight metadata snapshot and scaffolds wiki/<scope>/.
 *
 * Usage:
 *   node tools/brain-ingest-repo.mjs <path-or-url> [scope]
 */

import { readFile, writeFile, readdir, mkdir, rm } from "node:fs/promises";
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

async function ensureGit() {
  try {
    const result = await execFilePromise("git", ["--version"]);
    if (result.code !== 0) throw new Error("git not available");
  } catch {
    throw new Error("git is required to onboard repositories. Please install git and try again.");
  }
}

function validateScope(scope) {
  if (!scope) throw new Error("Scope name is required.");
  if (!/^[a-zA-Z0-9_-]+$/.test(scope)) {
    throw new Error(`Invalid scope name: ${scope}. Use only letters, numbers, hyphens, and underscores.`);
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
    text = `org: "${scope}"\nactive_repos:\n  - ${scope}\narchived_repos: []\nauto_connect: false\nconnectors:\n  github:\n    repos: []\n`;
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

  await ensureGit();

  let repoPath = rawTarget;
  let isTempClone = false;
  let tmpDir = "";

  if (rawTarget.startsWith("http://") || rawTarget.startsWith("https://") || (rawTarget.includes(":") && rawTarget.includes("@"))) {
    tmpDir = join(CWD, ".tmp", "brain-ingest-" + Date.now());
    await mkdir(tmpDir, { recursive: true });
    console.log(`Cloning ${rawTarget} for inspection...`);
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
  validateScope(chosenScope);

  // Lightweight metadata snapshot into sources/repos/<scope>.md
  await mkdir(REPO_SOURCE_DIR, { recursive: true });
  const tree = await getFileTree(repoPath);
  const treeText = tree.length ? tree.slice(0, 100).join("\n") : "(empty tree)";

  let readmeSnippet = "";
  try {
    readmeSnippet = await readFile(join(repoPath, "README.md"), "utf-8");
    readmeSnippet = readmeSnippet.slice(0, 5000);
  } catch {
    // no README
  }

  const sourceLines = [
    "---",
    "kind: repo-snapshot",
    "source_kind: repo",
    `scope: ${chosenScope}`,
    `repo_path: ${repoPath}`,
    info.url ? `repo_url: ${info.url}` : "",
    info.branch ? `branch: ${info.branch}` : "",
    `generated_at: ${new Date().toISOString()}`,
    "---",
    "",
    `# Repository snapshot: ${chosenScope}`,
    "",
    "This is a lightweight metadata snapshot. The repository code stays outside the brain.",
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
  ];

  if (readmeSnippet) {
    sourceLines.push(
      "## README excerpt",
      "",
      readmeSnippet,
      ""
    );
  }

  await writeFile(join(REPO_SOURCE_DIR, `${chosenScope}.md`), sourceLines.filter(Boolean).join("\n"), "utf-8");

  // Create wiki/<scope>/
  const scopeWikiDir = join(WIKI_DIR, chosenScope);
  await mkdir(scopeWikiDir, { recursive: true });
  await mkdir(join(scopeWikiDir, "constraints"), { recursive: true });
  await mkdir(join(scopeWikiDir, "records"), { recursive: true });
  await mkdir(join(scopeWikiDir, "experiments"), { recursive: true });
  await mkdir(join(scopeWikiDir, "feedback"), { recursive: true });

  const indexLines = [
    "---",
    "kind: project",
    "status: active",
    "confidence: low",
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
    "Initial onboarding. The repo code lives outside the brain; use deepdives to inspect it and records to capture current truth.",
    "",
    "## What is stable",
    "",
    "- Project scaffolded in pi-brain.",
    "",
    "## What is uncertain",
    "",
    "- Purpose and boundaries.",
    "- Active constraints.",
    "- Active workstreams.",
    "",
    "## What needs attention",
    "",
    "- Run /brain:deepdive on key files.",
    "- Capture initial constraints in constraints/.",
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
    "- Define first initiatives and constraints.",
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
  const logEntry = `\n- ${new Date().toISOString()} — onboarded repo ${info.url || repoPath} as scope \`${chosenScope}\` (code stays outside brain)\n`;
  try {
    const existing = await readFile(logPath, "utf-8");
    await writeFile(logPath, existing + logEntry, "utf-8");
  } catch {
    await writeFile(logPath, `# Log\n\n${logEntry}`, "utf-8");
  }

  if (isTempClone && tmpDir) {
    try {
      await rm(tmpDir, { recursive: true, force: true });
      console.log("Temporary clone removed.");
    } catch (err) {
      console.error(`Could not remove temporary clone at ${tmpDir}: ${err.message}`);
    }
  }

  console.log(`Onboarded repo as scope \`${chosenScope}\``);
  console.log(`Metadata snapshot: sources/repos/${chosenScope}.md`);
  console.log(`Wiki: ${scopeWikiDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
