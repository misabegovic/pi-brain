#!/usr/bin/env node
/**
 * run-tasks — standalone background-task runner for pi-brain.
 *
 * Run from the root of a pi-brain clone:
 *   node tools/run-tasks.mjs
 *   node tools/run-tasks.mjs --task-id=<uuid>
 *
 * Processes pending tasks in wiki/_state/tasks/pending/ and moves them
 * to completed/ or failed/. Exits 0 on success, 1 otherwise.
 */

import { runTasks, listTasks } from "../extensions/pi-brain/tasks.ts";

const CWD = process.cwd();
const HOME = { path: CWD };

function parseTaskIdArg() {
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith("--task-id=")) {
      return arg.slice("--task-id=".length);
    }
  }
  return undefined;
}

async function main() {
  const taskId = parseTaskIdArg();

  if (taskId) {
    const before = await listTasks(HOME);
    const task = before.pending.find((t) => t.id === taskId);
    if (!task) {
      console.error(`Pending task ${taskId} not found.`);
      process.exit(1);
    }
    console.log(`Running task ${taskId}...`);
    const result = await runTasks(HOME, CWD, undefined, { only: taskId });
    console.log(`Done: ${result.completed} completed, ${result.failed} failed.`);
    if (result.failed > 0) process.exit(1);
    return;
  }

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
