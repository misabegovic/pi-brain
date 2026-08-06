/**
 * Intent-first contract tests: target classification, the once-per-
 * piece-of-work gate, and the next-turn intent-debt accounting.
 */

import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  classifyIntentTarget,
  gateFirstTouch,
  readIntentFirstConfig,
  recordIntentTarget,
  takeIntentDebt,
} from "../extensions/pi-brain/intent-first.js";
import type { BrainHome } from "../extensions/pi-brain/types.js";

async function main() {
  const root = mkdtempSync(join(tmpdir(), "pi-brain-intent-first-"));
  const homePath = join(root, "my-brain");
  mkdirSync(join(homePath, "wiki", "_views"), { recursive: true });
  const repoPath = join(root, "warehouse-app");
  mkdirSync(join(repoPath, ".git"), { recursive: true });
  mkdirSync(join(repoPath, "app", "models"), { recursive: true });
  const home = { path: homePath } as BrainHome;

  try {
    // 1. Classification: sibling code, brain spec, generated view, outsider.
    const code = classifyIntentTarget(home, root, join(repoPath, "app", "models", "shift.rb"));
    if (code?.kind !== "code" || code.repoName !== "warehouse-app" || code.relPath !== "app/models/shift.rb") {
      throw new Error(`sibling file misclassified: ${JSON.stringify(code)}`);
    }

    const spec = classifyIntentTarget(home, root, join(homePath, "wiki", "adrs", "shift-scheduling.md"));
    if (spec?.kind !== "spec") throw new Error(`wiki page misclassified: ${JSON.stringify(spec)}`);

    if (classifyIntentTarget(home, root, join(homePath, "wiki", "_views", "pages.json")) !== null) {
      throw new Error("generated view counted as a spec");
    }
    if (classifyIntentTarget(home, root, join(tmpdir(), "elsewhere.rb")) !== null) {
      throw new Error("path outside the projects root classified");
    }

    // 2. The gate fires once per repo per piece of work.
    if (!gateFirstTouch("s1", "warehouse-app")) throw new Error("first touch did not gate");
    if (gateFirstTouch("s1", "warehouse-app")) throw new Error("second touch gated again");
    if (!gateFirstTouch("s1", "clinic-app")) throw new Error("second repo did not gate");

    // 3. Code without a spec accrues debt; taking it resets the state.
    recordIntentTarget("s1", code);
    const debt = takeIntentDebt("s1");
    if (!debt || !debt.includes("app/models/shift.rb (warehouse-app)")) {
      throw new Error(`expected debt naming the moved file, got: ${debt}`);
    }
    if (takeIntentDebt("s1") !== null) throw new Error("debt survived its own take");
    if (!gateFirstTouch("s1", "warehouse-app")) throw new Error("gate did not re-arm after take");

    // 4. A spec moving in the same piece of work clears the debt.
    recordIntentTarget("s2", code);
    recordIntentTarget("s2", spec);
    if (takeIntentDebt("s2") !== null) throw new Error("debt reported although a spec moved");

    // 5. Config: default enabled, flat key disables.
    writeFileSync(join(homePath, "brain.config.yml"), "org: Test\n", "utf-8");
    const config = await readIntentFirstConfig(home);
    if (!config.enabled) throw new Error("intent_first should default to enabled");
    writeFileSync(join(homePath, "brain.config.yml"), "org: Test\nintent_first: false\n", "utf-8");
    const disabled = await readIntentFirstConfig(home);
    if (disabled.enabled) throw new Error("intent_first: false did not disable");
    console.log("intent-first: all assertions passed");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

await main();
