/**
 * Optional enola integration for pi-brain.
 *
 * enola is an architectural regression testing tool:
 * https://github.com/enola-labs/enola
 *
 * This module is fully defensive: if enola is not installed or not
 * configured, calls return a helpful message instead of throwing.
 */

import { spawn } from "node:child_process";
import { stat, mkdir, writeFile, readFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import type { BrainHome, EnolaConfig } from "./types.ts";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { readEnolaConfig } from "./brain-home.ts";
import { requireBrain } from "./context.ts";
import { getMarkdownFiles } from "./utils.ts";

export interface EnolaResult {
  ok: boolean;
  /** exit 3: the baseline was not comparable — a non-verdict, not a regression. */
  declined?: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  summary?: string;
}

function findEnolaBinary(config: EnolaConfig): string {
  return process.env.ENOLA_BINARY ?? config.binary ?? "enola";
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
    const proc = spawn(binary, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (data: Buffer) => {
      stdout += data.toString("utf-8");
    });
    proc.stderr.on("data", (data: Buffer) => {
      stderr += data.toString("utf-8");
    });
    proc.on("error", (err) => {
      resolve({ exitCode: 1, stdout: "", stderr: err.message });
    });
    proc.on("close", (exitCode) => {
      resolve({ exitCode: exitCode ?? 0, stdout, stderr });
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

  // enola exits 1 on a structural regression and 3 when the baseline and the
  // current snapshot are not comparable. Exit 3 is a non-verdict: the delta
  // describes how the two snapshots were built, not what was edited, so it is
  // treated as "not asked" — never as a pass and never as a regression. The
  // remedy it names is re-pinning the baseline.
  const declined = result.exitCode === 3;
  const ok = result.exitCode === 0;
  return {
    declined,
    ok,
    exitCode: result.exitCode,
    stdout: result.stdout,
    stderr: result.stderr,
    summary: ok
      ? "No structural regressions detected."
      : declined
        ? "Declined — the baseline is not comparable to the current snapshot. Treat as not asked, never as a pass; re-pin the baseline and re-run."
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

  if (result.declined) {
    // A non-verdict never blocks: nothing was graded, so there is nothing to
    // enforce. Saying so by name keeps "the graph agreed" and "the graph was
    // not asked" distinguishable, which is the point of the exit code.
    return {
      proceed: true,
      message: `enola check declined for ${context}: the baseline is not comparable to the current snapshot. No verdict was reached — re-pin the baseline (/brain:enola-baseline) and re-run.`,
    };
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

// ---------------------------------------------------------------------------
// Receipt-based architecture state (inspired by projects/tt/brain)
// ---------------------------------------------------------------------------

export interface EnolaReceipt {
  snapshot_id: string;
  enola_version: string;
  generated_at: string;
  repo_path: string;
  git?: { ref?: string; commit?: string; dirty?: boolean };
  fact_count?: number;
  insight_count?: number;
  output_hashes?: Record<string, string>;
  content_digest?: string;
}

export interface EnolaReceipts {
  [repoName: string]: EnolaReceipt;
}

function getEnolaStateDir(home: BrainHome): string {
  return join(home.path, "wiki", "_state", "enola");
}

function getEnolaReceiptsPath(home: BrainHome): string {
  return join(getEnolaStateDir(home), "receipts.json");
}

function getEnolaOutputDir(home: BrainHome): string {
  return join(home.path, ".enola");
}

// enola writes artifacts into the cwd it ran in — the target repo when
// one is configured, the brain home otherwise. Every reader resolves
// through here instead of assuming the home, which silently missed the
// artifacts whenever target_repo was set.
async function resolveArtifactDir(home: BrainHome, config: EnolaConfig): Promise<string> {
  const target = await resolveTargetRepo(home, config);
  return join(target ?? home.path, ".enola");
}

function repoNameFromPath(repoPath: string): string {
  return repoPath.replace(/\\/g, "/").split("/").filter(Boolean).pop() ?? "unknown";
}

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      out[key] = sortKeysDeep((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  return value;
}

async function computeFactsDigest(factsPath: string): Promise<string | undefined> {
  try {
    const text = await readFile(factsPath, "utf-8");
    const canonical = text
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => {
        try {
          return JSON.stringify(sortKeysDeep(JSON.parse(l)));
        } catch {
          return l;
        }
      })
      .sort();
    const crypto = await import("node:crypto");
    return "sha256:" + crypto.createHash("sha256").update(canonical.join("\n")).digest("hex");
  } catch {
    return undefined;
  }
}

export async function runEnolaGenerate(home: BrainHome): Promise<EnolaResult> {
  const config = await readEnolaConfig(home);
  if (!config.enabled) {
    return { ok: true, exitCode: 0, stdout: "", stderr: "enola is not enabled in brain.config.yml." };
  }

  const target = await resolveTargetRepo(home, config);
  if (!target) {
    return { ok: false, exitCode: 1, stdout: "", stderr: `enola target_repo not found: ${config.targetRepo}` };
  }

  const binary = findEnolaBinary(config);
  // Use baseline args for generation (typically "--generate" or "baseline pin").
  const args = config.baselineArgs ?? ["--generate"];
  const result = await runEnola(binary, args, target);

  if (result.exitCode !== 0) {
    return { ok: false, exitCode: result.exitCode, stdout: result.stdout, stderr: result.stderr };
  }

  const artifactDir = await resolveArtifactDir(home, config);
  const receiptPath = join(artifactDir, "receipt.json");
  let receipt: EnolaReceipt | null = null;
  try {
    receipt = JSON.parse(await readFile(receiptPath, "utf-8")) as EnolaReceipt;
  } catch {
    return { ok: false, exitCode: 1, stdout: "", stderr: `enola ran but no receipt found at ${receiptPath}` };
  }

  const factsPath = join(artifactDir, "facts.jsonl");
  const digest = await computeFactsDigest(factsPath);
  if (digest) receipt.content_digest = digest;

  const name = repoNameFromPath(receipt.repo_path);
  const receipts: EnolaReceipts = {};
  try {
    Object.assign(receipts, JSON.parse(await readFile(getEnolaReceiptsPath(home), "utf-8")));
  } catch {
    // no existing receipts
  }
  receipts[name] = receipt;

  await mkdir(getEnolaStateDir(home), { recursive: true });
  await writeFile(getEnolaReceiptsPath(home), JSON.stringify(receipts, null, 2) + "\n", "utf-8");

  return {
    ok: true,
    exitCode: 0,
    stdout: `Recorded enola receipt for ${name}: ${receipt.fact_count ?? 0} facts @ ${(receipt.git?.commit ?? "").slice(0, 8)}`,
    stderr: "",
    summary: `Architecture baseline recorded for ${name}.`,
  };
}

export async function readEnolaReceipts(home: BrainHome): Promise<EnolaReceipts> {
  try {
    return JSON.parse(await readFile(getEnolaReceiptsPath(home), "utf-8")) as EnolaReceipts;
  } catch {
    return {};
  }
}

export async function runEnolaDiff(home: BrainHome): Promise<EnolaResult> {
  const config = await readEnolaConfig(home);
  const binary = findEnolaBinary(config);
  const target = await resolveTargetRepo(home, config);
  const receipts = await readEnolaReceipts(home);
  if (!config.enabled || !target || Object.keys(receipts).length === 0) {
    // Gracefully skip when enola is not fully configured or no baseline exists.
    return {
      ok: true,
      exitCode: 0,
      stdout: "",
      stderr: "enola diff skipped: not enabled, missing target repo, or no recorded receipts. Run /brain:enola-generate first.",
    };
  }

  const args = config.baselineArgs ?? ["--generate"];
  const result = await runEnola(binary, args, target);
  if (result.exitCode !== 0) {
    return { ok: false, exitCode: result.exitCode, stdout: result.stdout, stderr: result.stderr };
  }

  const artifactDir = await resolveArtifactDir(home, config);
  const liveReceipt: EnolaReceipt | null = JSON.parse(
    await readFile(join(artifactDir, "receipt.json"), "utf-8").catch(() => "null"),
  );
  if (!liveReceipt) {
    return { ok: false, exitCode: 1, stdout: "", stderr: "enola ran but produced no receipt." };
  }

  const factsPath = join(artifactDir, "facts.jsonl");
  const liveDigest = await computeFactsDigest(factsPath);
  if (liveDigest) liveReceipt.content_digest = liveDigest;

  const name = repoNameFromPath(liveReceipt.repo_path);
  const recorded = await readEnolaReceipts(home);
  const prior = recorded[name];
  if (!prior) {
    return {
      ok: true,
      exitCode: 0,
      stdout: `No prior receipt for ${name}. Current: ${liveReceipt.fact_count ?? 0} facts.`,
      stderr: "",
      summary: `New architecture snapshot for ${name}.`,
    };
  }

  const changed = liveReceipt.content_digest && prior.content_digest
    ? liveReceipt.content_digest !== prior.content_digest
    : liveReceipt.snapshot_id !== prior.snapshot_id;

  if (!changed) {
    return {
      ok: true,
      exitCode: 0,
      stdout: `Architecture snapshot for ${name} is unchanged.`,
      stderr: "",
      summary: `No architecture drift for ${name}.`,
    };
  }

  const delta = (liveReceipt.fact_count ?? 0) - (prior.fact_count ?? 0);
  return {
    ok: true,
    exitCode: 0,
    stdout: `Architecture drift detected for ${name}.\nFacts: ${prior.fact_count ?? 0} → ${liveReceipt.fact_count ?? 0} (${delta >= 0 ? "+" : ""}${delta})\nCommit: ${(prior.git?.commit ?? "").slice(0, 8)} → ${(liveReceipt.git?.commit ?? "").slice(0, 8)}`,
    stderr: "",
    summary: `Architecture drift detected for ${name}.`,
  };
}

const ENOLA_CITATION_RX = /enola receipt ([\w.-]+) `sha256:([0-9a-f]{12,})…?` @ `([0-9a-f]{7,40})`, (\d{4}-\d{2}-\d{2})/g;

export interface EnolaCitation {
  repo: string;
  digest: string;
  commit: string;
  date: string;
  source: string;
  verdict: "ok" | "stale" | "malformed" | "unknown-repo";
}

interface GoverningRelation {
  rel: string;
  to: string;
  toType?: string;
  toStatus?: string;
}

interface GoverningPage {
  page: string;
  type?: string;
  status?: string;
  relations: GoverningRelation[];
}

function stripRepoLabel(file: string, repo: string): string {
  return repo && file.startsWith(repo + "/") ? file.slice(repo.length + 1) : file;
}

async function findFactsFile(home: BrainHome, config: EnolaConfig): Promise<string | null> {
  const candidates: string[] = [
    join(await resolveArtifactDir(home, config), "facts.jsonl"),
    join(getEnolaOutputDir(home), "facts.jsonl"),
  ];
  for (const candidate of candidates) {
    try {
      const info = await stat(candidate);
      if (info.isFile()) return candidate;
    } catch {
      // keep looking
    }
  }
  return null;
}

interface GovernIndex {
  anchors: Array<{ owner: string; path: string; source: string }>;
  pages: Map<string, { type?: string; status?: string; repo: string }>;
  relations: Map<string, Array<{ rel: string; to: string }>>;
  measured: Array<{ repo: string; file: string; name: string }>;
}

function parseGovernIndex(text: string): GovernIndex {
  const index: GovernIndex = { anchors: [], pages: new Map(), relations: new Map(), measured: [] };
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    let fact: any;
    try {
      fact = JSON.parse(line);
    } catch {
      continue;
    }
    const props = fact.props ?? {};
    if (fact.kind === "intent") {
      const intentKind = props.intent_kind;
      if (intentKind === "anchor") {
        index.anchors.push({ owner: props.intent_owner ?? "", path: props.path ?? "", source: fact.file ?? "" });
      } else if (intentKind === "page") {
        index.pages.set(fact.file ?? "", { type: props.page_type, status: props.status, repo: fact.repo ?? "" });
      } else if (intentKind === "relation") {
        const key = (fact.repo ?? "") + "\u0000" + (fact.file ?? "");
        const list = index.relations.get(key) ?? [];
        list.push({ rel: props.rel ?? "", to: props.to ?? "" });
        index.relations.set(key, list);
      }
    } else if (fact.repo && fact.file) {
      index.measured.push({ repo: fact.repo, file: fact.file, name: fact.name ?? "" });
    }
  }
  return index;
}

function pageMeta(type?: string, status?: string): string {
  const suffix = [type, status].filter(Boolean).join(", ");
  return suffix ? ` (${suffix})` : "";
}

function anchorCovers(path: string, forms: string[]): boolean {
  return forms.some((f) => f === path || f.startsWith(path + "/"));
}

function renderPageCoverage(page: string, index: GovernIndex): string {
  const meta = index.pages.get(page)!;
  const lines = [`${page}${pageMeta(meta.type, meta.status)}`];
  const own = index.anchors.filter((a) => a.source === page);
  if (own.length === 0) {
    lines.push("    no anchors — the page governs no code directly");
  }
  for (const a of own) {
    const files = new Set<string>();
    for (const m of index.measured) {
      if (m.repo === a.owner && anchorCovers(a.path, [m.file, stripRepoLabel(m.file, m.repo)])) {
        files.add(m.file);
      }
    }
    lines.push(`    anchors ${a.owner} ${a.path} — ${files.size} measured file(s)`);
  }
  return lines.join("\n");
}

function renderGoverning(located: { repo: string; file: string }, index: GovernIndex): string {
  const pageByForm = new Map<string, string>();
  for (const [file, meta] of index.pages) {
    pageByForm.set(meta.repo + "\u0000" + file, file);
    pageByForm.set(meta.repo + "\u0000" + stripRepoLabel(file, meta.repo), file);
  }
  const forms = [located.file, stripRepoLabel(located.file, located.repo)];
  const governing: GoverningPage[] = [];
  const seen = new Set<string>();
  for (const a of index.anchors) {
    if (a.owner !== located.repo || seen.has(a.source) || !anchorCovers(a.path, forms)) continue;
    seen.add(a.source);
    const meta = index.pages.get(a.source);
    const rels: GoverningRelation[] = [];
    if (meta) {
      for (const r of index.relations.get(meta.repo + "\u0000" + a.source) ?? []) {
        const targetFile = pageByForm.get(meta.repo + "\u0000" + r.to);
        const targetMeta = targetFile ? index.pages.get(targetFile) : undefined;
        rels.push({ rel: r.rel, to: r.to, toType: targetMeta?.type, toStatus: targetMeta?.status });
      }
      rels.sort((x, y) => x.rel.localeCompare(y.rel) || x.to.localeCompare(y.to));
    }
    governing.push({ page: a.source, type: meta?.type, status: meta?.status, relations: rels });
  }
  governing.sort((x, y) => x.page.localeCompare(y.page));

  const lines = [`${located.file} (${located.repo})`];
  if (governing.length === 0) {
    lines.push("    no governing page — asked, none governs");
  }
  for (const g of governing) {
    lines.push(`    governed by ${g.page}${pageMeta(g.type, g.status)}`);
    for (const r of g.relations) {
      lines.push(`        ${r.rel} ${r.to}${pageMeta(r.toType, r.toStatus)}`);
    }
  }
  return lines.join("\n");
}

/**
 * The reverse query between knowledge and code, answered from the on-disk
 * facts. A code target (exact fact name or file path in either the
 * label-prefixed or repo-relative form) lists the compiled pages whose
 * anchors cover its file, each with its type, status, and relation trail.
 * A compiled page path lists the page's anchors with measured coverage.
 * The empty states keep the counterparty rule: a snapshot with no compiled
 * pages answers "not asked", which is never the same as "asked, none
 * governs".
 */
export async function runEnolaPlan(home: BrainHome, paths: string[]): Promise<EnolaResult> {
  const config = await readEnolaConfig(home);
  if (!config.enabled) {
    return { ok: true, exitCode: 0, stdout: "", stderr: "enola is not enabled in brain.config.yml." };
  }
  const target = await resolveTargetRepo(home, config);
  if (!target) {
    return { ok: false, exitCode: 1, stdout: "", stderr: `enola target_repo not found: ${config.targetRepo}` };
  }
  const binary = findEnolaBinary(config);
  const result = await runEnola(binary, ["plan", ...paths, target], target);
  // plan exits 0 when the report was produced; its verdicts are for the
  // caller to weigh, never a gate — the same contract check carries.
  return {
    ok: result.exitCode === 0,
    exitCode: result.exitCode,
    stdout: result.stdout,
    stderr: result.stderr,
    summary: result.exitCode === 0 ? "Pre-edit contract report produced." : "enola plan could not produce a report.",
  };
}

export async function runEnolaGovern(home: BrainHome, query: string): Promise<EnolaResult> {
  const config = await readEnolaConfig(home);
  if (!config.enabled) {
    return { ok: true, exitCode: 0, stdout: "", stderr: "enola is not enabled in brain.config.yml." };
  }
  const target = query.trim();
  if (!target) {
    return { ok: false, exitCode: 1, stdout: "", stderr: "govern needs a target: a file path, an exact fact name, or a compiled page path." };
  }
  const factsPath = await findFactsFile(home, config);
  if (!factsPath) {
    return { ok: true, exitCode: 0, stdout: "", stderr: "enola govern skipped: no snapshot artifacts found. Run /brain:enola-generate first." };
  }

  const index = parseGovernIndex(await readFile(factsPath, "utf-8"));
  if (index.pages.size === 0) {
    return {
      ok: true,
      exitCode: 0,
      stdout:
        "No knowledge pages are compiled into this snapshot — the reverse query was not asked. " +
        "Compiling pages requires an enola build carrying the intent standard (the mdintent extractor) " +
        "and stamped enola_intent blocks (node tools/brain-intent.mjs) with the brain home included in the snapshot.",
      stderr: "",
    };
  }

  const matchedPage = [...index.pages.keys()].find(
    (file) => file === target || stripRepoLabel(file, index.pages.get(file)!.repo) === target,
  );
  if (matchedPage) {
    return { ok: true, exitCode: 0, stdout: renderPageCoverage(matchedPage, index), stderr: "" };
  }

  const located = index.measured.find(
    (m) => m.name === target || m.file === target || stripRepoLabel(m.file, m.repo) === target,
  );
  if (!located) {
    return {
      ok: true,
      exitCode: 0,
      stdout: `Nothing measured matches ${JSON.stringify(target)} — not a compiled page, an exact fact name, or a measured file path.`,
      stderr: "",
    };
  }
  return { ok: true, exitCode: 0, stdout: renderGoverning(located, index), stderr: "" };
}

export async function runEnolaCitations(home: BrainHome): Promise<{ ok: boolean; citations: EnolaCitation[]; message: string }> {
  const receipts = await readEnolaReceipts(home);
  const citations: EnolaCitation[] = [];
  const files = await getMarkdownFiles(join(home.path, "wiki"));

  for (const file of files) {
    const text = await readFile(file, "utf-8");
    let match: RegExpExecArray | null;
    while ((match = ENOLA_CITATION_RX.exec(text)) !== null) {
      const [, repo, digest, commit, date] = match;
      const receipt = receipts[repo];
      let verdict: EnolaCitation["verdict"] = "unknown-repo";
      if (receipt) {
        const receiptDigest = receipt.content_digest ?? receipt.snapshot_id ?? "";
        const receiptCommit = receipt.git?.commit ?? "";
        if (receiptDigest.startsWith("sha256:") && receiptDigest.slice(7).startsWith(digest)) {
          verdict = receiptCommit.startsWith(commit) ? "ok" : "stale";
        } else if (receiptCommit.startsWith(commit)) {
          verdict = "stale";
        } else {
          verdict = "stale";
        }
      }
      citations.push({ repo, digest, commit, date, source: file.slice(home.path.length + 1), verdict });
    }
  }

  const counts = { ok: 0, stale: 0, malformed: 0, "unknown-repo": 0 };
  for (const c of citations) counts[c.verdict]++;
  const message = [
    `Found ${citations.length} enola citation(s) in wiki prose.`,
    `ok: ${counts.ok}, stale: ${counts.stale}, unknown-repo: ${counts["unknown-repo"]}, malformed: ${counts.malformed}`,
  ].join("\n");

  return { ok: true, citations, message };
}

interface EnolaVerdict {
  signature: string;
  verdict: "accepted" | "rejected" | "noise";
  why: string;
  recorded: string;
  cited_at?: string;
}

interface EnolaVerdictLedger {
  _note: string;
  entries: EnolaVerdict[];
}

const VERDICT_LEDGER_NOTE =
  "Judgment ledger for architecture-graph findings. WRITE-ON-JUDGMENT, NO PENDING STATE: " +
  "an entry exists only because someone judged that finding. Absence means unjudged, not queued. " +
  "Nothing may enumerate the unjudged set as work. " +
  "accepted = real, and cited where cited_at says. rejected = not real, re-judgeable when the code moves. " +
  "noise = the explainer is wrong about this class, permanent.";

function verdictLedgerPath(home: BrainHome): string {
  return join(home.path, "wiki", "_state", "enola-verdicts.json");
}

export async function readVerdictLedger(home: BrainHome): Promise<EnolaVerdictLedger> {
  try {
    return JSON.parse(await readFile(verdictLedgerPath(home), "utf-8")) as EnolaVerdictLedger;
  } catch {
    return { _note: VERDICT_LEDGER_NOTE, entries: [] };
  }
}

export async function judgeFinding(
  home: BrainHome,
  signature: string,
  verdict: "accepted" | "rejected" | "noise",
  why: string,
  citedAt?: string,
): Promise<string> {
  const ledger = await readVerdictLedger(home);
  const entry: EnolaVerdict = { signature, verdict, why, recorded: new Date().toISOString().slice(0, 10) };
  if (citedAt) entry.cited_at = citedAt;
  const existing = ledger.entries.findIndex((e) => e.signature === signature);
  const replaced = existing >= 0;
  if (replaced) ledger.entries[existing] = entry;
  else ledger.entries.push(entry);
  await mkdir(join(home.path, "wiki", "_state"), { recursive: true });
  await writeFile(verdictLedgerPath(home), JSON.stringify(ledger, null, 2) + "\n", "utf-8");
  return replaced ? `re-judged ${signature}: ${verdict}` : `judged ${signature}: ${verdict}`;
}

// Findings are candidates to verify, never verdicts. This reads the snapshot's
// insights and joins each against the judgment ledger, so a finding someone
// already judged surfaces with its verdict instead of being re-decided.
export async function listFindings(home: BrainHome): Promise<string> {
  const config = await readEnolaConfig(home);
  if (!config.enabled) return "enola is not enabled in brain.config.yml.";
  const target = await resolveTargetRepo(home, config);
  if (!target) return `enola target_repo not found: ${config.targetRepo}`;
  let insights: Array<{ title: string; source: string; confidence: number }>;
  try {
    insights = JSON.parse(await readFile(join(target, ".enola", "insights.json"), "utf-8"));
  } catch {
    return "no snapshot insights at .enola/insights.json — run /brain:enola-generate first (named skip, not an empty finding set).";
  }
  const ledger = await readVerdictLedger(home);
  const verdicts = new Map(ledger.entries.map((e) => [e.signature, e]));
  const lines: string[] = [`${insights.length} finding(s); ${ledger.entries.length} judged`];
  const bySource = new Map<string, typeof insights>();
  for (const i of insights) {
    const group = bySource.get(i.source) ?? [];
    group.push(i);
    bySource.set(i.source, group);
  }
  for (const [source, group] of [...bySource.entries()].sort()) {
    lines.push(`\n${source} (${group.length}):`);
    for (const i of group.slice(0, 10)) {
      const sig = `${i.source}:${i.title}`;
      const judged = verdicts.get(sig);
      const mark = judged ? ` [${judged.verdict}: ${judged.why}]` : "";
      lines.push(`  ${(i.confidence ?? 0).toFixed(2)}  ${i.title}${mark}`);
    }
    if (group.length > 10) lines.push(`  … ${group.length - 10} more`);
  }
  return lines.join("\n");
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

  pi.registerCommand("brain:enola-generate", {
    description: "Generate enola snapshot and record receipt (usage: /brain:enola-generate)",
    handler: async (_args, ctx) => {
      const home = await requireBrain(ctx.cwd);
      if (!home) {
        ctx.ui.notify("No pi-brain home found.", "error");
        return;
      }
      const result = await runEnolaGenerate(home);
      ctx.ui.notify(formatEnolaResult(result), result.ok ? "info" : "warning");
    },
  });

  pi.registerCommand("brain:enola-diff", {
    description: "Compare current enola snapshot to recorded receipts (usage: /brain:enola-diff)",
    handler: async (_args, ctx) => {
      const home = await requireBrain(ctx.cwd);
      if (!home) {
        ctx.ui.notify("No pi-brain home found.", "error");
        return;
      }
      const result = await runEnolaDiff(home);
      ctx.ui.notify(formatEnolaResult(result), result.ok ? "info" : "warning");
    },
  });

  pi.registerCommand("brain:enola-citations", {
    description: "Check enola receipt citations in wiki prose (usage: /brain:enola-citations)",
    handler: async (_args, ctx) => {
      const home = await requireBrain(ctx.cwd);
      if (!home) {
        ctx.ui.notify("No pi-brain home found.", "error");
        return;
      }
      const result = await runEnolaCitations(home);
      ctx.ui.notify(result.message, result.ok ? "info" : "warning");
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

  pi.registerCommand("brain:enola-govern", {
    description: "Which compiled pages govern a file or symbol — and which code a page governs (usage: /brain:enola-govern <target>)",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd);
      if (!home) {
        ctx.ui.notify("No pi-brain home found.", "error");
        return;
      }
      const target = args.trim();
      if (!target) {
        ctx.ui.notify("Usage: /brain:enola-govern <file-or-symbol-or-page>", "warning");
        return;
      }
      const result = await runEnolaGovern(home, target);
      ctx.ui.notify(formatEnolaResult(result), "info");
    },
  });

  pi.registerCommand("brain:enola-plan", {
    description: "The pre-edit contract: declared constraints and blast radius for intended paths (usage: /brain:enola-plan <path> [path...])",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd);
      if (!home) {
        ctx.ui.notify("No pi-brain home found.", "error");
        return;
      }
      const paths = args.trim().split(/\s+/).filter(Boolean);
      if (paths.length === 0) {
        ctx.ui.notify("Usage: /brain:enola-plan <path> [path...]", "warning");
        return;
      }
      const result = await runEnolaPlan(home, paths);
      ctx.ui.notify(formatEnolaResult(result), "info");
    },
  });

  pi.registerCommand("brain:enola-findings", {
    description: "Snapshot findings grouped by explainer, joined against the judgment ledger — candidates to verify, never verdicts",
    handler: async (_args, ctx) => {
      const home = await requireBrain(ctx.cwd);
      if (!home) {
        ctx.ui.notify("No pi-brain home found.", "error");
        return;
      }
      ctx.ui.notify(await listFindings(home), "info");
    },
  });

  pi.registerCommand("brain:enola-judge", {
    description: "Record a verdict on a finding so the next session inherits it (usage: /brain:enola-judge <source:title> <accepted|rejected|noise> <why…>)",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd);
      if (!home) {
        ctx.ui.notify("No pi-brain home found.", "error");
        return;
      }
      const match = args.trim().match(/^(\S+.*?)\s+(accepted|rejected|noise)\s+(.+)$/s);
      if (!match) {
        ctx.ui.notify("Usage: /brain:enola-judge <source:title> <accepted|rejected|noise> <why…>", "warning");
        return;
      }
      const [, signature, verdict, why] = match;
      ctx.ui.notify(await judgeFinding(home, signature, verdict as "accepted" | "rejected" | "noise", why), "info");
    },
  });
}
