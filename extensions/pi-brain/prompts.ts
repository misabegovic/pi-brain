import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { BrainHome } from "./types.ts";
import { resolveResource } from "./resources.ts";

export async function loadPrompt(name: string, brainHome?: BrainHome): Promise<string> {
  const path = await resolveResource(join("prompts", name), brainHome);
  try {
    return await readFile(path, "utf-8");
  } catch {
    return "";
  }
}

export function hasAgentsMd(contextFiles?: Array<{ path: string }>): boolean {
  if (!contextFiles) return false;
  return contextFiles.some((f) => f.path.endsWith("AGENTS.md"));
}
