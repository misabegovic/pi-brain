/**
 * Search tests: verify corpus search scoring and limits.
 */

import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { searchFiles } from "../extensions/pi-brain/search.js";

async function createTempBrainHome(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "pi-brain-search-test-"));
  await mkdir(join(dir, "wiki", "brain"), { recursive: true });
  await writeFile(join(dir, "brain.config.yml"), "org: Test\n", "utf-8");
  await writeFile(
    join(dir, "wiki", "brain", "alpha.md"),
    "---\nkind: note\n---\n\n# Alpha\n\nThe autonomous refinement protocol runs continuously.\n",
    "utf-8"
  );
  await writeFile(
    join(dir, "wiki", "brain", "beta.md"),
    "---\nkind: note\n---\n\n# Beta\n\nThis page mentions nothing special.\n",
    "utf-8"
  );
  return dir;
}

async function main() {
  const home = await createTempBrainHome();
  try {
    const results = await searchFiles({ path: home }, "autonomous refinement protocol");
    if (results.length === 0) throw new Error("Expected search results");
    const alpha = results.find((r) => r.path.includes("alpha.md"));
    if (!alpha) throw new Error("Expected alpha.md in results");
    if (alpha.score <= 0) throw new Error("Expected positive score");
    console.log("✓ searchFiles returns scored results for matching query");

    const empty = await searchFiles({ path: home }, "xyznonexistent");
    if (empty.length !== 0) throw new Error("Expected no results for nonsense query");
    console.log("✓ searchFiles returns empty for non-matching query");

    await rm(home, { recursive: true, force: true });
    console.log("✓ search test passed");
  } finally {
    // cleanup already done
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
