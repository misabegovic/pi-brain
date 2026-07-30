/**
 * Context-injection tests: verify relevant-record injection.
 */

import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { buildInjectedMessages } from "../extensions/pi-brain/context-injection.js";

async function createTempBrainHome(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "pi-brain-context-test-"));
  await mkdir(join(dir, "wiki", "brain", "records"), { recursive: true });
  await writeFile(join(dir, "brain.config.yml"), "org: Test\n", "utf-8");
  await writeFile(
    join(dir, "wiki", "brain", "records", "autonomy.md"),
    "---\nkind: record\n---\n\n# Autonomy\n\nThe autonomous refinement protocol runs continuously.\n",
    "utf-8"
  );
  await writeFile(
    join(dir, "wiki", "brain", "records", "other.md"),
    "---\nkind: record\n---\n\n# Other\n\nThis record is unrelated to the query.\n",
    "utf-8"
  );
  return dir;
}

async function main() {
  const home = await createTempBrainHome();
  try {
    const messages = [{ role: "user", content: "autonomous refinement protocol" }];

    // Enabled: should inject context.
    const injected = await buildInjectedMessages({ path: home }, messages, { enabled: true, maxRecords: 2, minScore: 0 });
    if (!injected || injected.length <= messages.length) throw new Error("Expected injected context");
    const last = injected[injected.length - 1];
    if (!last.content.includes("Relevant brain context")) throw new Error("Expected context header");
    console.log("✓ buildInjectedMessages adds relevant context when enabled");

    // Disabled: should return undefined.
    const disabled = await buildInjectedMessages({ path: home }, messages, { enabled: false, maxRecords: 2, minScore: 0 });
    if (disabled !== undefined) throw new Error("Expected undefined when disabled");
    console.log("✓ buildInjectedMessages returns undefined when disabled");

    await rm(home, { recursive: true, force: true });
    console.log("✓ context-injection test passed");
  } finally {
    // cleanup already done
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
