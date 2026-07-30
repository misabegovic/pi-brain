/**
 * Pre-push hook test: verify the hook blocks main pushes and allows overrides.
 */

import { spawn } from "node:child_process";
import { join } from "node:path";

const hookPath = join(import.meta.dirname, "..", "tools", "git-hooks", "pre-push");

function runHook(env: Record<string, string> = {}, ref = "refs/heads/main"): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  const stdin = `${ref} ${"a".repeat(40)} ${ref} ${"b".repeat(40)}\n`;
  return new Promise((resolve) => {
    const child = spawn("sh", [hookPath], {
      env: { ...process.env, ...env },
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (data) => { stdout += data; });
    child.stderr.on("data", (data) => { stderr += data; });
    child.on("close", (exitCode) => {
      resolve({ exitCode: exitCode ?? 0, stdout, stderr });
    });
    child.stdin.write(stdin);
    child.stdin.end();
  });
}

async function main() {
  // Block push to main without override
  const blocked = await runHook();
  if (blocked.exitCode === 0) throw new Error("Expected main push to be blocked");
  const blockedOutput = blocked.stdout + blocked.stderr;
  if (!blockedOutput.includes("Direct pushes to main are disabled")) {
    throw new Error("Expected helpful error message");
  }
  console.log("✓ pre-push hook blocks direct main push");

  // Allow push to feature branch
  const feature = await runHook({}, "refs/heads/feature/x");
  if (feature.exitCode !== 0) throw new Error("Expected feature branch push to pass");
  console.log("✓ pre-push hook allows feature branch push");

  // Allow override with ALLOW_MAIN_PUSH
  const override = await runHook({ ALLOW_MAIN_PUSH: "1" });
  if (override.exitCode !== 0) throw new Error("Expected override to pass");
  console.log("✓ pre-push hook allows ALLOW_MAIN_PUSH override");

  console.log("✓ pre-push hook test passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
