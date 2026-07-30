/**
 * Compaction-harvest tests: verify signal scoring and harvesting.
 */

import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { runCompactionHarvest } from "../extensions/pi-brain/compaction-harvest.js";

async function createTempBrainHome(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "pi-brain-harvest-test-"));
  await mkdir(join(dir, "wiki", "_state"), { recursive: true });
  await mkdir(join(dir, "log"), { recursive: true });
  await writeFile(join(dir, "brain.config.yml"), "org: Test\n", "utf-8");
  await writeFile(join(dir, "wiki", "_state", "inbox.md"), "---\nkind: inbox\n---\n\n# Inbox\n", "utf-8");
  await writeFile(join(dir, "log", "log.md"), "# Log\n\n", "utf-8");
  return dir;
}

async function main() {
  const home = await createTempBrainHome();
  try {
    const entries = [
      { type: "message", message: { role: "user", content: "We decided to use TypeScript for the extension. This is a long sentence with enough words to be harvested as a snippet." } },
      { type: "message", message: { role: "assistant", content: "ok thanks" } },
      { type: "message", message: { role: "user", content: "We agreed that the pre-push hook should block main pushes. This is another long sentence for harvesting." } },
    ];

    const result = await runCompactionHarvest({ path: home }, entries, { enabled: true, maxItems: 2, minScore: 1 });
    if (result.harvested !== 2) throw new Error(`Expected 2 harvested, got ${result.harvested}`);
    console.log("✓ runCompactionHarvest scores and harvests high-signal snippets");

    const disabled = await runCompactionHarvest({ path: home }, entries, { enabled: false, maxItems: 2, minScore: 1 });
    if (disabled.harvested !== 0) throw new Error("Expected 0 harvested when disabled");
    console.log("✓ runCompactionHarvest returns zero when disabled");

    await rm(home, { recursive: true, force: true });
    console.log("✓ compaction-harvest test passed");
  } finally {
    // cleanup already done
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
