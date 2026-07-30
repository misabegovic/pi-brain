import { spawn } from "node:child_process";
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import * as path from "node:path";
import { randomUUID } from "node:crypto";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { BrainHome, AutonomyTrustConfig } from "./types.ts";
import { requireBrain } from "./context.ts";
import { getTrustLevel, shouldProceed } from "./autonomy.ts";
import { isValidIdentifier } from "./utils.ts";

const ALLOWED_BG_OPERATIONS = new Set(["sync", "groom", "refine", "suggest"]);

type TaskStatus = "pending" | "running" | "completed" | "failed";

export interface BrainTask {
  id: string;
  description: string;
  operation: keyof AutonomyTrustConfig;
  scope: string;
  createdAt: string;
  maxAttempts: number;
  attempts: number;
  error?: string;
  output?: string;
}

function taskDir(home: BrainHome, status: TaskStatus): string {
  return path.join(home.path, "wiki", "_state", "tasks", status);
}

async function ensureTaskDirs(home: BrainHome): Promise<void> {
  for (const status of ["pending", "running", "completed", "failed"] as TaskStatus[]) {
    await mkdir(taskDir(home, status), { recursive: true });
  }
}

async function loadTask(filePath: string): Promise<BrainTask | null> {
  try {
    const text = await readFile(filePath, "utf-8");
    return JSON.parse(text) as BrainTask;
  } catch {
    return null;
  }
}

async function saveTask(home: BrainHome, task: BrainTask, status: TaskStatus): Promise<void> {
  await ensureTaskDirs(home);
  const filePath = path.join(taskDir(home, status), `${task.id}.json`);
  await writeFile(filePath, JSON.stringify(task, null, 2), "utf-8");
}

async function moveTask(home: BrainHome, task: BrainTask, from: TaskStatus, to: TaskStatus): Promise<void> {
  const fromPath = path.join(taskDir(home, from), `${task.id}.json`);
  if (existsSync(fromPath)) {
    await unlink(fromPath);
  }
  await saveTask(home, task, to);
}

function getPiInvocation(args: string[]): { command: string; args: string[] } {
  const currentScript = process.argv[1];
  const isBunVirtualScript = currentScript?.startsWith("/$bunfs/root/");
  const scriptBase = currentScript ? path.basename(currentScript).toLowerCase() : "";
  const execName = path.basename(process.execPath).toLowerCase();
  const isGenericRuntime = /^(node|bun)(\.exe)?$/.test(execName);

  // If we're running inside the pi binary itself (not under node/bun with a
  // helper script), re-invoke pi with the same binary and arguments.
  if (!isGenericRuntime && currentScript && !isBunVirtualScript && existsSync(currentScript)) {
    return { command: process.execPath, args: [currentScript, ...args] };
  }

  // If we're running under node/bun but the script is the pi binary, reuse it.
  if (
    isGenericRuntime &&
    (scriptBase === "pi" || scriptBase === "pi.exe") &&
    currentScript &&
    !isBunVirtualScript &&
    existsSync(currentScript)
  ) {
    return { command: process.execPath, args: [currentScript, ...args] };
  }

  if (!isGenericRuntime) {
    return { command: process.execPath, args };
  }
  return { command: "pi", args };
}

export async function executeTaskSubprocess(task: BrainTask, cwd: string): Promise<{ output: string; exitCode: number }> {
  const prompt = [
    `You are running a background task for pi-brain.`,
    ``,
    `Task: ${task.description}`,
    `Operation: ${task.operation}`,
    `Scope: ${task.scope}`,
    ``,
    `Instructions:`,
    `- This is a background task. Do not ask the user questions.`,
    `- Perform the task using pi-brain tools and commands.`,
    `- Only low-risk operations are allowed.`,
    `- Do not edit approved shelves, commit, push, or make structural/repo changes.`,
    `- Report what you did and any findings concisely.`,
  ].join("\n");

  const args: string[] = ["--mode", "json", "-p", "--no-session", prompt];
  const invocation = getPiInvocation(args);

  return new Promise<{ output: string; exitCode: number }>((resolve) => {
    const proc = spawn(invocation.command, invocation.args, {
      cwd,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let buffer = "";
    let stderr = "";

    const processLine = (line: string) => {
      if (!line.trim()) return;
      let event: any;
      try {
        event = JSON.parse(line);
      } catch {
        return;
      }
      if (event.type === "message_end" && event.message?.role === "assistant") {
        for (const part of event.message.content ?? []) {
          if (part.type === "text") buffer += part.text;
        }
      }
    };

    proc.stdout.on("data", (data) => {
      buffer += data.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) processLine(line);
    });

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (buffer.trim()) processLine(buffer);
      resolve({ output: stderr || buffer || "(no output)", exitCode: code ?? 0 });
    });

    proc.on("error", (err) => {
      resolve({ output: err.message, exitCode: 1 });
    });
  });
}

export async function enqueueTask(
  home: BrainHome,
  description: string,
  operation: keyof AutonomyTrustConfig,
  scope: string,
): Promise<BrainTask> {
  if (!ALLOWED_BG_OPERATIONS.has(operation)) {
    throw new Error(`Operation ${operation} is not allowed for background tasks.`);
  }
  const task: BrainTask = {
    id: randomUUID(),
    description,
    operation,
    scope,
    createdAt: new Date().toISOString(),
    maxAttempts: 3,
    attempts: 0,
  };
  await saveTask(home, task, "pending");
  return task;
}

