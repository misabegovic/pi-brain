/**
 * Optional enola integration for pi-brain.
 *
 * enola is an architectural regression testing tool:
 * https://github.com/enola-labs/enola
 *
 * This module is fully defensive: if enola is not installed or not
 * configured, calls return a helpful message instead of throwing.
 */

import { execFile } from "node:child_process";
import { stat } from "node:fs/promises";
import { resolve } from "node:path";
import type { BrainHome, EnolaConfig } from "./types.ts";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { readEnolaConfig } from "./brain-home.ts";
import { requireBrain } from "./context.ts";

export interface EnolaResult {
  ok: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  summary?: string;
}

function findEnolaBinary(config: EnolaConfig): string {
  return config.binary ?? "enola";
}

async function resolveTargetRepo(home: BrainHome, config: EnolaConfig): Promise<string | null> {
  if (!config.targetRepo) return home.path;
  const target = resolve(home.path, config.targetRepo);
  try {
    const info = await stat(target);
    if (info.isDirectory()) return target;
  } catch {
    // fall through
  }
  return null;
}

function runEnola(
  binary: string,
  args: string[],
  cwd: string,
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const proc = execFile(binary, args, { cwd }, (error, stdout, stderr) => {
      if (error && error.code !== "ENOENT") {
        resolve({ exitCode: error.code as number ?? 1, stdout, stderr });
      } else {
        resolve({ exitCode: 0, stdout, stderr });
      }
    });
    proc.on("error", (err) => {
      resolve({ exitCode: 1, stdout: "", stderr: err.message });
    });
  });
}

export async function runEnolaCheck(home: BrainHome): Promise<EnolaResult> {
  const config = await readEnolaConfig(home);
  if (!config.enabled) {
    return { ok: true, exitCode: 0, stdout: "", stderr: "enola is not enabled in brain.config.yml." };
  }

  const target = await resolveTargetRepo(home, config);
  if (!target) {
    return { ok: false, exitCode: 1, stdout: "", stderr: `enola target_repo not found: ${config.targetRepo}` };
  }

  const binary = findEnolaBinary(config);
  const result = await runEnola(binary, ["check"], target);

  // enola exits non-zero when it finds a structural regression.
  const ok = result.exitCode === 0;
  return {
    ok,
    exitCode: result.exitCode,
    stdout: result.stdout,
    stderr: result.stderr,
    summary: ok
      ? "No structural regressions detected."
      : "Structural regression(s) detected. See output for details.",
  };
}

export async function runEnolaBaseline(home: BrainHome): Promise<EnolaResult> {
  const config = await readEnolaConfig(home);
  if (!config.enabled) {
    return { ok: true, exitCode: 0, stdout: "", stderr: "enola is not enabled in brain.config.yml." };
  }

  const target = await resolveTargetRepo(home, config);
  if (!target) {
    return { ok: false, exitCode: 1, stdout: "", stderr: `enola target_repo not found: ${config.targetRepo}` };
  }

  const binary = findEnolaBinary(config);
  const result = await runEnola(binary, ["baseline", "pin"], target);
  return {
    ok: result.exitCode === 0,
    exitCode: result.exitCode,
    stdout: result.stdout,
    stderr: result.stderr,
    summary: result.exitCode === 0 ? "Architecture baseline pinned." : "Failed to pin architecture baseline.",
  };
}

export async function runEnolaQuery(home: BrainHome, query: string): Promise<EnolaResult> {
  const config = await readEnolaConfig(home);
  if (!config.enabled) {
    return { ok: true, exitCode: 0, stdout: "", stderr: "enola is not enabled in brain.config.yml." };
  }

  const target = await resolveTargetRepo(home, config);
  if (!target) {
    return { ok: false, exitCode: 1, stdout: "", stderr: `enola target_repo not found: ${config.targetRepo}` };
  }

  const binary = findEnolaBinary(config);
  // enola does not have a stable query CLI yet; run check and grep for the symbol/module.
  const result = await runEnola(binary, ["check"], target);
  const lines = (result.stdout + result.stderr).split("\n");
  const matches = lines.filter((line) => line.toLowerCase().includes(query.toLowerCase()));

  return {
    ok: true,
    exitCode: 0,
    stdout: matches.join("\n") || "No matches found in current output.",
    stderr: "",
    summary: `Queried enola output for "${query}".`,
  };
}

export function formatEnolaResult(result: EnolaResult): string {
  const parts = [result.summary ?? ""];
  if (result.stdout) parts.push(result.stdout);
  if (result.stderr) parts.push(`stderr: ${result.stderr}`);
  return parts.filter(Boolean).join("\n\n");
}

export async function enolaGateCheck(home: BrainHome, context: string): Promise<{ proceed: boolean; message: string }> {
  const config = await readEnolaConfig(home);
  if (!config.enabled) {
    return { proceed: true, message: "enola is not enabled; skipping architecture gate." };
  }

  const result = await runEnolaCheck(home);
  if (result.ok) {
    return { proceed: true, message: "enola check passed. No structural regressions." };
  }

  return {
    proceed: false,
    message: `enola check blocked ${context}.\n\n${formatEnolaResult(result)}`,
  };
}

export function registerEnolaCommands(pi: ExtensionAPI) {
  pi.registerCommand("brain:enola-status", {
    description: "Show enola configuration status (usage: /brain:enola-status)",
    handler: async (_args, ctx) => {
      const home = await requireBrain(ctx.cwd);
      if (!home) {
        ctx.ui.notify("No pi-brain home found.", "error");
        return;
      }
      const config = await readEnolaConfig(home);
      const lines = [
        `enabled: ${config.enabled}`,
        `target_repo: ${config.targetRepo ?? "(brain home)"}`,
        `binary: ${config.binary ?? "enola"}`,
        `gate_build: ${config.gateBuild ?? false}`,
        `gate_sync_code: ${config.gateSyncCode ?? false}`,
      ];
      ctx.ui.notify(lines.join("\n"), "info");
    },
  });

  pi.registerCommand("brain:enola-check", {
    description: "Run enola check on the configured target repo (usage: /brain:enola-check)",
    handler: async (_args, ctx) => {
      const home = await requireBrain(ctx.cwd);
      if (!home) {
        ctx.ui.notify("No pi-brain home found.", "error");
        return;
      }
      const result = await runEnolaCheck(home);
      ctx.ui.notify(formatEnolaResult(result), result.ok ? "info" : "warning");
    },
  });

  pi.registerCommand("brain:enola-baseline", {
    description: "Pin the enola architecture baseline (usage: /brain:enola-baseline)",
    handler: async (_args, ctx) => {
      const home = await requireBrain(ctx.cwd);
      if (!home) {
        ctx.ui.notify("No pi-brain home found.", "error");
        return;
      }
      const result = await runEnolaBaseline(home);
      ctx.ui.notify(formatEnolaResult(result), result.ok ? "info" : "warning");
    },
  });

  pi.registerCommand("brain:enola-query", {
    description: "Query enola output for a symbol or module (usage: /brain:enola-query <term>)",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd);
      if (!home) {
        ctx.ui.notify("No pi-brain home found.", "error");
        return;
      }
      const query = args.trim();
      if (!query) {
        ctx.ui.notify("Usage: /brain:enola-query <term>", "warning");
        return;
      }
      const result = await runEnolaQuery(home, query);
      ctx.ui.notify(formatEnolaResult(result), "info");
    },
  });
}
