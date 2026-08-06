/**
 * Intent-first contract: before code moves in a sibling repo, the
 * governing specs move — or are confirmed already aligned.
 *
 * Entering a piece of work: the first write/edit into each sibling
 * repo is blocked once, with the target's governing pages (enola
 * govern) injected into the block reason; the retry proceeds. The
 * gate re-arms on every user message.
 *
 * Leaving a piece of work: pi has no stop-block, so the accounting
 * arrives at the start of the next turn instead — when sibling code
 * moved and no wiki page did, the next `before_agent_start` carries
 * an intent-debt message the agent must address first.
 *
 * The gates force the reading and the accounting, never the verdict;
 * an absent graph degrades to a named skip.
 */

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import type { BrainHome } from "./types.ts";
import { extractSimpleYamlValue } from "./yaml.ts";
import { runEnolaGovern } from "./enola.ts";

export interface IntentFirstConfig {
  enabled: boolean;
}

export interface IntentTargetCode {
  kind: "code";
  repoRoot: string;
  repoName: string;
  relPath: string;
}

export interface IntentTargetSpec {
  kind: "spec";
  relPath: string;
}

export type IntentTarget = IntentTargetCode | IntentTargetSpec | null;

interface SessionIntentState {
  acked: Set<string>;
  codeMoves: Map<string, Set<string>>;
  specMoved: boolean;
}

const sessions = new Map<string, SessionIntentState>();

function stateFor(key: string): SessionIntentState {
  let state = sessions.get(key);
  if (!state) {
    state = { acked: new Set(), codeMoves: new Map(), specMoved: false };
    sessions.set(key, state);
  }
  return state;
}

export function sessionKey(ctx: { sessionManager?: { getSessionFile?: () => string | undefined } }): string {
  return ctx.sessionManager?.getSessionFile?.() ?? "default";
}

export function projectsRoot(): string {
  return resolve(process.env.BRAIN_PROJECTS_ROOT ?? join(homedir(), "projects"));
}

export async function readIntentFirstConfig(home: BrainHome): Promise<IntentFirstConfig> {
  try {
    const config = await readFile(join(home.path, "brain.config.yml"), "utf-8");
    const value = extractSimpleYamlValue(config, "intent_first");
    return { enabled: value !== "false" };
  } catch {
    return { enabled: true };
  }
}

export function classifyIntentTarget(home: BrainHome, root: string, targetPath: string): IntentTarget {
  if (!targetPath) return null;
  const target = resolve(targetPath);

  const homeRel = relative(home.path, target);
  if (!homeRel.startsWith("..")) {
    if (
      homeRel.startsWith("wiki/") &&
      homeRel.endsWith(".md") &&
      !homeRel.startsWith("wiki/_views/") &&
      !homeRel.startsWith("wiki/_archive/") &&
      !homeRel.startsWith("wiki/_state/")
    ) {
      return { kind: "spec", relPath: homeRel };
    }
    return null;
  }

  if (relative(root, target).startsWith("..")) return null;

  let probe = dirname(target);
  while (!existsSync(probe) && probe !== "/") {
    probe = dirname(probe);
  }
  let repoRoot: string | null = null;
  let cursor = probe;
  while (!relative(root, cursor).startsWith("..") && cursor !== "/") {
    if (existsSync(join(cursor, ".git"))) {
      repoRoot = cursor;
      break;
    }
    cursor = dirname(cursor);
  }
  if (!repoRoot) return null;

  return {
    kind: "code",
    repoRoot,
    repoName: repoRoot.split("/").pop() ?? repoRoot,
    relPath: relative(repoRoot, target),
  };
}

export function gateFirstTouch(key: string, repoName: string): boolean {
  const state = stateFor(key);
  if (state.acked.has(repoName)) return false;
  state.acked.add(repoName);
  return true;
}

export function recordIntentTarget(key: string, target: IntentTarget): void {
  if (!target) return;
  const state = stateFor(key);
  if (target.kind === "spec") {
    state.specMoved = true;
    return;
  }
  let moves = state.codeMoves.get(target.repoName);
  if (!moves) {
    moves = new Set();
    state.codeMoves.set(target.repoName, moves);
  }
  moves.add(target.relPath);
}

export function takeIntentDebt(key: string): string | null {
  const state = sessions.get(key);
  sessions.delete(key);
  if (!state) return null;
  if (state.codeMoves.size === 0 || state.specMoved) return null;

  const lines: string[] = [];
  for (const [repo, files] of state.codeMoves) {
    for (const file of [...files].slice(0, 15)) {
      lines.push(`  ${file} (${repo})`);
    }
  }
  return [
    "intent debt from the previous piece of work: sibling code moved and no governing page did.",
    "",
    "Changed without a spec moving:",
    ...lines,
    "",
    "Before continuing: amend the governing PRD/ADR/build-notes to match what was built, or state explicitly why the change is already covered by the specs as written.",
  ].join("\n");
}

export async function intentFirstGateReason(home: BrainHome, target: IntentTargetCode): Promise<string> {
  const govern = await runEnolaGovern(home, target.relPath);
  const trail =
    (govern.stdout || govern.stderr || "").trim() ||
    "(enola govern unavailable — named skip; consult the wiki shelves manually)";

  return [
    `intent-first gate (${target.repoName}): first edit for this piece of work.`,
    "",
    "The contract is intent first. Before this code moves: read the governing specs below and check the intended change against them. If the work deviates from what the PRD/ADR/build-notes record, amend the page first; if nothing governs this work, surface that and ask whether it should be shaped.",
    "",
    `Governing intent for ${target.relPath}:`,
    trail,
    "",
    "Retrying the edit proceeds. This gate re-arms on every user message; within one piece of work it will not fire again.",
  ].join("\n");
}
