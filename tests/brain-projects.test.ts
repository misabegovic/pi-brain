/**
 * Brain-projects tests: verify helper functions for listing projects.
 */

// @ts-ignore .mjs tool has no declaration file
import { extractYamlValue, parseFrontmatter, getScopesFromConfig } from "../tools/brain-projects.mjs";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

async function main() {
  // extractYamlValue
  const value = extractYamlValue("org: Test Org\nstatus: active\n", "org");
  if (value !== "Test Org") throw new Error(`Expected 'Test Org', got '${value}'`);
  console.log("✓ extractYamlValue reads frontmatter values");

  // parseFrontmatter
  const fm = parseFrontmatter("---\nkind: note\n---\n\n# Body\n");
  if (!fm || !fm.includes("kind: note")) throw new Error("Expected frontmatter");
  const noFm = parseFrontmatter("# No frontmatter");
  if (noFm !== null) throw new Error("Expected null for missing frontmatter");
  console.log("✓ parseFrontmatter extracts frontmatter");

  // getScopesFromConfig
  const dir = await mkdtemp(join(tmpdir(), "pi-brain-projects-test-"));
  try {
    await writeFile(join(dir, "brain.config.yml"), "org: Test\nactive_repos:\n  - alpha\n  - beta\n", "utf-8");
    const scopes = await getScopesFromConfig(join(dir, "brain.config.yml"));
    if (scopes.length !== 2) throw new Error(`Expected 2 scopes, got ${scopes.length}`);
    if (!scopes.includes("alpha") || !scopes.includes("beta")) throw new Error("Expected alpha and beta");
    console.log("✓ getScopesFromConfig reads active_repos");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }

  console.log("✓ brain-projects test passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
