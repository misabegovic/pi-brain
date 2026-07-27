import { readFile, writeFile, stat, mkdir, copyFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import type { BrainHome } from "./types.ts";
import { execFilePromise, pathExists, extractSimpleYamlValue } from "./utils.ts";

export const TEMPLATE_OWNER = "misabegovic";
export const TEMPLATE_REPO = "pi-brain";

export const TEMPLATE_OWNED_PATHS = [
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
  "tools/brain-state.mjs",
  "tools/brain-sync.mjs",
  "tools/clone-pi-brain.sh",
  "tools/setup-local.sh",
  "tools/git-hooks",
  ".github",
  "personas",
];

export interface TemplateChange {
  path: string;
  status: "added" | "modified" | "removed";
}

async function fetchJson(url: string): Promise<any> {
  const response = await fetch(url, {
    headers: { "User-Agent": "pi-brain-update" },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

export async function getLatestTemplateVersion(): Promise<string> {
  const data = await fetchJson(`https://api.github.com/repos/${TEMPLATE_OWNER}/${TEMPLATE_REPO}/releases/latest`);
  return data.tag_name;
}

export async function cloneUpstreamTemplate(home: BrainHome, version: string): Promise<string> {
  const upstreamDir = join(home.path, ".pi", "upstream-ref");
  await mkdir(join(home.path, ".pi"), { recursive: true });
  try {
    await execFilePromise("rm", ["-rf", upstreamDir]);
  } catch {
    // ignore
  }
  const result = await execFilePromise("git", [
    "clone",
    "--branch", version,
    "--depth", "1",
    `https://github.com/${TEMPLATE_OWNER}/${TEMPLATE_REPO}.git`,
    upstreamDir,
  ], { cwd: home.path });
  if (result.code !== 0) {
    throw new Error(result.stderr || `Failed to clone upstream template at ${version}`);
  }
  return upstreamDir;
}

export async function readTemplateVersion(home: BrainHome): Promise<string | undefined> {
  try {
    const config = await readFile(join(home.path, "brain.config.yml"), "utf-8");
    return extractSimpleYamlValue(config, "template_version");
  } catch {
    return undefined;
  }
}

export async function updateTemplateVersion(home: BrainHome, version: string) {
  const configPath = join(home.path, "brain.config.yml");
  const config = await readFile(configPath, "utf-8");
  if (config.match(/^template_version:/m)) {
    await writeFile(configPath, config.replace(/^template_version:.*$/m, `template_version: "${version}"`), "utf-8");
  } else {
    await writeFile(configPath, config.trimEnd() + `\n\n# pi-brain template version this clone was created from or last updated to.\ntemplate_version: "${version}"\n`, "utf-8");
  }
}

export async function diffTemplatePaths(home: BrainHome, upstreamDir: string): Promise<TemplateChange[]> {
  const changes: TemplateChange[] = [];
  for (const rel of TEMPLATE_OWNED_PATHS) {
    const localPath = join(home.path, rel);
    const upstreamPath = join(upstreamDir, rel);
    const localExists = await pathExists(localPath);
    const upstreamExists = await pathExists(upstreamPath);
    if (!localExists && upstreamExists) {
      changes.push({ path: rel, status: "added" });
    } else if (localExists && !upstreamExists) {
      changes.push({ path: rel, status: "removed" });
    } else if (localExists && upstreamExists) {
      const diff = await execFilePromise("diff", ["-rq", localPath, upstreamPath], { cwd: home.path });
      if (diff.code !== 0) {
        changes.push({ path: rel, status: "modified" });
      }
    }
  }
  return changes;
}

export async function applyTemplateChange(home: BrainHome, upstreamDir: string, change: TemplateChange) {
  const localPath = join(home.path, change.path);
  const upstreamPath = join(upstreamDir, change.path);
  if (change.status === "removed") {
    await execFilePromise("rm", ["-rf", localPath]);
  } else {
    const parent = dirname(localPath);
    await mkdir(parent, { recursive: true });
    const s = await stat(upstreamPath);
    if (s.isDirectory()) {
      await execFilePromise("cp", ["-R", upstreamPath, localPath]);
    } else {
      await copyFile(upstreamPath, localPath);
    }
  }
}
