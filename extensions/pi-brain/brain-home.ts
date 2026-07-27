import { readFile, writeFile, readdir, stat, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { BrainHome, AutonomyState } from "./types.ts";
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
  try {
    const config = await readFile(join(home.path, "brain.config.yml"), "utf-8");
    const value = extractSimpleYamlValue(config, "harvest_compaction");
    return value !== "false";
  } catch {
    return true;
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
