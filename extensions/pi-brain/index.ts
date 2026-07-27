/**
 * pi-brain extension — self-contained knowledge home
 *
 * The extension entry point. It wires together tools, commands, and hooks
 * defined in sibling modules. Shared utilities, brain-home access, search,
 * views, inbox management, prompts, and state live in ./utils.ts, ./brain-home.ts,
 * ./resources.ts, ./search.ts, ./views.ts, ./inbox.ts, ./prompts.ts, and ./state.ts.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { readFile, writeFile, stat, mkdir, copyFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import type { BrainHome } from "./types.ts";
import { execFilePromise, pathExists, extractSimpleYamlValue } from "./utils.ts";
import { registerTools } from "./tools.ts";
import { registerCommands } from "./commands.ts";
import { registerHooks } from "./hooks.ts";

// Phase 0 baseline: capture the last system prompt seen before_agent_start.
const lastSystemPrompt = { current: "" };

// Phase 3: track sessions that have already received the first-run briefing.
const briefedSessions = new Set<string>();

const TEMPLATE_OWNER = "misabegovic";
const TEMPLATE_REPO = "pi-brain";

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

interface TemplateChange {
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

async function getLatestTemplateVersion(): Promise<string> {
  const data = await fetchJson(`https://api.github.com/repos/${TEMPLATE_OWNER}/${TEMPLATE_REPO}/releases/latest`);
  return data.tag_name;
}

async function cloneUpstreamTemplate(home: BrainHome, version: string): Promise<string> {
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

async function readTemplateVersion(home: BrainHome): Promise<string | undefined> {
  try {
    const config = await readFile(join(home.path, "brain.config.yml"), "utf-8");
    return extractSimpleYamlValue(config, "template_version");
  } catch {
    return undefined;
  }
}

async function updateTemplateVersion(home: BrainHome, version: string) {
  const configPath = join(home.path, "brain.config.yml");
  const config = await readFile(configPath, "utf-8");
  if (config.match(/^template_version:/m)) {
    await writeFile(configPath, config.replace(/^template_version:.*$/m, `template_version: "${version}"`), "utf-8");
  } else {
    await writeFile(configPath, config.trimEnd() + `\n\n# pi-brain template version this clone was created from or last updated to.\ntemplate_version: "${version}"\n`, "utf-8");
  }
}

async function diffTemplatePaths(home: BrainHome, upstreamDir: string): Promise<TemplateChange[]> {
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

async function applyTemplateChange(home: BrainHome, upstreamDir: string, change: TemplateChange) {
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

export const ALWAYS_ACTIVE_TOOLS = ["brain_status", "brain_capture"];
export const BRAIN_HOME_TOOLS = [
  "brain_ask",
  "brain_tend",
  "brain_validate",
  "brain_views",
  "brain_sync",
  "brain_update",
  "brain_pull_connectors",
  "brain_autonomy",
  "brain_links",
  "brain_state",
  "brain_deepdive",
  "brain_projects",
  "brain_ingest",
];
export const BOOTSTRAP_TOOLS = ["brain_convert", "brain_ingest_repo"];

function computeActiveTools(hasBrainHome: boolean): string[] {
  if (hasBrainHome) {
    return [...ALWAYS_ACTIVE_TOOLS, ...BRAIN_HOME_TOOLS];
  }
  return [...ALWAYS_ACTIVE_TOOLS, ...BOOTSTRAP_TOOLS];
}

export default function piBrainExtension(pi: ExtensionAPI) {
  registerTools(pi);
  registerCommands(pi);
  registerHooks(pi, lastSystemPrompt, briefedSessions, computeActiveTools, {
    always: ALWAYS_ACTIVE_TOOLS,
    home: BRAIN_HOME_TOOLS,
    bootstrap: BOOTSTRAP_TOOLS,
  });
}
