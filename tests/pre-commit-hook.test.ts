/**
 * Pre-commit hook test: verify the hook runs brain-sync successfully.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { join } from "node:path";

const execFileAsync = promisify(execFile);
const hookPath = join(import.meta.dirname, "..", "tools", "git-hooks", "pre-commit");

async function main() {
  const { stdout, stderr } = await execFileAsync("sh", [hookPath], {
    cwd: join(import.meta.dirname, ".."),
  });
  const output = stdout + stderr;
  if (!output.includes("Regenerated wiki/index.md")) {
    throw new Error("Expected pre-commit hook to run brain-sync");
  }
  console.log("✓ pre-commit hook runs brain-sync");
  console.log("✓ pre-commit hook test passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
