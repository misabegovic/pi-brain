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
import { stat, mkdir, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
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

function getCheckArgs(config: EnolaConfig): string[] {
  return config.checkArgs ?? ["check"];
}

function getBaselineArgs(config: EnolaConfig): string[] {
  return config.baselineArgs ?? ["baseline", "pin"];
}

function getQueryArgs(config: EnolaConfig): string[] {
  return config.queryArgs ?? ["check"];
}

function getImpactArgs(config: EnolaConfig): string[] {
  return config.impactArgs ?? ["check"];
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
  const result = await runEnola(binary, getCheckArgs(config), target);

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
  const result = await runEnola(binary, getBaselineArgs(config), target);
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
  // enola does not have a stable query CLI yet; run the configured query command and grep for the symbol/module.
  const result = await runEnola(binary, getQueryArgs(config), target);
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

export async function runEnolaImpact(home: BrainHome, symbol: string): Promise<EnolaResult> {
  const config = await readEnolaConfig(home);
  if (!config.enabled) {
    return { ok: true, exitCode: 0, stdout: "", stderr: "enola is not enabled in brain.config.yml." };
  }

  const target = await resolveTargetRepo(home, config);
  if (!target) {
    return { ok: false, exitCode: 1, stdout: "", stderr: `enola target_repo not found: ${config.targetRepo}` };
  }

  const binary = findEnolaBinary(config);
  const result = await runEnola(binary, getImpactArgs(config), target);
  const text = result.stdout + result.stderr;
  const lines = text.split("\n");
  const queryLower = symbol.toLowerCase();

  // Collect lines mentioning the symbol and a few lines of surrounding context.
  const matchedIndices = new Set<number>();
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes(queryLower)) {
      for (let j = Math.max(0, i - 2); j <= Math.min(lines.length - 1, i + 2); j++) {
        matchedIndices.add(j);
      }
    }
  }

  const impactLines: string[] = [];
  let previous = -2;
  for (const idx of Array.from(matchedIndices).sort((a, b) => a - b)) {
    if (idx > previous + 1) impactLines.push("...");
    impactLines.push(lines[idx]);
    previous = idx;
  }

  return {
    ok: true,
    exitCode: 0,
    stdout: impactLines.join("\n") || "No impact data found in current output.",
    stderr: "",
    summary: `Impact analysis for "${symbol}" from enola output.`,
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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 48)
    .replace(/(^-|-$)/g, "") || "enola";
}

export async function captureEnolaRegressions(home: BrainHome): Promise<{ captured: boolean; path?: string; message: string }> {
  const config = await readEnolaConfig(home);
  if (!config.enabled) {
    return { captured: false, message: "enola is not enabled; skipping capture." };
  }

  const result = await runEnolaCheck(home);
  if (result.ok) {
    return { captured: false, message: "No structural regressions to capture." };
  }

  const date = new Date().toISOString().slice(0, 10);
  const id = slugify(`enola-regression-${date}`);
  const dir = join(home.path, "wiki", "brain", "ai-suggestions", "enola");
  await mkdir(dir, { recursive: true });
  const filePath = join(dir, `${id}.md`);

  const body = [
    "---",
    "kind: ai-suggestion",
    "status: draft",
    "confidence: medium",
    `source: enola check (${date})`,
    "---",
    "",
    `# Structural regression detected by enola (${date})`,
    "",
    "## Output",
    "",
    "```",
    result.stdout || result.stderr || "(no output)",
    "```",
    "",
    "## Suggested action",
    "",
    "Review the introduced coupling, dependency cycle, or module-boundary violation and decide whether to fix it in code or update intent.",
    "",
  ].join("\n");

  await writeFile(filePath, body, "utf-8");
  const relativePath = filePath.slice(home.path.length + 1);
  return { captured: true, path: relativePath, message: `Captured enola regression to ${relativePath}` };
}

export function registerEnolaCommands(pi: ExtensionAPI) {
  pi.registerCommand("brain:enola-capture", {
    description: "Run enola check and capture regressions as an ai-suggestion (usage: /brain:enola-capture)",
    handler: async (_args, ctx) => {
      const home = await requireBrain(ctx.cwd);
      if (!home) {
        ctx.ui.notify("No pi-brain home found.", "error");
        return;
      }
      const result = await captureEnolaRegressions(home);
      ctx.ui.notify(result.message, result.captured ? "info" : "warning");
    },
  });

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

  pi.registerCommand("brain:enola-impact", {
    description: "Show impact radius for a symbol or module (usage: /brain:enola-impact <symbol>)",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd);
      if (!home) {
        ctx.ui.notify("No pi-brain home found.", "error");
        return;
      }
      const symbol = args.trim();
      if (!symbol) {
        ctx.ui.notify("Usage: /brain:enola-impact <symbol>", "warning");
        return;
      }
      const result = await runEnolaImpact(home, symbol);
      ctx.ui.notify(formatEnolaResult(result), "info");
    },
  });
}
