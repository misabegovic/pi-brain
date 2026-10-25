/**
 * Connector runner tests: it works from the package against a content-only
 * clone (no tools/ in the clone) and a clone with nothing configured is a
 * clean no-op, not a silent failure.
 */

import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const ROOT = join(import.meta.dirname, "..");

async function main() {
  const home = await mkdtemp(join(tmpdir(), "pi-brain-connectors-"));
  try {
    await writeFile(join(home, "brain.config.yml"), 'org: "x"\nactive_repos: []\n', "utf-8");
    const result = spawnSync("node", [join(ROOT, "tools/connectors/run.mjs")], {
      cwd: home,
      env: { ...process.env, PI_BRAIN_HOME: home },
      encoding: "utf-8",
    });
    if (result.status !== 0) throw new Error(`Expected exit 0, got ${result.status}: ${result.stderr}`);
    if (!result.stdout.includes("No GitHub repos configured")) throw new Error(`Expected the no-repos message, got: ${result.stdout}`);
    console.log("✓ connector runner no-ops cleanly from the package against a content-only clone");
  } finally {
    await rm(home, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
