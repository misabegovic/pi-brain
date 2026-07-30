#!/usr/bin/env node
/**
 * run-tasks — standalone background-task runner for pi-brain.
 *
 * Run from the root of a pi-brain clone:
 *   node tools/run-tasks.mjs
 *
 * Processes all pending tasks in wiki/_state/tasks/pending/ and moves them
 * to completed/ or failed/. Exits 0 if all tasks succeed, 1 otherwise.
 */

import { runTasks, listTasks } from "../extensions/pi-brain/tasks.ts";

const CWD = process.cwd();
const HOME = { path: CWD };

async function main() {
  const before = await listTasks(HOME);
  if (before.pending.length === 0) {
    console.log("No pending background tasks.");
    return;
  }

  console.log(`Running ${before.pending.length} pending background tasks...`);
  const result = await runTasks(HOME, CWD);
  console.log(`Done: ${result.completed} completed, ${result.failed} failed.`);

  if (result.failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
