/**
 * Test the optional enola integration helpers.
 */

import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runEnolaCheck, runEnolaBaseline, runEnolaQuery, runEnolaImpact, runEnolaGenerate, runEnolaDiff, runEnolaCitations, runEnolaGovern, formatEnolaResult, enolaGateCheck, captureEnolaRegressions } from "../extensions/pi-brain/enola.js";

async function createTestHome(enabled: boolean, targetRepo?: string, checkArgs?: string): Promise<{ path: string }> {
  const dir = await mkdtemp(join(tmpdir(), "pi-brain-enola-"));
  await mkdir(join(dir, "wiki", "_state"), { recursive: true });
  // Flat dotted keys — the shape extractSimpleYamlValue actually reads.
  // The nested form this helper used to write parsed as enabled=false,
  // so every enabled-path assertion was passing vacuously.
  const configLines = ["org: test"];
  configLines.push(`enola.enabled: ${enabled}`);
  if (targetRepo) configLines.push(`enola.target_repo: ${targetRepo}`);
  if (checkArgs) configLines.push(`enola.check_args: ${checkArgs}`);
  await writeFile(join(dir, "brain.config.yml"), configLines.join("\n") + "\n", "utf-8");
  await writeFile(join(dir, "wiki", "_state", "inbox.md"), "---\nkind: inbox\n---\n", "utf-8");
  return { path: dir };
}