export async function listTasks(home: BrainHome): Promise<Record<TaskStatus, BrainTask[]>> {
  await ensureTaskDirs(home);
  const result: Record<TaskStatus, BrainTask[]> = { pending: [], running: [], completed: [], failed: [] };
  for (const status of Object.keys(result) as TaskStatus[]) {
    const dir = taskDir(home, status);
    const files = await readdir(dir).catch(() => [] as string[]);
    for (const file of files.filter((f) => f.endsWith(".json"))) {
      const task = await loadTask(path.join(dir, file));
      if (task) result[status].push(task);
    }
    result[status].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  return result;
}

export async function runTasks(
  home: BrainHome,
  cwd: string,
  executor: (task: BrainTask, cwd: string) => Promise<{ output: string; exitCode: number }> = executeTaskSubprocess,
): Promise<{ completed: number; failed: number }> {
  await ensureTaskDirs(home);
  const all = await listTasks(home);
  let completed = 0;
  let failed = 0;

  for (const task of all.pending) {
    const trust = await getTrustLevel(home, task.operation);
    if (!shouldProceed(trust)) {
      task.attempts++;
      task.error = `Operation ${task.operation} is blocked by autonomy trust.`;
      await moveTask(home, task, "pending", "failed");
      failed++;
      continue;
    }

    await moveTask(home, task, "pending", "running");
    const result = await executor(task, cwd);
    task.attempts++;

    if (result.exitCode === 0) {
      task.output = result.output.slice(0, 2000);
      await moveTask(home, task, "running", "completed");
      completed++;
    } else {
      task.error = result.output.slice(0, 2000);
      if (task.attempts >= task.maxAttempts) {
        await moveTask(home, task, "running", "failed");
        failed++;
      } else {
        await moveTask(home, task, "running", "pending");
      }
    }
  }

  // Clean up old running tasks that may have been left behind
  for (const task of all.running) {
    task.error = "Task was still marked running when run-tasks started.";
    await moveTask(home, task, "running", "failed");
    failed++;
  }

  return { completed, failed };
}

export async function runTasksDetached(home: BrainHome, cwd: string): Promise<{ started: boolean; pid?: number; message: string }> {
  await ensureTaskDirs(home);
  const all = await listTasks(home);
  if (all.pending.length === 0) {
    return { started: false, message: "No pending background tasks." };
  }

  const runnerPath = path.join(home.path, "tools", "run-tasks.mjs");
  const command = process.execPath;
  const args: string[] = [];

  // If the current process was launched via tsx/npx, preserve that so the
  // runner can import TypeScript source files.
  const currentScript = process.argv[1];
  if (currentScript && /tsx|ts-node/.test(currentScript)) {
    args.push(currentScript);
  }
  args.push(runnerPath);

  const proc = spawn(command, args, {
    cwd,
    detached: true,
    stdio: ["ignore", "ignore", "ignore"],
  });
  proc.unref();

  return {
    started: true,
    pid: proc.pid ?? undefined,
    message: `Started ${all.pending.length} background task(s) (pid ${proc.pid}). Check /brain:tasks for status.`,
  };
}

export function registerTasks(pi: ExtensionAPI) {
  pi.registerCommand("brain:enqueue", {
    description: "Enqueue a background task (usage: /brain:enqueue <scope> <operation> <description>)",
    handler: async (args, ctx) => {
      const trimmed = args.trim();
      if (!trimmed) {
        ctx.ui.notify("Usage: /brain:enqueue <scope> <operation> <description>", "warning");
        return;
      }
      const parts = trimmed.split(/\s+/);
      if (parts.length < 3) {
        ctx.ui.notify("Usage: /brain:enqueue <scope> <operation> <description>", "warning");
        return;
      }
      const [scope, operation, ...descriptionParts] = parts;
      if (!isValidIdentifier(scope)) {
        ctx.ui.notify("Scope must be a simple identifier (letters, numbers, -, _).", "warning");
        return;
      }
      const description = descriptionParts.join(" ");
      const home = await requireBrain(ctx.cwd);
      if (!home) {
        ctx.ui.notify("No pi-brain home found.", "error");
        return;
      }
      try {
        const task = await enqueueTask(home, description, operation as keyof AutonomyTrustConfig, scope);
        ctx.ui.notify(`Enqueued task ${task.id}`, "info");
      } catch (err: any) {
        ctx.ui.notify(`Failed to enqueue: ${err.message}`, "error");
      }
    },
  });

  pi.registerCommand("brain:run-tasks", {
    description: "Process all pending background tasks (usage: /brain:run-tasks [--detach])",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd);
      if (!home) {
        ctx.ui.notify("No pi-brain home found.", "error");
        return;
      }
      const detach = args.trim() === "--detach";
      if (detach) {
        const result = await runTasksDetached(home, ctx.cwd);
        ctx.ui.notify(result.message, result.started ? "info" : "warning");
        return;
      }
      ctx.ui.notify("Running background tasks...", "info");
      const result = await runTasks(home, ctx.cwd);
      ctx.ui.notify(`Background tasks done: ${result.completed} completed, ${result.failed} failed.`, "info");
    },
  });

  pi.registerCommand("brain:tasks", {
    description: "List background tasks",
    handler: async (_args, ctx) => {
      const home = await requireBrain(ctx.cwd);
      if (!home) {
        ctx.ui.notify("No pi-brain home found.", "error");
        return;
      }
      const tasks = await listTasks(home);
      const lines = [
        `Pending: ${tasks.pending.length}`,
        `Running: ${tasks.running.length}`,
        `Completed: ${tasks.completed.length}`,
        `Failed: ${tasks.failed.length}`,
        "",
      ];
      for (const task of tasks.pending.slice(0, 5)) {
        lines.push(`• [pending] ${task.description}`);
      }
      for (const task of tasks.failed.slice(0, 5)) {
        lines.push(`• [failed] ${task.description}: ${task.error ?? ""}`.slice(0, 200));
      }
      ctx.ui.notify(lines.join("\n"), "info");
    },
  });
}
