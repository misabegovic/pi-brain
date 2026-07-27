import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { BrainHome } from "./types.ts";
import { pathExists } from "./utils.ts";

export function getPackageRoot(): string {
  // resources.ts lives at extensions/pi-brain/resources.ts, so the package root
  // is three directories up from this file.
  return dirname(dirname(dirname(fileURLToPath(import.meta.url))));
}

export async function resolveResource(name: string, brainHome?: BrainHome): Promise<string> {
  if (brainHome) {
    const override = join(brainHome.path, ".brain", "overrides", name);
    if (await pathExists(override)) return override;
  }
  return join(getPackageRoot(), name);
}

export async function readPackageVersion(): Promise<string> {
  try {
    const pkg = await readFile(join(getPackageRoot(), "package.json"), "utf-8");
    return JSON.parse(pkg).version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}
