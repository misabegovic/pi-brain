import { readFile, writeFile, readdir, stat, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import type {
  BrainHome,
  AutonomyState,
  AutonomyTrustConfig,
  TrustLevel,
  CompactionHarvestConfig,
  ContextInjectionConfig,
  ToolResultEnrichmentConfig,
  BrainShortcutsConfig,
  BrainEventBusConfig,
  SessionShutdownConfig,
  EnolaConfig,
} from "./types.ts";
import { pathExists, getMarkdownFiles, extractSimpleYamlValue, parseFrontmatter } from "./utils.ts";

export async function findBrainHome(cwd: string): Promise<BrainHome | null> {
  const envHome = process.env.PI_BRAIN_HOME;
  if (envHome) {
    const resolved = resolve(envHome);
    if (await pathExists(join(resolved, "wiki"))) {
      return { path: resolved };
    }
  }

  const projectHint = resolve(cwd, ".pi/brain-home");
  if (await pathExists(projectHint)) {
    const hinted = (await readFile(projectHint, "utf-8")).trim();
    if (hinted) {
      const resolved = resolve(hinted);
      if (await pathExists(join(resolved, "wiki"))) {
        return { path: resolved };
      }
    }
  }

  if (await pathExists(join(cwd, "wiki")) && await pathExists(join(cwd, "brain.config.yml"))) {
    return { path: cwd };
  }

  return null;
}

export async function readOrg(home: BrainHome): Promise<string> {
  try {
    const config = await readFile(join(home.path, "brain.config.yml"), "utf-8");
    return extractSimpleYamlValue(config, "org") ?? "pi-brain";
  } catch {
    return "pi-brain";
  }
}

export async function readAutoConnect(home: BrainHome): Promise<boolean> {
  try {
    const config = await readFile(join(home.path, "brain.config.yml"), "utf-8");
    const value = extractSimpleYamlValue(config, "auto_connect");
    return value === "true";
  } catch {
    return false;
  }
}

export async function readHarvestCompaction(home: BrainHome): Promise<boolean> {
  const config = await readHarvestConfig(home);
  return config.enabled;
}

export async function readHarvestConfig(home: BrainHome): Promise<CompactionHarvestConfig> {
  const defaults: CompactionHarvestConfig = { enabled: true, maxItems: 5, minScore: 1 };
  try {
    const config = await readFile(join(home.path, "brain.config.yml"), "utf-8");
    const enabled = extractSimpleYamlValue(config, "harvest_compaction");
    const maxItems = extractSimpleYamlValue(config, "harvest_compaction_max_items");
    const minScore = extractSimpleYamlValue(config, "harvest_compaction_min_score");
    return {
      enabled: enabled === null ? defaults.enabled : enabled !== "false",
      maxItems: maxItems ? parseInt(maxItems, 10) : defaults.maxItems,
      minScore: minScore ? parseInt(minScore, 10) : defaults.minScore,
    };
  } catch {
    return defaults;
  }
}

export async function readContextInjectionConfig(home: BrainHome): Promise<ContextInjectionConfig> {
  const defaults: ContextInjectionConfig = { enabled: false, maxRecords: 2, minScore: 0 };
  try {
    const config = await readFile(join(home.path, "brain.config.yml"), "utf-8");
    const enabled = extractSimpleYamlValue(config, "inject_context");
    const maxRecords = extractSimpleYamlValue(config, "inject_context_max_records");
    const minScore = extractSimpleYamlValue(config, "inject_context_min_score");
    return {
      enabled: enabled === "true",
      maxRecords: maxRecords ? parseInt(maxRecords, 10) : defaults.maxRecords,
      minScore: minScore ? parseInt(minScore, 10) : defaults.minScore,
    };
  } catch {
    return defaults;
  }
}

export async function readToolResultEnrichmentConfig(home: BrainHome): Promise<ToolResultEnrichmentConfig> {
  const defaults: ToolResultEnrichmentConfig = { enabled: true, maxRelated: 2, largeOutputThreshold: 4000 };
  try {
    const config = await readFile(join(home.path, "brain.config.yml"), "utf-8");
    const enabled = extractSimpleYamlValue(config, "enrich_tool_results");
    const maxRelated = extractSimpleYamlValue(config, "enrich_tool_results_max_related");
    const threshold = extractSimpleYamlValue(config, "enrich_tool_results_large_threshold");
    return {
      enabled: enabled === null ? defaults.enabled : enabled !== "false",
      maxRelated: maxRelated ? parseInt(maxRelated, 10) : defaults.maxRelated,
      largeOutputThreshold: threshold ? parseInt(threshold, 10) : defaults.largeOutputThreshold,
    };
  } catch {
    return defaults;
  }
}

export async function readShortcutsConfig(home: BrainHome): Promise<BrainShortcutsConfig> {
  try {
    const config = await readFile(join(home.path, "brain.config.yml"), "utf-8");
    const value = extractSimpleYamlValue(config, "brain_shortcuts");
    return { enabled: value !== "false" };
  } catch {
    return { enabled: true };
  }
}

export async function readEventBusConfig(home: BrainHome): Promise<BrainEventBusConfig> {
  try {
    const config = await readFile(join(home.path, "brain.config.yml"), "utf-8");
    const value = extractSimpleYamlValue(config, "brain_event_bus");
    return { enabled: value === "true" };
  } catch {
    return { enabled: false };
  }
}

export async function readSessionShutdownConfig(home: BrainHome): Promise<SessionShutdownConfig> {
  try {
    const config = await readFile(join(home.path, "brain.config.yml"), "utf-8");
    const value = extractSimpleYamlValue(config, "brain_session_shutdown");
    return { enabled: value !== "false" };
  } catch {
    return { enabled: true };
  }
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value === "true" || value === "yes" || value === "on" || value === "1";
}

export async function readEnolaConfig(home: BrainHome): Promise<EnolaConfig> {
  const defaults: EnolaConfig = { enabled: false, gateBuild: false, gateSyncCode: false };
  try {
    const config = await readFile(join(home.path, "brain.config.yml"), "utf-8");
    const enabled = extractSimpleYamlValue(config, "enola.enabled");
    const targetRepo = extractSimpleYamlValue(config, "enola.target_repo");
    const binary = extractSimpleYamlValue(config, "enola.binary");
    const gateBuild = extractSimpleYamlValue(config, "enola.gate_build");
    const gateSyncCode = extractSimpleYamlValue(config, "enola.gate_sync_code");
    return {
      enabled: enabled ? enabled === "true" : defaults.enabled,
      targetRepo: targetRepo ?? defaults.targetRepo,
      binary: binary ?? defaults.binary,
      gateBuild: parseBoolean(gateBuild, defaults.gateBuild ?? false),
      gateSyncCode: parseBoolean(gateSyncCode, defaults.gateSyncCode ?? false),
    };
  } catch {
    return defaults;
  }
}

export async function readAutonomy(home: BrainHome): Promise<AutonomyState> {
  try {
    const text = await readFile(join(home.path, "wiki", "_state", "autonomy.json"), "utf-8");
    return JSON.parse(text) as AutonomyState;
  } catch {
    return { enabled: false };
  }
}

export async function writeAutonomy(home: BrainHome, state: AutonomyState) {
  await mkdir(join(home.path, "wiki", "_state"), { recursive: true });
  await writeFile(join(home.path, "wiki", "_state", "autonomy.json"), JSON.stringify(state, null, 2), "utf-8");
}

const DEFAULT_TRUST: AutonomyTrustConfig = {
  sync: "silent",
  groom: "notify",
  refine: "notify",
  suggest: "notify",
  agent: "notify",
  shelves: "blocked",
  commits: "blocked",
  code: "blocked",
};

const TRUST_LEVELS = new Set<TrustLevel>(["silent", "notify", "ask", "blocked"]);

function parseTrustLevel(value: string | undefined, fallback: TrustLevel): TrustLevel {
  if (value && TRUST_LEVELS.has(value as TrustLevel)) return value as TrustLevel;
  return fallback;
}

export async function readAutonomyTrust(home: BrainHome): Promise<AutonomyTrustConfig> {
  try {
    const text = await readFile(join(home.path, "brain.config.yml"), "utf-8");
    const result: Partial<AutonomyTrustConfig> = {};
    for (const key of Object.keys(DEFAULT_TRUST) as Array<keyof AutonomyTrustConfig>) {
      const value = extractSimpleYamlValue(text, `autonomy_trust.${key}`);
      result[key] = parseTrustLevel(value, DEFAULT_TRUST[key]);
    }
    return result as AutonomyTrustConfig;
  } catch {
    return { ...DEFAULT_TRUST };
  }
}

export async function countPages(home: BrainHome): Promise<number> {
  const files = await getMarkdownFiles(join(home.path, "wiki"));
  return files.filter((f) => !f.includes("/_state/")).length;
}

export async function countSources(home: BrainHome): Promise<number> {
  const files = await getMarkdownFiles(join(home.path, "sources"));
  return files.length;
}

export async function countPagesByKind(home: BrainHome): Promise<Map<string, number>> {
  const files = await getMarkdownFiles(join(home.path, "wiki"));
  const counts = new Map<string, number>();
  for (const file of files) {
    if (file.includes("/_state/")) continue;
    const text = await readFile(file, "utf-8");
    const { valid, frontmatter } = parseFrontmatter(text);
    if (!valid) continue;
    const kind = extractSimpleYamlValue(frontmatter, "kind") ?? "unknown";
    counts.set(kind, (counts.get(kind) ?? 0) + 1);
  }
  return counts;
}

export async function readInbox(home: BrainHome): Promise<string> {
  try {
    return await readFile(join(home.path, "wiki", "_state", "inbox.md"), "utf-8");
  } catch {
    return "";
  }
}

export async function findRecentSources(home: BrainHome, since: number): Promise<string[]> {
  const sourcesDir = join(home.path, "sources");
  if (!(await pathExists(sourcesDir))) return [];
  const result: string[] = [];
  async function walk(dir: string) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        try {
          const s = await stat(full);
          if (s.mtimeMs >= since) {
            result.push(join("sources", full.slice(sourcesDir.length + 1)));
          }
        } catch {
          // ignore
        }
      }
    }
  }
  await walk(sourcesDir);
  return result;
}
