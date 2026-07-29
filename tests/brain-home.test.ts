/**
 * Brain-home tests: verify discovery and state-reading helpers.
 */

import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  findBrainHome,
  readAutonomy,
  readOrg,
  countPages,
} from "../extensions/pi-brain/brain-home.js";

async function createTempBrainHome(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "pi-brain-home-test-"));
  await mkdir(join(dir, "wiki", "_state"), { recursive: true });
  await mkdir(join(dir, "sources"), { recursive: true });
  await writeFile(join(dir, "brain.config.yml"), "org: Test Org\n", "utf-8");
  await writeFile(join(dir, "wiki", "_state", "inbox.md"), "---\nkind: inbox\n---\n", "utf-8");
  await writeFile(join(dir, "wiki", "page.md"), "---\nkind: note\n---\n\n# page\n", "utf-8");
  return dir;
}

async function main() {
  const home = await createTempBrainHome();
  try {
    // findBrainHome from cwd
    const found = await findBrainHome(home);
    if (!found) throw new Error("Expected findBrainHome to find the temp home");
    if (found.path !== home) throw new Error("Expected path to match temp home");
    console.log("✓ findBrainHome finds home from cwd");

    // findBrainHome respects PI_BRAIN_HOME
    const originalEnv = process.env.PI_BRAIN_HOME;
    process.env.PI_BRAIN_HOME = home;
    const envFound = await findBrainHome("/tmp");
    if (!envFound || envFound.path !== home) throw new Error("Expected PI_BRAIN_HOME to be respected");
    if (originalEnv !== undefined) {
      process.env.PI_BRAIN_HOME = originalEnv;
    } else {
      delete process.env.PI_BRAIN_HOME;
    }
    console.log("✓ findBrainHome respects PI_BRAIN_HOME");

    // readAutonomy fallback
    const state = await readAutonomy({ path: home });
    if (state.enabled !== false) throw new Error("Expected autonomy to be disabled by default");
    console.log("✓ readAutonomy falls back to disabled");

    // readOrg
    const org = await readOrg({ path: home });
    if (org !== "Test Org") throw new Error(`Expected org 'Test Org', got '${org}'`);
    console.log("✓ readOrg reads org from brain.config.yml");

    // readOrg fallback
    const noConfigDir = await mkdtemp(join(tmpdir(), "pi-brain-empty-"));
    try {
      const fallbackOrg = await readOrg({ path: noConfigDir });
      if (fallbackOrg !== "pi-brain") throw new Error("Expected fallback org 'pi-brain'");
      console.log("✓ readOrg falls back to 'pi-brain'");
    } finally {
      await rm(noConfigDir, { recursive: true, force: true });
    }

    // countPages
    const count = await countPages({ path: home });
    if (count !== 1) throw new Error(`Expected 1 page, got ${count}`);
    console.log("✓ countPages excludes _state files");

    console.log("✓ brain-home test passed");
  } finally {
    await rm(home, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
