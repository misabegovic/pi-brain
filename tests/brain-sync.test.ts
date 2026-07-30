/**
 * Brain-sync tool test: verify the standalone sync tool runs cleanly.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { join } from "node:path";

const execFileAsync = promisify(execFile);
const toolPath = join(import.meta.dirname, "..", "tools", "brain-sync.mjs");

async function main() {
  const { stdout, stderr } = await execFileAsync("node", [toolPath], {
    cwd: join(import.meta.dirname, ".."),
  });
  const output = stdout + stderr;
  if (!output.includes("Regenerated wiki/index.md")) {
    throw new Error("Expected brain-sync to regenerate wiki/index.md");
  }
  console.log("✓ brain-sync tool regenerates wiki/index.md");
  console.log("✓ brain-sync test passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
