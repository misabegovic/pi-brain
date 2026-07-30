/**
 * Brain-links tool test: verify the standalone link checker runs cleanly.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { join } from "node:path";

const execFileAsync = promisify(execFile);
const toolPath = join(import.meta.dirname, "..", "tools", "brain-links.mjs");

async function main() {
  const { stdout, stderr } = await execFileAsync("node", [toolPath], {
    cwd: join(import.meta.dirname, ".."),
  });
  const output = stdout + stderr;
  if (!output.includes("Dead links: 0")) throw new Error("Expected 0 dead links");
  if (!output.includes("Orphans: 0")) throw new Error("Expected 0 orphans");
  console.log("✓ brain-links tool reports 0 dead links and 0 orphans");
  console.log("✓ brain-links test passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
