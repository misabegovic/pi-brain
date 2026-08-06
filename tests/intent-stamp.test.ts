/**
 * Test the derived enola_intent stamp (tools/brain-intent.mjs).
 *
 * The block is derived from frontmatter the page already carries and the
 * stamp is idempotent — a second run changes nothing, and --check exits 1
 * exactly when a page drifted from its derivation.
 */

import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HOME = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TOOL = join(HOME, "tools", "brain-intent.mjs");

function run(args: string[] = []) {
  return spawnSync("node", [TOOL, ...args], { cwd: HOME, encoding: "utf-8" });
}

function main() {
  // 1. The live wiki is stamped and idempotent: a plain run changes nothing.
  const first = run();
  if (first.status !== 0) throw new Error(`stamp failed: ${first.stderr}`);
  if (!/stamped 0, unchanged \d+/.test(first.stdout)) {
    throw new Error(`Expected the committed wiki to be already stamped, got: ${first.stdout}`);
  }

  // 2. --check passes on the stamped wiki.
  const check = run(["--check"]);
  if (check.status !== 0) throw new Error(`--check failed on a clean wiki: ${check.stderr}`);

  // 3. Drift is caught: hand-edit a derived block, --check exits 1, restamp heals.
  const victim = join(HOME, "wiki", "brain", "adrs", "adr-live-status-widget-refresh.md");
  const original = readFileSync(victim, "utf-8");
  try {
    writeFileSync(victim, original.replace("    type: adr", "    type: hand-edited"), "utf-8");
    const drifted = run(["--check"]);
    if (drifted.status === 0) throw new Error("--check must fail on a drifted block");
    if (!drifted.stderr.includes("adr-live-status-widget-refresh.md")) {
      throw new Error(`--check must name the drifted page, got: ${drifted.stderr}`);
    }
    const heal = run();
    if (heal.status !== 0 || !heal.stdout.includes("stamped 1")) {
      throw new Error(`restamp must heal exactly the drifted page, got: ${heal.stdout}`);
    }
    if (readFileSync(victim, "utf-8") !== original) {
      throw new Error("restamp must reproduce the original derivation byte-for-byte");
    }
  } finally {
    writeFileSync(victim, original, "utf-8");
  }

  console.log("✓ intent-stamp test passed");
}

main();
