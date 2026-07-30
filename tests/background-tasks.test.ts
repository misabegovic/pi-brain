/**
 * Test the background task runner queue mechanics and lifecycle.
 */

import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import {
  enqueueTask,
  listTasks,
  runTasks,
  type BrainTask,
} from "../extensions/pi-brain/tasks.js";

async function createTestHome(): Promise<{ path: string }> {
  const dir = await mkdtemp(join(tmpdir(), "pi-brain-bg-tasks-"));
  await mkdir(join(dir, "wiki", "_state"), { recursive: true });
  await mkdir(join(dir, "sources"), { recursive: true });
  await writeFile(join(dir, "brain.config.yml"), "org: test\n", "utf-8");
  await writeFile(join(dir, "wiki", "_state", "inbox.md"), "---\nkind: inbox\n---\n", "utf-8");
  return { path: dir };
}

async function main() {
  const home = await createTestHome();

  // 1. Enqueue tasks
  const task1 = await enqueueTask(home, "run sync", "sync", "brain");
  const task2 = await enqueueTask(home, "groom stale items", "groom", "brain");
  if (task1.operation !== "sync" || task2.operation !== "groom") {
    throw new Error("enqueueTask did not preserve operation");
  }

  // 2. List tasks
  const before = await listTasks(home);
  if (before.pending.length !== 2) {
    throw new Error(`Expected 2 pending tasks, got ${before.pending.length}`);
  }

  // 3. Mock subprocess execution to avoid spawning pi
  let calls = 0;
  const mockExecutor = async (_task: BrainTask, _cwd: string) => {
    calls++;
    return { output: "mocked success", exitCode: 0 };
  };

  const result = await runTasks(home, home.path, mockExecutor);
  if (result.completed !== 2 || result.failed !== 0) {
    throw new Error(`Expected 2 completed, 0 failed; got ${JSON.stringify(result)}`);
  }
  if (calls !== 2) {
    throw new Error(`Expected subprocess to be called twice, got ${calls}`);
  }

  // 4. Verify final state
  const after = await listTasks(home);
  if (after.pending.length !== 0 || after.running.length !== 0 || after.completed.length !== 2) {
    throw new Error(`Unexpected final task state: ${JSON.stringify({
      pending: after.pending.length,
      running: after.running.length,
      completed: after.completed.length,
      failed: after.failed.length,
    })}`);
  }
  for (const t of after.completed) {
    if (t.attempts !== 1) throw new Error(`Expected attempts=1, got ${t.attempts}`);
    if (t.output !== "mocked success") throw new Error(`Expected output saved, got ${t.output}`);
  }

  // 5. Verify blocked operation fails to enqueue
  let blocked = false;
  try {
    await enqueueTask(home, "bad op", "shelves" as any, "brain");
  } catch {
    blocked = true;
  }
  if (!blocked) {
    throw new Error("Expected enqueueTask to reject blocked operation 'shelves'");
  }

  // Cleanup
  await rm(home.path, { recursive: true, force: true });

  console.log("✓ background-tasks test passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
