/**
 * Utility tests: verify shared helpers in extensions/pi-brain/utils.ts.
 */

import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  pathExists,
  parseFrontmatter,
  extractSimpleYamlValue,
  tokenize,
  countInboxItems,
  listInboxItems,
} from "../extensions/pi-brain/utils.js";

async function main() {
  // pathExists
  const tmpDir = await mkdtemp(join(tmpdir(), "pi-brain-utils-test-"));
  const tmpFile = join(tmpDir, "exists.md");
  await writeFile(tmpFile, "# hi", "utf-8");
  if (!(await pathExists(tmpFile))) throw new Error("Expected pathExists to find file");
  if (await pathExists(join(tmpDir, "missing.md"))) throw new Error("Expected pathExists to return false");
  console.log("✓ pathExists detects existing and missing paths");

  // parseFrontmatter
  const withFm = parseFrontmatter("---\nkind: note\n---\n\n# Body\n");
  if (!withFm.valid) throw new Error("Expected valid frontmatter");
  if (!withFm.frontmatter.includes("kind: note")) throw new Error("Expected frontmatter parsed");
  if (!withFm.body.includes("# Body")) throw new Error("Expected body parsed");

  const withoutFm = parseFrontmatter("# No frontmatter\n");
  if (withoutFm.valid) throw new Error("Expected invalid frontmatter");
  console.log("✓ parseFrontmatter extracts frontmatter and body");

  // extractSimpleYamlValue
  const value = extractSimpleYamlValue("org: Test Org\nactive_repos:\n  - x\n", "org");
  if (value !== "Test Org") throw new Error(`Expected 'Test Org', got '${value}'`);
  const missing = extractSimpleYamlValue("foo: bar\n", "org");
  if (missing !== undefined) throw new Error("Expected undefined for missing key");
  console.log("✓ extractSimpleYamlValue reads simple YAML values");

  // tokenize
  const tokens = tokenize("The quick brown fox jumps over the lazy dog.");
  if (!tokens.includes("quick") || !tokens.includes("brown") || !tokens.includes("fox")) {
    throw new Error("Expected meaningful tokens");
  }
  if (tokens.includes("the")) throw new Error("Expected stop words removed");
  console.log("✓ tokenize filters stop words and short tokens");

  // countInboxItems
  const inbox = "# Inbox\n\n### item-one (2026-07-30)\n\n- **summary:** first\n\n### item-two (2026-07-30)\n\n- **summary:** second\n";
  if (countInboxItems(inbox) !== 2) throw new Error("Expected 2 inbox items");
  console.log("✓ countInboxItems counts active inbox sections");

  // listInboxItems
  const items = listInboxItems(inbox, 2);
  if (items.length !== 2) throw new Error("Expected 2 listed items");
  if (items[0].id !== "item-two") throw new Error("Expected most recent item first");
  console.log("✓ listInboxItems returns recent items in reverse order");

  await rm(tmpDir, { recursive: true, force: true });

  console.log("✓ utils test passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
