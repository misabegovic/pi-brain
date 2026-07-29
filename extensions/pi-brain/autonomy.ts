import type { BrainHome, TrustLevel } from "./types.ts";
import { readAutonomyTrust } from "./brain-home.ts";

export type OperationClass = "sync" | "groom" | "refine" | "suggest" | "shelves" | "commits" | "code";

export interface AutonomyOperation {
  class: OperationClass;
  description: string;
  timestamp: number;
}

const sessionSummaries = new Map<string, AutonomyOperation[]>();

export async function getTrustLevel(
  home: BrainHome,
  op: OperationClass,
): Promise<TrustLevel> {
  const config = await readAutonomyTrust(home);
  return config[op];
}

export function recordOperation(sessionFile: string, op: AutonomyOperation): void {
  const list = sessionSummaries.get(sessionFile) ?? [];
  list.push(op);
  sessionSummaries.set(sessionFile, list);
}

export function getSessionSummary(sessionFile: string): AutonomyOperation[] {
  return sessionSummaries.get(sessionFile) ?? [];
}

export function clearSessionSummary(sessionFile: string): void {
  sessionSummaries.delete(sessionFile);
}

export function formatSummary(ops: AutonomyOperation[]): string {
  if (ops.length === 0) return "No autonomous operations this session.";
  const lines = ["Autonomous session summary:"];
  for (const op of ops) {
    lines.push(`- ${op.description}`);
  }
  return lines.join("\n");
}

export function shouldProceed(level: TrustLevel): boolean {
  return level !== "blocked" && level !== "ask";
}

export function shouldNotify(level: TrustLevel): boolean {
  return level === "notify";
}
