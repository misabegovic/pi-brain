/**
 * Inbox tests: verify inbox entry building and auto-ingest batch helpers.
 */

import { mkdtemp, writeFile, mkdir, rm, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  buildInboxEntry,
  appendInboxItem,
  replaceInboxItem,
  readAutoIngestBatch,
  writeAutoIngestBatch,
  appendAutoIngestBatch,
} from "../extensions/pi-brain/inbox.js";

async function createTempBrainHome(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "pi-brain-inbox-test-"));
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
    // buildInboxEntry
    const entry = buildInboxEntry("test-item", "2026-07-30", "ingest", "test summary");
    if (!entry.includes("### test-item (2026-07-30)")) throw new Error("Expected header");
    if (!entry.includes("test summary")) throw new Error("Expected summary");
    console.log("✓ buildInboxEntry formats inbox entries");

    // appendInboxItem
    await appendInboxItem({ path: home }, "Test Item", "note body");
    const inboxAfterAppend = await readFile(join(home, "wiki", "_state", "inbox.md"), "utf-8");
    if (!inboxAfterAppend.includes("note body")) throw new Error("Expected appended item");
    console.log("✓ appendInboxItem adds items to inbox");

    // replaceInboxItem
    const newEntry = buildInboxEntry("test-item", "2026-07-30", "ingest", "updated summary");
    await replaceInboxItem({ path: home }, "test-item", newEntry);
    const inboxAfterReplace = await readFile(join(home, "wiki", "_state", "inbox.md"), "utf-8");
    if (!inboxAfterReplace.includes("updated summary")) throw new Error("Expected replaced item");
    console.log("✓ replaceInboxItem updates existing items");

    // read/write auto-ingest batch
    const batch = await readAutoIngestBatch({ path: home });
    if (batch.entries.length !== 0) throw new Error("Expected empty batch");
    await writeAutoIngestBatch({ path: home }, { entries: [{ source: "s", targetPath: "t", date: "2026-07-30" }], createdAt: "2026-07-30" });
    const batch2 = await readAutoIngestBatch({ path: home });
    if (batch2.entries.length !== 1) throw new Error("Expected one batch entry");
    console.log("✓ read/writeAutoIngestBatch round-trips batch state");

    // appendAutoIngestBatch updates inbox
    await appendAutoIngestBatch({ path: home }, "https://example.com", join(home, "sources", "web", "test.md"));
    const inboxAfterBatch = await readFile(join(home, "wiki", "_state", "inbox.md"), "utf-8");
    if (!inboxAfterBatch.includes("Auto-ingested")) throw new Error("Expected auto-ingest inbox entry");
    console.log("✓ appendAutoIngestBatch creates inbox entry");

    await rm(home, { recursive: true, force: true });
    console.log("✓ inbox test passed");
  } finally {
    // cleanup already done
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
