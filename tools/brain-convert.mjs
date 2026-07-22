#!/usr/bin/env node
/**
 * brain-convert — convert the current repository into a pi-brain clone.
 *
 * The existing project code is moved into a subdirectory (default: files/)
 * so the repo becomes both the knowledge base and the codebase.
 *
 * Usage:
 *   node tools/brain-convert.mjs [subdir]
 *
 * This is a destructive restructure. Run with care.
 */

import { readFile, writeFile, readdir, mkdir, rename } from "node:fs/promises";
import { join, basename } from "node:path";
import { execFile } from "node:child_process";

const CWD = process.cwd();
const DRY_RUN = process.argv.includes("--dry-run");
const SUBDIR_ARG = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
const SUBDIR = SUBDIR_ARG || "files";
const SAFE_SUBDIR = SUBDIR.replace(/[^a-zA-Z0-9_-]/g, "-");

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

async function isGitRepo() {
  try {
    await readdir(join(CWD, ".git"));
    return true;
  } catch {
    return false;
  }
}

async function isAlreadyBrain() {
  try {
    const files = await readdir(CWD);
    return files.includes("brain.config.yml") && files.includes("wiki");
  } catch {
    return false;
  }
}

function validateSubdir(name) {
  if (!name) throw new Error("Subdirectory name is required.");
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    throw new Error(`Invalid subdirectory name: ${name}. Use only letters, numbers, hyphens, and underscores.`);
  }
}

async function isGitDirty() {
  try {
    const result = await execFilePromise("git", ["status", "--porcelain"], { cwd: CWD });
    return result.stdout.trim().length > 0;
  } catch {
    return false;
  }
}

