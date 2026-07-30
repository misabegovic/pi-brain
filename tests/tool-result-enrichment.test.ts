/**
 * Tool-result-enrichment tests: verify enrichment behavior.
 */

import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { enrichToolResult } from "../extensions/pi-brain/tool-result-enrichment.js";

async function createTempBrainHome(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "pi-brain-enrichment-test-"));
  await mkdir(join(dir, "wiki", "brain", "constraints"), { recursive: true });
  await mkdir(join(dir, "wiki", "brain", "records"), { recursive: true });
  await writeFile(join(dir, "brain.config.yml"), "org: Test\n", "utf-8");
  await writeFile(
    join(dir, "wiki", "brain", "constraints", "adr-before-structural-changes.md"),
    "---\nkind: constraint\nstatus: active\nseverity: must\ncategory: workflow\nglobs:\n  - extensions/**\n---\n\n# Constraint\n",
    "utf-8"
  );
  await writeFile(
    join(dir, "wiki", "brain", "records", "tap-pi-extension-surface.md"),
    "---\nkind: record\n---\n\n# Record\n\nExtension surface record.\n",
    "utf-8"
  );
  return dir;
}

async function main() {
  const home = await createTempBrainHome();
  try {
    // Disabled: returns undefined.
    const disabled = await enrichToolResult(
      { path: home },
      { toolName: "read", input: { path: join(home, "extensions", "pi-brain.ts") }, content: "content" },
      { enabled: false, maxRelated: 2, largeOutputThreshold: 4000 }
    );
    if (disabled !== undefined) throw new Error("Expected undefined when disabled");
    console.log("✓ enrichToolResult returns undefined when disabled");

    // Large output: should add size warning.
    const largeContent = "x".repeat(5000);
    const large = await enrichToolResult(
      { path: home },
      { toolName: "read", input: { path: join(home, "extensions", "pi-brain.ts") }, content: largeContent },
      { enabled: true, maxRelated: 2, largeOutputThreshold: 4000 }
    );
    if (!large) throw new Error("Expected enrichment for large output");
    const largeText = large.content.map((c: any) => c.text).join("");
    if (!largeText.includes("Tool output is large")) throw new Error("Expected size warning");
    console.log("✓ enrichToolResult warns on large outputs");

    await rm(home, { recursive: true, force: true });
    console.log("✓ tool-result-enrichment test passed");
  } finally {
    // cleanup already done
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
