/**
 * Run every tests/*.test.ts sequentially — the package.json test script
 * used to chain 27 tsx invocations with `&&`, and every new test file
 * meant editing that one-liner. Files run sorted, each in its own
 * process (they are standalone scripts with their own main()).
 */

import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const TESTS = resolve(dirname(fileURLToPath(import.meta.url)));
const files = readdirSync(TESTS).filter((f) => f.endsWith(".test.ts")).sort();

let failed = 0;
for (const file of files) {
  const result = spawnSync("npx", ["tsx", join(TESTS, file)], {
    stdio: "inherit",
    cwd: resolve(TESTS, ".."),
  });
  if (result.status !== 0) {
    console.error(`✗ ${file} failed (exit ${result.status})`);
    failed += 1;
  }
}

if (failed > 0) {
  console.error(`${failed} of ${files.length} test file(s) failed`);
  process.exit(1);
}
console.log(`✓ all ${files.length} test files passed`);
