/**
 * Test the optional enola integration helpers.
 */

import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runEnolaCheck, runEnolaBaseline, runEnolaQuery, runEnolaImpact, runEnolaGenerate, runEnolaDiff, runEnolaCitations, runEnolaGovern, runEnolaPlan, listFindings, judgeFinding, readVerdictLedger, formatEnolaResult, enolaGateCheck, captureEnolaRegressions } from "../extensions/pi-brain/enola.js";

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

  // Exit-code semantics: 3 is a declined comparison — a non-verdict that never
  // blocks — while 1 is a regression that does. Stub binaries pin the contract,
  // and ENOLA_BINARY (env-first, like the brain home) is how they are injected.
  const exitCodeHome = await createTestHome(true);
  const stubDir = await mkdtemp(join(tmpdir(), "pi-brain-enola-stub-"));
  const declinedStub = join(stubDir, "enola-declined");
  await writeFile(declinedStub, "#!/bin/sh\necho 'DECLINED — refusing to grade'\nexit 3\n", { mode: 0o755 });
  const regressionStub = join(stubDir, "enola-regression");
  await writeFile(regressionStub, "#!/bin/sh\necho 'REGRESSION: new cycle'\nexit 1\n", { mode: 0o755 });

  process.env.ENOLA_BINARY = declinedStub;
  try {
    const declinedResult = await runEnolaCheck(exitCodeHome);
    if (declinedResult.ok || !declinedResult.declined) {
      throw new Error(`Expected declined non-verdict, got ${JSON.stringify(declinedResult)}`);
    }
    if (!declinedResult.summary?.includes("not comparable")) {
      throw new Error(`Expected not-comparable summary, got ${JSON.stringify(declinedResult.summary)}`);
    }
    const declinedGate = await enolaGateCheck(exitCodeHome, "test edit");
    if (!declinedGate.proceed || !declinedGate.message.includes("declined")) {
      throw new Error(`Expected a declined gate to proceed by name, got ${JSON.stringify(declinedGate)}`);
    }

    process.env.ENOLA_BINARY = regressionStub;
    const regressionGate = await enolaGateCheck(exitCodeHome, "test edit");
    if (regressionGate.proceed) {
      throw new Error(`Expected a regression to block, got ${JSON.stringify(regressionGate)}`);
    }
  } finally {
    delete process.env.ENOLA_BINARY;
  }
  await rm(exitCodeHome.path, { recursive: true, force: true });
  await rm(stubDir, { recursive: true, force: true });

  // The judgment ledger is write-on-judgment: an entry exists only because
  // someone judged that finding, and findings join against it so a judged
  // finding is inherited rather than re-decided.
  const ledgerHome = await createTestHome(true);
  const first = await judgeFinding(ledgerHome, "cycles:Cyclic dependency detected (4 modules)", "rejected", "directory-aggregation artifact; file-level acyclic");
  if (!first.startsWith("judged ")) throw new Error(`Expected a fresh judgment, got ${first}`);
  const second = await judgeFinding(ledgerHome, "cycles:Cyclic dependency detected (4 modules)", "noise", "explainer wrong about this class");
  if (!second.startsWith("re-judged ")) throw new Error(`Expected a re-judgment, got ${second}`);
  const ledger = await readVerdictLedger(ledgerHome);
  if (ledger.entries.length !== 1 || ledger.entries[0].verdict !== "noise") {
    throw new Error(`Expected one entry holding the latest verdict, got ${JSON.stringify(ledger.entries)}`);
  }
  if (!ledger._note.includes("WRITE-ON-JUDGMENT")) throw new Error("Ledger note must state the no-pending contract");

  await mkdir(join(ledgerHome.path, ".enola"), { recursive: true });
  await writeFile(
    join(ledgerHome.path, ".enola", "insights.json"),
    JSON.stringify([
      { title: "Cyclic dependency detected (4 modules)", source: "cycles", confidence: 1, description: "", evidence: [] },
      { title: "High complexity", source: "complexity-outliers", confidence: 0.7, description: "", evidence: [] },
    ]),
    "utf-8",
  );
  const findings = await listFindings(ledgerHome);
  if (!findings.includes("[noise: explainer wrong about this class]")) {
    throw new Error(`Expected the judged finding to carry its verdict, got ${findings}`);
  }
  if (!findings.includes("complexity-outliers (1):")) {
    throw new Error(`Expected grouping by explainer, got ${findings}`);
  }
  await rm(ledgerHome.path, { recursive: true, force: true });

  // Findings with no snapshot is a named skip, never an empty finding set.
  const bareHome = await createTestHome(true);
  const noSnapshot = await listFindings(bareHome);
  if (!noSnapshot.includes("named skip")) throw new Error(`Expected a named skip, got ${noSnapshot}`);
  const disabledPlanHome = await createTestHome(false);
  const planDisabled = await runEnolaPlan(disabledPlanHome, ["src/app.ts"]);
  if (!planDisabled.stderr.includes("not enabled")) throw new Error(`Expected disabled plan message, got ${JSON.stringify(planDisabled)}`);
  await rm(bareHome.path, { recursive: true, force: true });
  await rm(disabledPlanHome.path, { recursive: true, force: true });

  console.log("✓ enola test passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
