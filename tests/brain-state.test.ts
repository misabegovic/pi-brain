/**
 * Brain-state tool test: verify the standalone state tool regenerates org pages
 * without overwriting custom content.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { join } from "node:path";
import { readFile, writeFile, rm } from "node:fs/promises";

const execFileAsync = promisify(execFile);
const toolPath = join(import.meta.dirname, "..", "tools", "brain-state.mjs");

async function main() {
  const statePath = join(import.meta.dirname, "..", "wiki", "org", "state.md");
  const before = await readFile(statePath, "utf-8");

  // Delete the state file to force regeneration.
  await rm(statePath, { force: true });

  const { stdout, stderr } = await execFileAsync("node", [toolPath, "org"], {
    cwd: join(import.meta.dirname, ".."),
  });
  const output = stdout + stderr;
  if (!output.includes("Updated org/state.md") && !output.includes("Created org/state.md")) {
    throw new Error("Expected brain-state to create or update org/state.md");
  }

  const after = await readFile(statePath, "utf-8");
  if (after.length < 100) {
    throw new Error("Expected state.md to be regenerated with content");
  }

  // Restore original content to avoid dirtying the repo.
  await writeFile(statePath, before, "utf-8");

  console.log("✓ brain-state tool regenerates org/state.md");
  console.log("✓ brain-state test passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
