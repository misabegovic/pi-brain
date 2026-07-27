#!/usr/bin/env node
/**
 * migrate-clone — migrate an existing pi-brain clone to the package-resolved model.
 *
 * With package-resolved resources, the installed pi-brain package provides
 * skills, prompts, themes, tools, personas, and the extension. A clone should
 * contain only content (wiki/, sources/, log/, brain.config.yml) and optional
 * local overrides in .brain/overrides/.
 *
 * Usage:
 *   node tools/migrate-clone.mjs <clone-path> [--dry-run]
 *
 * The script:
 *   1. Compares template-owned paths in the clone against the packaged versions.
 *   2. Writes any genuine local divergence into .brain/overrides/.
 *   3. Removes template-owned paths from the clone.
 */

import { readFile, readdir, stat, mkdir, rm, copyFile, writeFile } from "node:fs/promises";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = dirname(__dirname);
const TEMPLATE_OWNED_PATHS = [
  "AGENTS.md",
  "GETTING_STARTED.md",
  "README.md",
  "extensions",
  "skills",
  "prompts",
  "themes",
  "tools/templates",
  "tools/connectors",
  "tools/brain-convert.mjs",
  "tools/brain-ingest-repo.mjs",
  "tools/brain-links.mjs",
  "tools/brain-projects.mjs",
  "tools/brain-state.mjs",
  "tools/brain-sync.mjs",
  "tools/clone-pi-brain.sh",
  "tools/setup-local.sh",
  "tools/git-hooks",
  ".github",
  "personas",
];

const clonePath = process.argv[2];
const dryRun = process.argv.includes("--dry-run");

if (!clonePath) {
  console.error("Usage: node tools/migrate-clone.mjs <clone-path> [--dry-run]");
  process.exit(1);
}

async function pathExists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function diffRecursive(a, b) {
  try {
    const result = await new Promise((resolve, reject) => {
      execFile("diff", ["-rq", a, b], (error, stdout, stderr) => {
        resolve({ code: error?.code ?? 0, stdout, stderr });
      });
    });
    return result.code !== 0;
  } catch {
    return true;
  }
}

async function copyRecursive(src, dest) {
  const s = await stat(src);
  if (s.isDirectory()) {
    await mkdir(dest, { recursive: true });
    const entries = await readdir(src, { withFileTypes: true });
    for (const entry of entries) {
      await copyRecursive(join(src, entry.name), join(dest, entry.name));
    }
  } else {
    await mkdir(dirname(dest), { recursive: true });
    await copyFile(src, dest);
  }
}

async function main() {
  const resolvedClone = join(process.cwd(), clonePath);
  if (!(await pathExists(join(resolvedClone, "brain.config.yml")))) {
    console.error(`Error: ${resolvedClone} does not look like a pi-brain clone (no brain.config.yml)`);
    process.exit(1);
  }

  const overridesDir = join(resolvedClone, ".brain", "overrides");
  const actions = [];

  for (const rel of TEMPLATE_OWNED_PATHS) {
    const localPath = join(resolvedClone, rel);
    const packagePath = join(PACKAGE_ROOT, rel);
    const localExists = await pathExists(localPath);
    const packageExists = await pathExists(packagePath);

    if (!localExists) {
      actions.push({ rel, action: "skip", reason: "not present in clone" });
      continue;
    }

    let differs = false;
    if (packageExists) {
      const s = await stat(packagePath);
      if (s.isDirectory()) {
        differs = await diffRecursive(localPath, packagePath);
      } else {
        differs = await diffRecursive(localPath, packagePath);
      }
    } else {
      differs = true;
    }

    if (differs) {
      const overrideTarget = join(overridesDir, rel);
      if (dryRun) {
        actions.push({ rel, action: "would-override", overrideTarget });
      } else {
        await copyRecursive(localPath, overrideTarget);
        actions.push({ rel, action: "overridden", overrideTarget });
      }
    }

    if (dryRun) {
      actions.push({ rel, action: "would-remove" });
    } else {
      await rm(localPath, { recursive: true, force: true });
      actions.push({ rel, action: "removed" });
    }
  }

  if (!dryRun) {
    await mkdir(join(resolvedClone, ".brain", "overrides"), { recursive: true });
  }

  const report = actions.map((a) => {
    if (a.overrideTarget) {
      return `${a.action}: ${a.rel} → ${relative(resolvedClone, a.overrideTarget)}`;
    }
    return `${a.action}: ${a.rel}`;
  }).join("\n");

  console.log(`${dryRun ? "[DRY-RUN] " : ""}Migration report for ${resolvedClone}:\n${report}`);

  if (!dryRun) {
    const logPath = join(resolvedClone, "log", "log.md");
    try {
      const current = await readFile(logPath, "utf-8");
      const date = new Date().toISOString().slice(0, 10);
      await writeFile(logPath, current.trimEnd() + `\n- ${date}: Migrated clone to package-resolved resources.\n`, "utf-8");
    } catch {
      // ignore missing log
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
