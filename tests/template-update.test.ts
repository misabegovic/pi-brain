/**
 * Template update tests: the GitHub-release fallback places owned paths
 * correctly (no nesting on an existing directory) and the owned-path list
 * covers every tool the package ships.
 */

import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { applyTemplateChange, diffTemplatePaths, TEMPLATE_OWNED_PATHS } from "../extensions/pi-brain/template-update.ts";
import { pathExists } from "../extensions/pi-brain/utils.ts";

async function put(root: string, rel: string, text: string) {
  const full = join(root, rel);
  await mkdir(join(full, ".."), { recursive: true });
  await writeFile(full, text, "utf-8");
}

async function main() {
  const root = await mkdtemp(join(tmpdir(), "pi-brain-template-update-"));
  const clone = join(root, "clone");
  const upstream = join(root, "upstream");
  await mkdir(clone, { recursive: true });
  await mkdir(upstream, { recursive: true });

  await put(clone, "extensions/pi-brain/index.ts", "old");
  await put(clone, "extensions/pi-brain/stale.ts", "stale");
  await put(upstream, "extensions/pi-brain/index.ts", "new");
  await put(upstream, "tools/lib/resolve-home.mjs", "export {};");
  await put(upstream, "tools/run-tasks.mjs", "// runner");

  const home = { path: clone } as any;
  const changes = await diffTemplatePaths(home, upstream);
  const byPath = new Map(changes.map((c) => [c.path, c.status]));
  if (byPath.get("extensions") !== "modified") throw new Error("Expected extensions modified");
  if (byPath.get("tools/lib") !== "added") throw new Error("Expected tools/lib added");
  if (byPath.get("tools/run-tasks.mjs") !== "added") throw new Error("Expected tools/run-tasks.mjs added");

  for (const change of changes) await applyTemplateChange(home, upstream, change);

  if (await pathExists(join(clone, "extensions", "extensions"))) throw new Error("Applying onto an existing directory nested it");
  if ((await readFile(join(clone, "extensions/pi-brain/index.ts"), "utf-8")) !== "new") throw new Error("Expected upstream file content");
  if (await pathExists(join(clone, "extensions/pi-brain/stale.ts"))) throw new Error("Expected file gone upstream to be removed");
  if (!(await pathExists(join(clone, "tools/lib/resolve-home.mjs")))) throw new Error("Expected tools/lib placed");
  if (!(await pathExists(join(clone, "tools/run-tasks.mjs")))) throw new Error("Expected tools/run-tasks.mjs placed");
  if ((await diffTemplatePaths(home, upstream)).length !== 0) throw new Error("Expected no remaining diff after apply");
  console.log("✓ applyTemplateChange replaces directories in place and places new paths");

  await applyTemplateChange(home, upstream, { path: "tools/run-tasks.mjs", status: "removed" });
  if (await pathExists(join(clone, "tools/run-tasks.mjs"))) throw new Error("Expected removed path deleted");
  console.log("✓ applyTemplateChange removes paths gone upstream");

  const toolEntries = await readdir(join(import.meta.dirname, "..", "tools"));
  const missing = toolEntries.filter((name) => !TEMPLATE_OWNED_PATHS.includes(`tools/${name}`));
  if (missing.length > 0) throw new Error(`tools/ entries not in TEMPLATE_OWNED_PATHS: ${missing.join(", ")}`);
  console.log("✓ every file under tools/ is covered by the owned-path list");

  await rm(root, { recursive: true, force: true });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