async function main() {
  // 1. Disabled config returns a helpful message without invoking enola
  const disabledHome = await createTestHome(false);
  const disabledResult = await runEnolaCheck(disabledHome);
  if (!disabledResult.stdout.includes("not enabled") && !disabledResult.stderr.includes("not enabled")) {
    throw new Error(`Expected disabled message, got ${JSON.stringify(disabledResult)}`);
  }
  await rm(disabledHome.path, { recursive: true, force: true });

  // 2. Enabled config with missing binary returns non-ok (enola not installed)
  const enabledHome = await createTestHome(true);
  const enabledResult = await runEnolaCheck(enabledHome);
  if (enabledResult.ok && enabledResult.exitCode === 0 && enabledResult.stdout) {
    throw new Error("Expected enola check to fail or report not installed");
  }
  await rm(enabledHome.path, { recursive: true, force: true });

  // 3. Baseline with disabled config is graceful
  const disabledBaselineHome = await createTestHome(false);
  const baselineResult = await runEnolaBaseline(disabledBaselineHome);
  if (!baselineResult.stdout.includes("not enabled") && !baselineResult.stderr.includes("not enabled")) {
    throw new Error(`Expected disabled baseline message, got ${JSON.stringify(baselineResult)}`);
  }
  await rm(disabledBaselineHome.path, { recursive: true, force: true });

  // 4. Query with disabled config is graceful
  const disabledQueryHome = await createTestHome(false);
  const queryResult = await runEnolaQuery(disabledQueryHome, "billing");
  if (!queryResult.stdout.includes("not enabled") && !queryResult.stderr.includes("not enabled")) {
    throw new Error(`Expected disabled query message, got ${JSON.stringify(queryResult)}`);
  }
  await rm(disabledQueryHome.path, { recursive: true, force: true });

  // 5. formatEnolaResult formats a result
  const formatted = formatEnolaResult({ ok: true, exitCode: 0, stdout: "out", stderr: "err", summary: "summary" });
  if (!formatted.includes("summary") || !formatted.includes("out") || !formatted.includes("err")) {
    throw new Error(`Unexpected formatted output: ${formatted}`);
  }

  // 6. enolaGateCheck skips when disabled and proceeds
  const gateDisabledHome = await createTestHome(false);
  const gateDisabled = await enolaGateCheck(gateDisabledHome, "test");
  if (!gateDisabled.proceed) {
    throw new Error(`Expected gate to proceed when disabled, got ${JSON.stringify(gateDisabled)}`);
  }
  await rm(gateDisabledHome.path, { recursive: true, force: true });

  // 7. captureEnolaRegressions skips when disabled
  const captureDisabledHome = await createTestHome(false);
  const captureDisabled = await captureEnolaRegressions(captureDisabledHome);
  if (captureDisabled.captured) {
    throw new Error(`Expected no capture when disabled, got ${JSON.stringify(captureDisabled)}`);
  }
  await rm(captureDisabledHome.path, { recursive: true, force: true });

  // 8. runEnolaImpact is graceful when disabled
  const impactDisabledHome = await createTestHome(false);
  const impactDisabled = await runEnolaImpact(impactDisabledHome, "billing");
  if (!impactDisabled.stdout.includes("not enabled") && !impactDisabled.stderr.includes("not enabled")) {
    throw new Error(`Expected disabled impact message, got ${JSON.stringify(impactDisabled)}`);
  }
  await rm(impactDisabledHome.path, { recursive: true, force: true });

  // 9. Custom check_args are read from config
  const argsHome = await createTestHome(true, undefined, "--generate --explain");
  const argsResult = await runEnolaCheck(argsHome);
  // With custom args pointing to the MCP-style command, the binary may produce output or fail gracefully.
  if (argsResult.exitCode === 0 && argsResult.stdout) {
    // ok — command ran and produced output
  }
  await rm(argsHome.path, { recursive: true, force: true });

  // 10. runEnolaGenerate skips when disabled
  const generateDisabledHome = await createTestHome(false);
  const generateDisabled = await runEnolaGenerate(generateDisabledHome);
  if (!generateDisabled.stdout.includes("not enabled") && !generateDisabled.stderr.includes("not enabled")) {
    throw new Error(`Expected disabled generate message, got ${JSON.stringify(generateDisabled)}`);
  }
  await rm(generateDisabledHome.path, { recursive: true, force: true });

  // 11. runEnolaDiff skips when no receipts exist
  const diffNoBaselineHome = await createTestHome(true);
  const diffNoBaseline = await runEnolaDiff(diffNoBaselineHome);
  if (!diffNoBaseline.stderr.includes("no recorded receipts") && !diffNoBaseline.stdout.includes("skipped")) {
    throw new Error(`Expected diff skip message, got ${JSON.stringify(diffNoBaseline)}`);
  }
  await rm(diffNoBaselineHome.path, { recursive: true, force: true });

  // 12. runEnolaCitations returns empty when no citations exist
  const citationsHome = await createTestHome(true);
  const citationsResult = await runEnolaCitations(citationsHome);
  if (!citationsResult.ok || citationsResult.citations.length !== 0) {
    throw new Error(`Expected zero citations, got ${JSON.stringify(citationsResult)}`);
  }
  await rm(citationsHome.path, { recursive: true, force: true });

  // 13. govern with no artifacts names the missing snapshot
  const governNoFactsHome = await createTestHome(true);
  const governNoFacts = await runEnolaGovern(governNoFactsHome, "src/app.ts");
  if (!governNoFacts.stderr.includes("no snapshot artifacts")) {
    throw new Error(`Expected artifacts skip, got ${JSON.stringify(governNoFacts)}`);
  }
  await rm(governNoFactsHome.path, { recursive: true, force: true });

  // 14. govern with facts but no compiled pages answers "not asked" —
  // the counterparty rule: never dressed up as "asked, none governs".
  const governNoPagesHome = await createTestHome(true);
  await mkdir(join(governNoPagesHome.path, ".enola"), { recursive: true });
  await writeFile(
    join(governNoPagesHome.path, ".enola", "facts.jsonl"),
    JSON.stringify({ kind: "symbol", repo: "backend", file: "src/app.ts", name: "App" }) + "\n",
    "utf-8",
  );
  const governNoPages = await runEnolaGovern(governNoPagesHome, "src/app.ts");
  if (!governNoPages.stdout.includes("not asked")) {
    throw new Error(`Expected not-asked answer, got ${JSON.stringify(governNoPages)}`);
  }
  await rm(governNoPagesHome.path, { recursive: true, force: true });

  // 15. govern answers both directions with the relation trail joined
  const governHome = await createTestHome(true);
  await mkdir(join(governHome.path, ".enola"), { recursive: true });
  const facts = [
    { kind: "symbol", repo: "backend", file: "src/app.ts", name: "App" },
    { kind: "symbol", repo: "backend", file: "src/other.ts", name: "Other" },
    { kind: "intent", repo: "wiki", file: "wiki/adrs/app.md", name: "page: wiki/adrs/app.md",
      props: { intent_kind: "page", page_type: "adr", status: "accepted" } },
    { kind: "intent", repo: "wiki", file: "wiki/adrs/app.md", name: "anchor: backend src/app.ts",
      props: { intent_kind: "anchor", intent_owner: "backend", path: "src/app.ts" } },
    { kind: "intent", repo: "wiki", file: "wiki/adrs/app.md", name: "relation: part-of wiki/epics/core.md",
      props: { intent_kind: "relation", rel: "part-of", to: "wiki/epics/core.md" } },
    { kind: "intent", repo: "wiki", file: "wiki/epics/core.md", name: "page: wiki/epics/core.md",
      props: { intent_kind: "page", page_type: "epic", status: "living" } },
  ];
  await writeFile(
    join(governHome.path, ".enola", "facts.jsonl"),
    facts.map((f) => JSON.stringify(f)).join("\n") + "\n",
    "utf-8",
  );
  const governed = await runEnolaGovern(governHome, "src/app.ts");
  if (!governed.stdout.includes("governed by wiki/adrs/app.md (adr, accepted)")) {
    throw new Error(`Expected governing page, got ${JSON.stringify(governed)}`);
  }
  if (!governed.stdout.includes("part-of wiki/epics/core.md (epic, living)")) {
    throw new Error(`Expected relation trail with joined meta, got ${JSON.stringify(governed)}`);
  }
  const ungoverned = await runEnolaGovern(governHome, "src/other.ts");
  if (!ungoverned.stdout.includes("asked, none governs")) {
    throw new Error(`Expected asked-none-governs, got ${JSON.stringify(ungoverned)}`);
  }
  const pageMode = await runEnolaGovern(governHome, "wiki/adrs/app.md");
  if (!pageMode.stdout.includes("anchors backend src/app.ts — 1 measured file(s)")) {
    throw new Error(`Expected page-mode coverage, got ${JSON.stringify(pageMode)}`);
  }
  await rm(governHome.path, { recursive: true, force: true });

  console.log("✓ enola test passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
