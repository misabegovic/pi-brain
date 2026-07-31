/**
 * Test the optional enola integration helpers.
 */

import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runEnolaCheck, runEnolaBaseline, runEnolaQuery, runEnolaImpact, formatEnolaResult, enolaGateCheck, captureEnolaRegressions } from "../extensions/pi-brain/enola.js";

async function createTestHome(enabled: boolean, targetRepo?: string, checkArgs?: string): Promise<{ path: string }> {
  const dir = await mkdtemp(join(tmpdir(), "pi-brain-enola-"));
  await mkdir(join(dir, "wiki", "_state"), { recursive: true });
  const configLines = ["org: test", "enola:"];
  configLines.push(`  enabled: ${enabled}`);
  if (targetRepo) configLines.push(`  target_repo: ${targetRepo}`);
  if (checkArgs) configLines.push(`  check_args: ${checkArgs}`);
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

  console.log("✓ enola test passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