async function pathExists(p) {
  try {
    await readFile(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (await isAlreadyBrain()) {
    console.error("This directory already looks like a pi-brain home (brain.config.yml + wiki/). Aborting.");
    process.exit(1);
  }

  const scope = basename(CWD);
  validateSubdir(SAFE_SUBDIR);
  const targetDir = join(CWD, SAFE_SUBDIR);

  if (!DRY_RUN && (await isGitDirty())) {
    console.error("Git working tree has uncommitted changes. Commit or stash them before converting, or run with --yes to override.");
    process.exit(1);
  }

  if (DRY_RUN) {
    console.log("[DRY RUN] No files will be moved or created.");
    console.log("");
  }

  console.log(`Converting \`${CWD}\` into a pi-brain clone.`);
  console.log(`Project code will move to \`${SAFE_SUBDIR}/\`.`);
  console.log(`Scope name: ${scope}`);
  console.log("");

  const entries = await readdir(CWD, { withFileTypes: true });
  const protectedNames = new Set([".git", "node_modules", "dist", "build", ".tmp", SAFE_SUBDIR, ".github"]);

  const toMove = entries.filter((entry) => !protectedNames.has(entry.name));

  if (DRY_RUN) {
    console.log("Files/directories that would move:");
    for (const entry of toMove) {
      console.log(`  ${entry.name} -> ${SAFE_SUBDIR}/${entry.name}`);
    }
    console.log("");
    console.log("Files/directories that stay:");
    for (const name of protectedNames) {
      if (entries.some((e) => e.name === name)) {
        console.log(`  ${name}`);
      }
    }
    console.log("");
    console.log("Files that would be created:");
    console.log("  brain.config.yml");
    console.log("  wiki/index.md");
    console.log("  wiki/org/state.md");
    console.log("  wiki/org/roadmap.md");
    console.log("  wiki/org/options.md");
    console.log("  sources/README.md");
    console.log("  log/log.md");
    if (!(await pathExists2(join(CWD, "AGENTS.md")))) {
      console.log("  AGENTS.md (minimal)");
    }
    console.log("");
    console.log("Run without --dry-run to apply.");
    return;
  }

  // Create target subdirectory
  await mkdir(targetDir, { recursive: true });

  // Move existing files/dirs into target subdirectory
  for (const entry of toMove) {
    const src = join(CWD, entry.name);
    const dest = join(targetDir, entry.name);
    console.log(`Moving ${entry.name} -> ${SAFE_SUBDIR}/${entry.name}`);
    await rename(src, dest);
  }

  // Create pi-brain skeleton
  await mkdir(join(CWD, "wiki", "org"), { recursive: true });
  await mkdir(join(CWD, "wiki", "org", "constraints"), { recursive: true });
  await mkdir(join(CWD, "wiki", "org", "records"), { recursive: true });
  await mkdir(join(CWD, "wiki", "org", "experiments"), { recursive: true });
  await mkdir(join(CWD, "wiki", "org", "feedback"), { recursive: true });
  await mkdir(join(CWD, "sources"), { recursive: true });
  await mkdir(join(CWD, "log"), { recursive: true });

  const configLines = [
    `# pi-brain configuration`,
    `org: "${scope}"`,
    `active_repos:`,
    `  - ${scope}`,
    `archived_repos: []`,
    `auto_connect: false`,
    `connectors:`,
    `  github:`,
    `    repos: []`,
    `  notion:`,
    `    pages: []`,
    `  slack:`,
    `    channels: []`,
    `  datadog:`,
    `    site: ""`,
    `  langfuse:`,
    `    host: ""`,
    `  structure:`,
    `    repos: []`,
    "",
  ];
  await writeFile(join(CWD, "brain.config.yml"), configLines.join("\n"), "utf-8");

  const indexLines = [
    "---",
    "kind: meta",
    "status: living",
    "confidence: high",
    "---",
    "",
    `# ${scope}`,
    "",
    "This repository is a pi-brain clone. The project code lives under",
    `[${SAFE_SUBDIR}/](${SAFE_SUBDIR}/).`,
    "",
    "## Related",
    "",
    "- [State](org/state.md)",
    "- [Roadmap](org/roadmap.md)",
    "- [Options](org/options.md)",
    "",
  ];
  await writeFile(join(CWD, "wiki", "index.md"), indexLines.join("\n"), "utf-8");

  const stateLines = [
    "---",
    "kind: state",
    "status: living",
    "confidence: low",
    "---",
    "",
    `# State — ${scope}`,
    "",
    "## Where we are",
    "",
    "This repo was just converted into a pi-brain clone. Project code now lives in",
    `[${SAFE_SUBDIR}/](../../${SAFE_SUBDIR}/).`,
    "",
    "## What needs attention",
    "",
    "- Capture the project's purpose and constraints.",
    "- Shape the first initiative.",
    "",
  ];
  await writeFile(join(CWD, "wiki", "org", "state.md"), stateLines.join("\n"), "utf-8");

  const roadmapLines = [
    "---",
    "kind: roadmap",
    "status: living",
    "confidence: low",
    "---",
    "",
    `# Roadmap — ${scope}`,
    "",
    "## Committed",
    "",
    "- Convert repo into pi-brain clone.",
    "",
    "## In shaping",
    "",
    "- Define first initiatives.",
    "",
  ];
  await writeFile(join(CWD, "wiki", "org", "roadmap.md"), roadmapLines.join("\n"), "utf-8");

  const optionsLines = [
    "---",
    "kind: options",
    "status: living",
    "confidence: low",
    "---",
    "",
    `# Options — ${scope}`,
    "",
    "## Where we could go next",
    "",
    "- TBD.",
    "",
  ];
  await writeFile(join(CWD, "wiki", "org", "options.md"), optionsLines.join("\n"), "utf-8");

  await writeFile(join(CWD, "sources", "README.md"), "# Sources\n\nImmutable inputs for this pi-brain clone.\n", "utf-8");

  const logEntry = `- ${new Date().toISOString()} — converted repo into pi-brain clone; project code moved to \`${SAFE_SUBDIR}/\`\n`;
  await writeFile(join(CWD, "log", "log.md"), `# Log\n\n${logEntry}`, "utf-8");

  // Add minimal AGENTS.md if none exists
  if (!(await pathExists(join(CWD, "AGENTS.md")))) {
    const agentsLines = [
      "# AGENTS",
      "",
      "This is a pi-brain clone.",
      "",
      "- Sources are immutable; wiki is synthesized.",
      "- Cite sources for every claim.",
      "- Autonomous mode may only produce AI-suggested drafts.",
      "- Manual work wins over auto maintenance.",
      "",
    ];
    await writeFile(join(CWD, "AGENTS.md"), agentsLines.join("\n"), "utf-8");
  }

  if (await isGitRepo()) {
    console.log("\nGit repo detected. You may want to commit the restructure.");
  }

  console.log("\nConversion complete.");
  console.log(`Project code: ${SAFE_SUBDIR}/`);
  console.log(`Brain home: wiki/, sources/, log/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
