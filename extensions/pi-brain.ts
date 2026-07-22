/**
 * pi-brain extension — self-contained knowledge home
 *
 * This extension makes the pi-brain repository itself the substrate.
 * It reads and writes the local wiki/, sources/, log/, and wiki/_state/
 * directories, so a cloned pi-brain instance works immediately.
 *
 * Capabilities:
 * - Registers tools: brain_status, brain_capture, brain_ask, brain_tend,
 *   brain_validate, brain_views, brain_sync, brain_links, brain_state,
 *   brain_deepdive, brain_ingest_repo, brain_projects, brain_convert,
 *   brain_pull_connectors, brain_autonomy, brain_ingest
 * - Registers commands: /brain, /brain:capture, /brain:ask, /brain:tend,
 *   /brain:sync, /brain:shape, /brain:in, /brain:setup, /brain:connect,
 *   /brain:auto, /brain:continue, /brain:investigate, /brain:links,
 *   /brain:groom, /brain:state, /brain:deepdive, /brain:ingest-repo,
 *   /brain:projects, /brain:convert
 * - Shows a session-start status widget and footer status line
 */

import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { readFile, writeFile, readdir, stat, access, constants, mkdir, copyFile, unlink } from "node:fs/promises";
import { execFile } from "node:child_process";
import { join, relative, resolve } from "node:path";

interface BrainHome {
  path: string;
}

function execFilePromise(
  file: string,
  args: string[],
  options: { cwd?: string } = {}
): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    const child = execFile(file, args, {
      cwd: options.cwd,
      maxBuffer: 8 * 1024 * 1024,
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (d) => {
      stdout += String(d);
    });
    child.stderr?.on("data", (d) => {
      stderr += String(d);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      resolve({ stdout, stderr, code: code ?? 0 });
    });
  });
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await access(p, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function findBrainHome(cwd: string): Promise<BrainHome | null> {
  const envHome = process.env.PI_BRAIN_HOME;
  if (envHome) {
    const resolved = resolve(envHome);
    if (await pathExists(join(resolved, "wiki"))) {
      return { path: resolved };
    }
  }

  const projectHint = resolve(cwd, ".pi/brain-home");
  if (await pathExists(projectHint)) {
    const hinted = (await readFile(projectHint, "utf-8")).trim();
    if (hinted) {
      const resolved = resolve(hinted);
      if (await pathExists(join(resolved, "wiki"))) {
        return { path: resolved };
      }
    }
  }

  if (await pathExists(join(cwd, "wiki")) && await pathExists(join(cwd, "brain.config.yml"))) {
    return { path: cwd };
  }

  return null;
}

async function getMarkdownFiles(dir: string): Promise<string[]> {
  const result: string[] = [];
  async function walk(current: string) {
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join(current, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith(".")) {
        await walk(full);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        result.push(full);
      }
    }
  }
  await walk(dir);
  return result;
}

function parseFrontmatter(text: string): { frontmatter: string; body: string; valid: boolean } {
  const trimmed = text.trim();
  if (!trimmed.startsWith("---")) {
    return { frontmatter: "", body: text, valid: false };
  }
  const end = trimmed.indexOf("---", 3);
  if (end === -1) {
    return { frontmatter: "", body: text, valid: false };
  }
  return {
    frontmatter: trimmed.slice(3, end).trim(),
    body: trimmed.slice(end + 3).trim(),
    valid: true,
  };
}

function extractSimpleYamlValue(text: string, key: string): string | undefined {
  const match = text.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  return match?.[1].trim();
}

async function readOrg(home: BrainHome): Promise<string> {
  try {
    const config = await readFile(join(home.path, "brain.config.yml"), "utf-8");
    return extractSimpleYamlValue(config, "org") ?? "pi-brain";
  } catch {
    return "pi-brain";
  }
}

async function readAutoConnect(home: BrainHome): Promise<boolean> {
  try {
    const config = await readFile(join(home.path, "brain.config.yml"), "utf-8");
    const value = extractSimpleYamlValue(config, "auto_connect");
    return value === "true";
  } catch {
    return false;
  }
}

async function countPages(home: BrainHome): Promise<number> {
  const files = await getMarkdownFiles(join(home.path, "wiki"));
  return files.filter((f) => !f.includes("/_state/")).length;
}

async function countSources(home: BrainHome): Promise<number> {
  const files = await getMarkdownFiles(join(home.path, "sources"));
  return files.length;
}

async function readInbox(home: BrainHome): Promise<string> {
  try {
    return await readFile(join(home.path, "wiki", "_state", "inbox.md"), "utf-8");
  } catch {
    return "";
  }
}

function countInboxItems(inbox: string): number {
  return (inbox.match(/^### /gm) ?? []).length;
}

const STOP_WORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "had", "her", "was", "one", "our", "out", "day", "get", "has", "him", "his", "how", "its", "may", "new", "now", "old", "see", "two", "who", "boy", "did", "she", "use", "her", "way", "many", "oil", "sit", "set", "run", "eat", "far", "sea", "eye", "ago", "off", "too", "any", "say", "man", "try", "ask", "end", "why", "let", "put", "say", "she", "try", "way", "own", "say", "too", "old", "tell", "very", "when", "much", "would", "there", "their", "what", "said", "each", "which", "will", "about", "could", "other", "after", "first", "never", "these", "think", "where", "being", "every", "great", "might", "shall", "still", "those", "while", "this", "that", "with", "from", "they", "have", "were", "been", "than", "them", "into", "just", "like", "over", "also", "back", "only", "know", "take", "year", "good", "some", "come", "make", "well", "time", "here", "look", "down", "most", "long", "find", "give", "does", "made", "part", "such", "keep", "call", "came", "need", "feel", "seem", "turn", "hand", "high", "sure", "upon", "head", "help", "home", "side", "move", "both", "five", "once", "same", "must", "name", "left", "each", "done", "open", "case", "show", "live", "play", "went", "told", "seen", "heard", "talk", "soon", "read", "stop", "face", "fact", "land", "line", "kind", "next", "word", "came", "went", "told", "seen", "heard", "talk", "soon", "read", "stop", "face", "fact", "land", "line", "kind", "next", "word",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
}

async function searchFiles(home: BrainHome, query: string): Promise<Array<{ path: string; score: number; snippet: string }>> {
  const queryTerms = tokenize(query);
  if (queryTerms.length === 0) return [];

  const dirs = [join(home.path, "wiki"), join(home.path, "sources")];
  const allFiles: string[] = [];
  for (const dir of dirs) {
    if (await pathExists(dir)) {
      allFiles.push(...(await getMarkdownFiles(dir)));
    }
  }

  const docs: Array<{ path: string; tokens: string[]; text: string }> = [];
  await Promise.all(
    allFiles.map(async (file) => {
      try {
        const text = await readFile(file, "utf-8");
        docs.push({ path: relative(home.path, file), tokens: tokenize(text), text });
      } catch {
        // ignore unreadable
      }
    })
  );

  const totalDocs = docs.length;
  const docFreq = new Map<string, number>();
  for (const doc of docs) {
    const unique = new Set(doc.tokens);
    for (const term of unique) {
      docFreq.set(term, (docFreq.get(term) ?? 0) + 1);
    }
  }

  const scored = docs
    .map((doc) => {
      const tf = new Map<string, number>();
      for (const term of doc.tokens) {
        tf.set(term, (tf.get(term) ?? 0) + 1);
      }

      let score = 0;
      for (const term of queryTerms) {
        const termDocs = docFreq.get(term) ?? 0;
        if (termDocs === 0) continue;
        const idf = Math.log(totalDocs / termDocs);
        const termTf = tf.get(term) ?? 0;
        score += termTf * idf;
      }
      if (score <= 0) return null;

      const lines = doc.text.split("\n");
      let snippet = "";
      for (const line of lines) {
        if (queryTerms.some((t) => line.toLowerCase().includes(t))) {
          snippet = line.trim();
          break;
        }
      }
      return { path: doc.path, score, snippet: snippet.slice(0, 120) };
    })
    .filter((x): x is { path: string; score: number; snippet: string } => x !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return scored;
}

async function validateMarkdown(home: BrainHome): Promise<Array<{ path: string; errors: string[] }>> {
  const files = await getMarkdownFiles(join(home.path, "wiki"));
  const result: Array<{ path: string; errors: string[] }> = [];
  for (const file of files) {
    if (file.includes("/_state/")) continue;
    const text = await readFile(file, "utf-8");
    const { valid, frontmatter } = parseFrontmatter(text);
    const errors: string[] = [];
    if (!valid) errors.push("missing or malformed frontmatter");
    else {
      if (!extractSimpleYamlValue(frontmatter, "kind")) errors.push("missing kind");
      if (!extractSimpleYamlValue(frontmatter, "status")) errors.push("missing status");
      if (!extractSimpleYamlValue(frontmatter, "confidence")) errors.push("missing confidence");
    }
    if (errors.length > 0) {
      result.push({ path: relative(home.path, file), errors });
    }
  }
  return result;
}

async function regenerateViews(home: BrainHome): Promise<string> {
  const files = await getMarkdownFiles(join(home.path, "wiki"));
  const pages: Array<{ path: string; kind: string; title: string }> = [];
  for (const file of files) {
    if (file.includes("/_state/")) continue;
    const text = await readFile(file, "utf-8");
    const { valid, frontmatter, body } = parseFrontmatter(text);
    if (!valid) continue;
    const kind = extractSimpleYamlValue(frontmatter, "kind") ?? "unknown";
    const title = body.split("\n")[0].replace(/^#+\s*/, "").trim();
    pages.push({ path: relative(home.path, file), kind, title });
  }

  const byKind = new Map<string, Array<{ path: string; title: string }>>();
  for (const page of pages) {
    if (!byKind.has(page.kind)) byKind.set(page.kind, []);
    byKind.get(page.kind)!.push({ path: page.path, title: page.title });
  }

  const lines = [
    "---",
    "kind: meta",
    "status: living",
    "confidence: high",
    "---",
    "",
    "# pi-brain home",
    "",
    "This is the synthesis layer for this pi-brain instance.",
    "",
    "## Pages",
    "",
  ];
  for (const [kind, items] of byKind) {
    lines.push(`### ${kind}`);
    for (const item of items) {
      lines.push(`- [${item.title}](${item.path})`);
    }
    lines.push("");
  }
  lines.push("## Getting started", "", "1. Update `brain.config.yml`.", "2. Use `/brain:capture` to drop notes into the inbox.", "3. Use `/brain:shape` to turn pitches into ADRs/PRDs.", "4. Use `/brain:tend` to digest queued work.", "");

  await writeFile(join(home.path, "wiki", "index.md"), lines.join("\n"), "utf-8");
  return `Regenerated wiki/index.md with ${pages.length} pages across ${byKind.size} kinds.`;
}

async function countPagesByKind(home: BrainHome): Promise<Map<string, number>> {
  const files = await getMarkdownFiles(join(home.path, "wiki"));
  const counts = new Map<string, number>();
  for (const file of files) {
    if (file.includes("/_state/")) continue;
    const text = await readFile(file, "utf-8");
    const { valid, frontmatter } = parseFrontmatter(text);
    if (!valid) continue;
    const kind = extractSimpleYamlValue(frontmatter, "kind") ?? "unknown";
    counts.set(kind, (counts.get(kind) ?? 0) + 1);
  }
  return counts;
}

function listInboxItems(inbox: string, limit = 3): Array<{ id: string; summary: string }> {
  const items: Array<{ id: string; summary: string }> = [];
  const lines = inbox.split("\n");
  let current: { id: string; summary: string } | null = null;
  for (const line of lines) {
    const header = line.match(/^###\s+(\S+)\s+\(\d{4}-\d{2}-\d{2}\)/);
    if (header) {
      if (current) items.push(current);
      current = { id: header[1], summary: "" };
    } else if (current && line.trim().startsWith("- **summary:**")) {
      current.summary = line.replace(/^\s*-\s+\*\*summary:\*\*\s*/, "").trim();
    }
  }
  if (current) items.push(current);
  return items.slice(-limit).reverse();
}

const TEXT_EXTENSIONS = new Set([
  ".md", ".txt", ".py", ".ts", ".js", ".mjs", ".cjs", ".json", ".yml", ".yaml",
  ".toml", ".rs", ".go", ".rb", ".java", ".kt", ".swift", ".c", ".cpp", ".h",
  ".css", ".scss", ".html", ".xml", ".sh", ".bash", ".zsh", ".fish", ".sql",
]);

function isTextFile(name: string): boolean {
  const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
  return TEXT_EXTENSIONS.has(ext);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 64);
}

async function ingestFile(
  home: BrainHome,
  sourcePath: string,
  kind: string,
  summary?: string
): Promise<string> {
  const content = await readFile(sourcePath, "utf-8");
  const fileName = sourcePath.split(/[\\/]/).pop() ?? "source";
  const slug = slugify(fileName);
  const date = new Date().toISOString().slice(0, 10);
  const targetDir = join(home.path, "sources", kind);
  await mkdir(targetDir, { recursive: true });
  const targetPath = join(targetDir, `${date}--${slug}.md`);

  const lines = [
    "---",
    `kind: source`,
    `source_kind: ${kind}`,
    `source_path: ${sourcePath}`,
    `ingested_at: ${date}`,
    summary ? `summary: ${summary}` : null,
    "---",
    "",
    `# ${fileName}`,
    "",
    "```",
    content,
    "```",
    "",
  ].filter((l): l is string => l !== null);

  await writeFile(targetPath, lines.join("\n"), "utf-8");
  return targetPath;
}

async function ingestDirectory(
  home: BrainHome,
  sourcePath: string,
  kind: string,
  summary?: string
): Promise<string> {
  const dirName = sourcePath.split(/[\\/]/).pop() ?? "source";
  const slug = slugify(dirName);
  const date = new Date().toISOString().slice(0, 10);
  const targetDir = join(home.path, "sources", kind);
  await mkdir(targetDir, { recursive: true });
  const targetPath = join(targetDir, `${date}--${slug}.md`);

  const collected: Array<{ path: string; content: string }> = [];
  let totalSize = 0;
  const maxSize = 512 * 1024;

  async function walk(current: string) {
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === ".venv" || entry.name === "__pycache__") {
        continue;
      }
      const full = join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile() && isTextFile(entry.name)) {
        try {
          const content = await readFile(full, "utf-8");
          if (content.length > 100_000) continue; // skip huge individual files
          if (totalSize + content.length > maxSize) continue; // stop at budget
          collected.push({ path: relative(sourcePath, full), content });
          totalSize += content.length;
        } catch {
          // ignore unreadable files
        }
      }
    }
  }

  await walk(sourcePath);

  const lines = [
    "---",
    `kind: source`,
    `source_kind: ${kind}`,
    `source_path: ${sourcePath}`,
    `ingested_at: ${date}`,
    summary ? `summary: ${summary}` : null,
    "---",
    "",
    `# ${dirName}`,
    "",
    `Ingested ${collected.length} text files from ${sourcePath}.`,
    "",
  ].filter((l): l is string => l !== null);

  for (const item of collected) {
    lines.push(`## ${item.path}`, "", "```", item.content, "```", "");
  }

  await writeFile(targetPath, lines.join("\n"), "utf-8");
  return targetPath;
}

async function ingestUrl(
  home: BrainHome,
  url: string,
  kind: string,
  summary?: string
): Promise<string> {
  const slug = slugify(new URL(url).hostname + new URL(url).pathname);
  const date = new Date().toISOString().slice(0, 10);
  const targetDir = join(home.path, "sources", kind);
  await mkdir(targetDir, { recursive: true });
  const targetPath = join(targetDir, `${date}--${slug}.md`);

  let fetchedContent: string | undefined;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (response.ok) {
      const text = await response.text();
      if (text.length <= 500_000) {
        fetchedContent = text;
      }
    }
  } catch {
    // Network fetch is best-effort; metadata is enough.
  }

  const lines = [
    "---",
    `kind: source`,
    `source_kind: ${kind}`,
    `source_url: ${url}`,
    `ingested_at: ${date}`,
    summary ? `summary: ${summary}` : null,
    "---",
    "",
    `# ${url}`,
    "",
  ].filter((l): l is string => l !== null);

  if (fetchedContent !== undefined) {
    lines.push("```", fetchedContent, "```", "");
  } else {
    lines.push("URL source recorded. Content could not be fetched automatically.", "");
  }

  await writeFile(targetPath, lines.join("\n"), "utf-8");
  return targetPath;
}

async function appendInboxItem(home: BrainHome, title: string, note: string) {
  const id = slugify(title);
  const date = new Date().toISOString().slice(0, 10);
  const entry = buildInboxEntry(id, date, "ingest", note);
  const inboxPath = join(home.path, "wiki", "_state", "inbox.md");
  const current = await readInbox(home);
  await writeFile(inboxPath, current.trimEnd() + entry + "\n", "utf-8");
}

function buildInboxEntry(id: string, date: string, kind: string, summary: string): string {
  return [
    "",
    `### ${id} (${date})`,
    "",
    `- **kind:** ${kind}`,
    `- **scope:** brain`,
    `- **summary:** ${summary}`,
    "",
  ].join("\n");
}

async function replaceInboxItem(home: BrainHome, id: string, newEntry: string) {
  const inboxPath = join(home.path, "wiki", "_state", "inbox.md");
  const current = await readInbox(home);
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`\\n### ${escapedId} \\([^)]*\\)[\\s\\S]*?(?=\\n### |$)`);
  let updated: string;
  if (pattern.test(current)) {
    updated = current.replace(pattern, newEntry + "\n");
  } else {
    updated = current.trimEnd() + newEntry + "\n";
  }
  await writeFile(inboxPath, updated, "utf-8");
}

interface AutoIngestBatchEntry {
  source: string;
  targetPath: string;
  date: string;
}

interface AutoIngestBatch {
  entries: AutoIngestBatchEntry[];
  createdAt: string;
}

const AUTO_INGEST_BATCH_PATH = ["wiki", "_state", "auto-ingest-batch.json"];

async function readAutoIngestBatch(home: BrainHome): Promise<AutoIngestBatch> {
  try {
    const text = await readFile(join(home.path, ...AUTO_INGEST_BATCH_PATH), "utf-8");
    return JSON.parse(text) as AutoIngestBatch;
  } catch {
    return { entries: [], createdAt: new Date().toISOString().slice(0, 10) };
  }
}

async function writeAutoIngestBatch(home: BrainHome, batch: AutoIngestBatch) {
  await mkdir(join(home.path, "wiki", "_state"), { recursive: true });
  await writeFile(join(home.path, ...AUTO_INGEST_BATCH_PATH), JSON.stringify(batch, null, 2), "utf-8");
}

async function appendAutoIngestBatch(home: BrainHome, source: string, targetPath: string) {
  const batch = await readAutoIngestBatch(home);
  batch.entries.push({ source, targetPath: relative(home.path, targetPath), date: new Date().toISOString().slice(0, 10) });
  await writeAutoIngestBatch(home, batch);
  await flushAutoIngestInboxItem(home, batch);
}

async function flushAutoIngestInboxItem(home: BrainHome, batch: AutoIngestBatch) {
  const id = "auto-ingest-batch";
  const date = batch.createdAt;
  const summary = `Auto-ingested ${batch.entries.length} source(s). Review at ${AUTO_INGEST_BATCH_PATH.join("/")}. Run /brain:tend to synthesize, or /brain:groom to archive if stale.`;
  const entry = buildInboxEntry(id, date, "auto-ingest", summary);
  await replaceInboxItem(home, id, entry);
}

async function clearAutoIngestBatch(home: BrainHome) {
  try {
    await unlink(join(home.path, ...AUTO_INGEST_BATCH_PATH));
  } catch {
    // ignore if missing
  }
}

async function findRecentSources(home: BrainHome, since: number): Promise<string[]> {
  const sourcesDir = join(home.path, "sources");
  if (!(await pathExists(sourcesDir))) return [];
  const result: string[] = [];
  async function walk(dir: string) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        try {
          const s = await stat(full);
          if (s.mtimeMs >= since) {
            result.push(relative(home.path, full));
          }
        } catch {
          // ignore
        }
      }
    }
  }
  await walk(sourcesDir);
  return result;
}

const AUTO_INGEST_TTL_DAYS = 7;

function daysAgo(dateStr: string): number {
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

async function appendLog(home: BrainHome, line: string) {
  const logPath = join(home.path, "log", "log.md");
  const current = await readFile(logPath, "utf-8").catch(() => "# Log\n\n");
  const date = new Date().toISOString().slice(0, 10);
  await writeFile(logPath, current.trimEnd() + `\n- ${date}: ${line}\n`, "utf-8");
}

async function autoGroom(home: BrainHome) {
  const batch = await readAutoIngestBatch(home);
  if (batch.entries.length > 0 && daysAgo(batch.createdAt) >= AUTO_INGEST_TTL_DAYS) {
    await replaceInboxItem(home, "auto-ingest-batch", buildInboxEntry("auto-ingest-batch", batch.createdAt, "auto-ingest", "[archived] Stale auto-ingest batch archived by auto-groom."));
    await clearAutoIngestBatch(home);
    await appendLog(home, `auto-groom archived stale auto-ingest batch from ${batch.createdAt} (${batch.entries.length} entries)`);
  }
}

interface AutonomyState {
  enabled: boolean;
}

async function readAutonomy(home: BrainHome): Promise<AutonomyState> {
  try {
    const text = await readFile(join(home.path, "wiki", "_state", "autonomy.json"), "utf-8");
    return JSON.parse(text) as AutonomyState;
  } catch {
    return { enabled: false };
  }
}

async function writeAutonomy(home: BrainHome, state: AutonomyState) {
  await mkdir(join(home.path, "wiki", "_state"), { recursive: true });
  await writeFile(join(home.path, "wiki", "_state", "autonomy.json"), JSON.stringify(state, null, 2), "utf-8");
}

const AUTONOMY_PROMPT = `
Brain autonomy mode is ON.
You are working inside a pi-brain clone. The brain home is {BRAIN_HOME}. Read AGENTS.md and follow its contract, including the "Stop and shape" rule and the adr-before-structural-changes constraint.
You are expected to maintain the pi-brain proactively within this session. The boundary is:
- SILENTLY allowed: low-risk maintenance — batch auto-connect ingestions, run brain_sync, auto-groom stale auto-ingest items, synthesize low-risk observations into wiki/<scope>/ai-suggestions/ with ai_suggestion: true and the required banner, flag broken citations or drift.
- EXPLICITLY gated: commitment-class work — writing/moving ADRs, PRDs, epics, bets, or records; editing approved wiki pages; running the expensive /brain:tend digest on high-risk/structural items; any structural/repo change.
At session start, call brain_status to orient yourself.
Before answering factual questions, prefer brain_ask over guessing.
Capture decisions, observations, and open questions with brain_capture without asking permission.
When auto-ingesting sources (including via brain_pull_connectors), batch them into a single inbox summary item instead of creating one item per source.
Auto-groom stale auto-connect batches without asking.
When the inbox has pending items, distinguish low-risk captures (auto-ingest, minor observations) from high-risk/structural items. Suggest /brain:tend only for the high-risk ones; summarize low-risk ones in ai-suggestions/.
When you encounter a pitch or commitment-class decision, you may draft an AI-suggested ADR/PRD/RFC under wiki/<scope>/ai-suggestions/ using the ai-suggestion templates. Do NOT write to wiki/<scope>/{adrs,prds,rfcs,epics,bets,records}/ and do NOT start implementation unless the user explicitly says the decision is approved.
For cross-cutting, uncertain, or controversial commitments, prefer drafting an AI-suggested RFC first to surface perspectives before writing a PRD/ADR.
When shaping or investigating, load relevant personas from personas/agents/ and honor active constraints in wiki/<scope>/constraints/. A must violation blocks acceptance.
Run brain_sync after making changes to the wiki.
If brain.config.yml has auto_connect: true and connectors are configured, run brain_pull_connectors at session start to stay in sync. Do not block user work for this; run it opportunistically and mention it briefly.
`;

export default function piBrainExtension(pi: ExtensionAPI) {
  async function requireBrain(cwd: string, ctx?: ExtensionContext): Promise<BrainHome | null> {
    const home = await findBrainHome(cwd);
    if (!home && ctx) {
      ctx.ui.notify("pi-brain: no pi-brain home found", "warning");
    }
    return home;
  }

  function setupHint(): string {
    return [
      "No pi-brain home here yet.",
      "",
      "Run /brain:setup to create one,",
      "or set PI_BRAIN_HOME / .pi/brain-home to point to an existing clone.",
    ].join("\n");
  }

  async function loadBriefing(ctx: ExtensionContext) {
    const home = await requireBrain(ctx.cwd, ctx);
    if (!home) {
      ctx.ui.setWidget("pi-brain", [setupHint()]);
      return;
    }

    const org = await readOrg(home);
    const pages = await countPages(home);
    const sources = await countSources(home);
    const inbox = await readInbox(home);
    const inboxCount = countInboxItems(inbox);
    const kindCounts = await countPagesByKind(home);
    const recentItems = listInboxItems(inbox, 3);

    const lines = [
      `🧠 ${org}`,
      `   ${pages} wiki pages · ${sources} sources · ${inboxCount} inbox items`,
      "",
      "Pages:",
      ...Array.from(kindCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([kind, count]) => `  ${kind}: ${count}`),
    ];

    if (recentItems.length > 0) {
      lines.push("", "Needs you:");
      for (const item of recentItems) {
        const summary = item.summary.length > 60 ? item.summary.slice(0, 57) + "..." : item.summary;
        lines.push(`  • ${summary}`);
      }
      lines.push("", "Use /brain:tend to digest.");
    } else {
      lines.push("", "Inbox is empty. Everything is tended.");
    }

    ctx.ui.setWidget("pi-brain", lines);

    const theme = ctx.ui.theme;
    if (inboxCount > 0) {
      ctx.ui.setStatus(
        "pi-brain",
        theme.fg("warning", `🧠 ${inboxCount} brain item${inboxCount === 1 ? "" : "s"} waiting`)
      );
    } else {
      ctx.ui.setStatus("pi-brain", theme.fg("success", "🧠 brain up to date"));
    }
  }

  // Register tools
  pi.registerTool({
    name: "brain_status",
    label: "Brain status",
    description: "Read the pi-brain status dashboard and inbox summary.",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, ctx) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text", text: setupHint() }], details: {} };

      const org = await readOrg(home);
      const pages = await countPages(home);
      const sources = await countSources(home);
      const inbox = await readInbox(home);
      const inboxCount = countInboxItems(inbox);
      const kindCounts = await countPagesByKind(home);
      const recentItems = listInboxItems(inbox, 5);

      const kindLines = Array.from(kindCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([kind, count]) => `  ${kind}: ${count}`);

      const inboxLines = recentItems.map((item) => {
        const summary = item.summary.length > 80 ? item.summary.slice(0, 77) + "..." : item.summary;
        return `  • ${summary}`;
      });

      return {
        content: [
          {
            type: "text",
            text: [
              `Org: ${org}`,
              `Wiki pages: ${pages}`,
              `Sources: ${sources}`,
              `Inbox items: ${inboxCount}`,
              "",
              "Pages by kind:",
              ...kindLines,
              "",
              inboxCount > 0 ? "Needs you:" : "Inbox empty.",
              ...inboxLines,
            ].join("\n"),
          },
        ],
        details: {},
      };
    },
  });

  pi.registerTool({
    name: "brain_capture",
    label: "Brain capture",
    description: "Capture a note into the pi-brain inbox.",
    parameters: Type.Object({
      note: Type.String({ description: "The note to capture." }),
      scope: Type.Optional(Type.String({ description: "Optional repo/org/brain scope." })),
      kind: Type.Optional(Type.String({ description: "Optional kind: decision, insight, task, source." })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text", text: setupHint() }], details: {} };

      const id = params.note
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 48)
        .replace(/(^-|-$)/g, "") || "capture";
      const date = new Date().toISOString().slice(0, 10);
      const kind = params.kind ?? "task";
      const scope = params.scope ?? "brain";

      const entry = [
        "",
        `### ${id} (${date})`,
        "",
        `- **kind:** ${kind}`,
        `- **scope:** ${scope}`,
        `- **summary:** ${params.note}`,
        "",
      ].join("\n");

      const inboxPath = join(home.path, "wiki", "_state", "inbox.md");
      const current = await readInbox(home);
      await writeFile(inboxPath, current.trimEnd() + entry + "\n", "utf-8");

      return {
        content: [{ type: "text", text: `Captured to inbox: ${id}` }],
        details: {},
      };
    },
  });

  pi.registerTool({
    name: "brain_ask",
    label: "Brain ask",
    description: "Ask the pi-brain a question over the wiki and sources corpus.",
    parameters: Type.Object({
      question: Type.String({ description: "The question to ask." }),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text", text: setupHint() }], details: {} };

      const results = await searchFiles(home, params.question);
      if (results.length === 0) {
        return { content: [{ type: "text", text: "No matches found." }], details: {} };
      }

      const text = results
        .map((r) => `[score ${r.score}] ${r.path}\n  ${r.snippet}`)
        .join("\n\n");
      return { content: [{ type: "text", text }], details: {} };
    },
  });

  pi.registerTool({
    name: "brain_tend",
    label: "Brain tend",
    description: "List the pi-brain inbox queue.",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, ctx) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text", text: setupHint() }], details: {} };

      const inbox = await readInbox(home);
      const count = countInboxItems(inbox);
      return {
        content: [
          {
            type: "text",
            text: `Inbox items: ${count}\n\n${inbox.slice(0, 3000)}\n\nAsk the user which items to digest.`,
          },
        ],
        details: {},
      };
    },
  });

  pi.registerTool({
    name: "brain_validate",
    label: "Brain validate",
    description: "Validate frontmatter conformance of wiki pages.",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, ctx) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text", text: setupHint() }], details: {} };

      const errors = await validateMarkdown(home);
      if (errors.length === 0) {
        return { content: [{ type: "text", text: "All wiki pages pass frontmatter validation." }], details: {} };
      }

      const text = errors.map((e) => `${e.path}: ${e.errors.join(", ")}`).join("\n");
      return { content: [{ type: "text", text }], details: {} };
    },
  });

  pi.registerTool({
    name: "brain_views",
    label: "Brain views",
    description: "Regenerate the pi-brain index view from the wiki corpus.",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, ctx) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text", text: setupHint() }], details: {} };

      const message = await regenerateViews(home);
      return { content: [{ type: "text", text: message }], details: {} };
    },
  });

  pi.registerTool({
    name: "brain_sync",
    label: "Brain sync",
    description: "Run validate and regenerate views.",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, ctx) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text", text: setupHint() }], details: {} };

      const errors = await validateMarkdown(home);
      const viewMessage = await regenerateViews(home);
      const errorText = errors.length > 0 ? errors.map((e) => `${e.path}: ${e.errors.join(", ")}`).join("\n") : "No validation errors.";

      return {
        content: [{ type: "text", text: `${viewMessage}\n\n${errorText}` }],
        details: {},
      };
    },
  });

  pi.registerTool({
    name: "brain_pull_connectors",
    label: "Brain pull connectors",
    description: "Run configured pull connectors (GitHub, etc.) to snapshot external sources into sources/.",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, ctx) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text", text: setupHint() }], details: {} };

      const script = join(home.path, "tools", "connectors", "run.mjs");
      if (!(await pathExists(script))) {
        return { content: [{ type: "text", text: "Connector runner not found at tools/connectors/run.mjs" }], details: {} };
      }

      const startTime = Date.now();
      const autonomy = await readAutonomy(home);
      const result = await execFilePromise("node", [script], { cwd: home.path });
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");

      if (autonomy.enabled) {
        const recent = await findRecentSources(home, startTime);
        for (const path of recent) {
          await appendAutoIngestBatch(home, `auto-connect: ${path}`, join(home.path, path));
        }
      }

      return {
        content: [{ type: "text", text: output || "Connectors finished with no output." }],
        details: {},
      };
    },
  });

  pi.registerTool({
    name: "brain_autonomy",
    label: "Brain autonomy",
    description: "Read or toggle the autonomous brain-maintenance mode.",
    parameters: Type.Object({
      enabled: Type.Optional(Type.Boolean({ description: "Set to true/false to toggle; omit to read current state." })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text", text: setupHint() }], details: {} };

      const state = await readAutonomy(home);
      if (params.enabled !== undefined) {
        state.enabled = params.enabled;
        await writeAutonomy(home, state);
      }

      return {
        content: [
          {
            type: "text",
            text: `Autonomy is ${state.enabled ? "ON" : "OFF"}. ${
              state.enabled
                ? "The agent will proactively maintain the brain this session."
                : "The agent will only use brain tools when explicitly asked."
            }`,
          },
        ],
        details: {},
      };
    },
  });







  pi.registerTool({
    name: "brain_convert",
    label: "Brain convert",
    description: "Convert the current repository into a pi-brain clone by moving project code into a subdirectory and scaffolding the brain structure.",
    parameters: Type.Object({
      subdir: Type.Optional(Type.String({ description: "Subdirectory for existing project code (default: files)." })),
      dry_run: Type.Optional(Type.Boolean({ description: "Preview the conversion without moving files." })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const home = await requireBrain(ctx.cwd);
      if (home) {
        return { content: [{ type: "text", text: "This directory already looks like a pi-brain home. Aborting to avoid data loss." }], details: {} };
      }

      const script = join(ctx.cwd, "tools", "brain-convert.mjs");
      if (!(await pathExists(script))) {
        return { content: [{ type: "text", text: "Convert runner not found at tools/brain-convert.mjs" }], details: {} };
      }

      const args = [script];
      if (params.subdir) args.push(params.subdir);
      if (params.dry_run) args.push("--dry-run");
      const result = await execFilePromise("node", args, { cwd: ctx.cwd });
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
      return {
        content: [{ type: "text", text: output || "Conversion complete." }],
        details: {},
      };
    },
  });
  pi.registerTool({
    name: "brain_projects",
    label: "Brain projects",
    description: "List onboarded projects in this pi-brain clone.",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, ctx) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text", text: setupHint() }], details: {} };

      const script = join(home.path, "tools", "brain-projects.mjs");
      if (!(await pathExists(script))) {
        return { content: [{ type: "text", text: "Projects runner not found at tools/brain-projects.mjs" }], details: {} };
      }

      const result = await execFilePromise("node", [script], { cwd: home.path });
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
      return {
        content: [{ type: "text", text: output || "No projects found." }],
        details: {},
      };
    },
  });
  pi.registerTool({
    name: "brain_ingest_repo",
    label: "Brain ingest repo",
    description: "Onboard a repository as a maintained project: snapshot into sources/repos/<scope>/, scaffold wiki/<scope>/, and add to active_repos.",
    parameters: Type.Object({
      target: Type.String({ description: "Path or URL to the repository." }),
      scope: Type.Optional(Type.String({ description: "Scope name (default: repo basename)." })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text", text: setupHint() }], details: {} };

      const script = join(home.path, "tools", "brain-ingest-repo.mjs");
      if (!(await pathExists(script))) {
        return { content: [{ type: "text", text: "Repo ingest runner not found at tools/brain-ingest-repo.mjs" }], details: {} };
      }

      const args = params.scope ? [script, params.target, params.scope] : [script, params.target];
      const result = await execFilePromise("node", args, { cwd: home.path });
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
      return {
        content: [{ type: "text", text: output || "Repo ingested." }],
        details: {},
      };
    },
  });
  pi.registerTool({
    name: "brain_deepdive",
    label: "Brain deepdive",
    description: "Read a file or directory in a target repository transiently for shaping/investigation. Does NOT copy content into sources/.",
    parameters: Type.Object({
      target: Type.String({ description: "Absolute or relative path to a file or directory." }),
      question: Type.Optional(Type.String({ description: "What to look for." })),
      max_files: Type.Optional(Type.Number({ description: "Max files to read when target is a directory.", default: 10 })),
      store: Type.Optional(Type.Boolean({ description: "Store a lightweight record in wiki/_state/deepdives.json.", default: true })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text", text: setupHint() }], details: {} };

      const target = resolve(params.target);
      if (!(await pathExists(target))) {
        return { content: [{ type: "text", text: `Target not found: ${target}` }], details: {} };
      }

      const maxFiles = params.max_files ?? 10;
      const fileStat = await stat(target);
      const records = [];

      async function* walk(dir: string, depth = 0): AsyncGenerator<string> {
        if (depth > 2) return;
        const entries = await readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "dist" || entry.name === "build") continue;
          const full = join(dir, entry.name);
          if (entry.isDirectory()) {
            yield* walk(full, depth + 1);
          } else {
            yield full;
          }
        }
      }

      if (fileStat.isFile()) {
        const content = await readFile(target, "utf-8");
        records.push({ path: target, kind: "file", snippet: content.slice(0, 50000) });
      } else if (fileStat.isDirectory()) {
        const files: string[] = [];
        for await (const f of walk(target)) {
          files.push(f);
          if (files.length >= maxFiles) break;
        }
        for (const f of files) {
          try {
            const content = await readFile(f, "utf-8");
            records.push({ path: f, kind: "file", snippet: content.slice(0, 10000) });
          } catch {
            // skip unreadable
          }
        }
      }

      if (params.store !== false) {
        const recordFile = join(home.path, "wiki", "_state", "deepdives.json");
        let existing: any[] = [];
        try {
          existing = JSON.parse(await readFile(recordFile, "utf-8"));
        } catch {
          // empty
        }
        existing.push({
          at: new Date().toISOString(),
          target,
          question: params.question ?? "",
          files: records.map((r) => r.path),
        });
        await writeFile(recordFile, JSON.stringify(existing.slice(-50), null, 2), "utf-8");
      }

      const questionLine = params.question ? `Question: ${params.question}\n` : "";
      const summary = records.map((r) => `--- ${r.path} ---\n${r.snippet}`).join("\n\n");
      return {
        content: [{ type: "text", text: `${questionLine}Deepdive into ${target}\n\n${summary}` }],
        details: { files: records.map((r) => r.path) },
      };
    },
  });
  pi.registerTool({
    name: "brain_state",
    label: "Brain state",
    description: "Regenerate state, roadmap, and options pages from the corpus.",
    parameters: Type.Object({
      scope: Type.Optional(Type.String({ description: "Scope to regenerate (default: org)." })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text", text: setupHint() }], details: {} };

      const script = join(home.path, "tools", "brain-state.mjs");
      if (!(await pathExists(script))) {
        return { content: [{ type: "text", text: "State runner not found at tools/brain-state.mjs" }], details: {} };
      }

      const args = params.scope ? [script, params.scope] : [script];
      const result = await execFilePromise("node", args, { cwd: home.path });
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
      return {
        content: [{ type: "text", text: output || "State pages regenerated." }],
        details: {},
      };
    },
  });
  pi.registerTool({
    name: "brain_links",
    label: "Brain links",
    description: "Derive the pi-brain link graph: orphans, hubs, dead links, and suggestions.",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, ctx) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text", text: setupHint() }], details: {} };

      const script = join(home.path, "tools", "brain-links.mjs");
      if (!(await pathExists(script))) {
        return { content: [{ type: "text", text: "Link graph runner not found at tools/brain-links.mjs" }], details: {} };
      }

      const result = await execFilePromise("node", [script], { cwd: home.path });
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
      return {
        content: [{ type: "text", text: output || "Link graph finished with no output." }],
        details: {},
      };
    },
  });
  pi.registerTool({
    name: "brain_ingest",
    label: "Brain ingest",
    description: "Ingest a file, directory, or URL into sources/ and queue synthesis in the inbox.",
    parameters: Type.Object({
      source: Type.String({ description: "File path, directory path, or URL to ingest." }),
      kind: Type.Optional(
        Type.String({
          description: "Source kind: repo, doc, conversation, web. Auto-detected by default.",
        })
      ),
      summary: Type.Optional(Type.String({ description: "Optional one-line summary of the source." })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text", text: setupHint() }], details: {} };

      const isUrl = /^https?:\/\//i.test(params.source);
      let sourcePath = params.source;
      if (!isUrl) {
        sourcePath = resolve(ctx.cwd, params.source);
      }

      let detectedKind = params.kind;
      if (!detectedKind) {
        if (isUrl) detectedKind = "web";
        else {
          const s = await stat(sourcePath).catch(() => null);
          if (s?.isDirectory()) detectedKind = "repo";
          else detectedKind = "doc";
        }
      }

      try {
        let targetPath: string;
        if (isUrl) {
          targetPath = await ingestUrl(home, params.source, detectedKind, params.summary);
        } else {
          const s = await stat(sourcePath);
          if (s.isDirectory()) {
            targetPath = await ingestDirectory(home, sourcePath, detectedKind, params.summary);
          } else {
            targetPath = await ingestFile(home, sourcePath, detectedKind, params.summary);
          }
        }

        const relativePath = relative(home.path, targetPath);
        const autonomy = await readAutonomy(home);
        if (autonomy.enabled) {
          await appendAutoIngestBatch(home, params.source, targetPath);
        } else {
          const note = `Ingested ${params.source} → ${relativePath}. Synthesize into wiki if useful.`;
          await appendInboxItem(home, `ingest-${params.source}`, note);
        }

        return {
          content: [{ type: "text", text: `Ingested to ${relativePath}` }],
          details: {},
        };
      } catch (err: any) {
        return {
          content: [{ type: "text", text: `Ingest failed: ${err?.message ?? err}` }],
          details: {},
        };
      }
    },
  });

  // Register commands
  pi.registerCommand("brain", {
    description: "Show the pi-brain briefing",
    handler: async (_args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const org = await readOrg(home);
      const pages = await countPages(home);
      const sources = await countSources(home);
      const inbox = await readInbox(home);
      const inboxCount = countInboxItems(inbox);
      const kindCounts = await countPagesByKind(home);
      const recentItems = listInboxItems(inbox, 3);

      const lines = [
        `${org} — ${pages} pages · ${sources} sources · ${inboxCount} inbox items`,
        "",
        "Pages:",
        ...Array.from(kindCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([kind, count]) => `  ${kind}: ${count}`),
      ];

      if (recentItems.length > 0) {
        lines.push("", "Needs you:");
        for (const item of recentItems) {
          const summary = item.summary.length > 60 ? item.summary.slice(0, 57) + "..." : item.summary;
          lines.push(`  • ${summary}`);
        }
      }

      ctx.ui.notify(lines.join("\n"), "info");
    },
  });

  pi.registerCommand("brain:capture", {
    description: "Capture a note into the pi-brain inbox",
    handler: async (args, ctx) => {
      if (!args.trim()) {
        ctx.ui.notify("Usage: /brain:capture <note>", "warning");
        return;
      }
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;

      const id = args
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 48)
        .replace(/(^-|-$)/g, "") || "capture";
      const date = new Date().toISOString().slice(0, 10);
      const entry = [
        "",
        `### ${id} (${date})`,
        "",
        `- **kind:** task`,
        `- **scope:** brain`,
        `- **summary:** ${args}`,
        "",
      ].join("\n");

      const inboxPath = join(home.path, "wiki", "_state", "inbox.md");
      const current = await readInbox(home);
      await writeFile(inboxPath, current.trimEnd() + entry + "\n", "utf-8");
      ctx.ui.notify(`Captured: ${id}`, "success");
    },
  });

  pi.registerCommand("brain:ask", {
    description: "Ask the pi-brain a question",
    handler: async (args, ctx) => {
      if (!args.trim()) {
        ctx.ui.notify("Usage: /brain:ask <question>", "warning");
        return;
      }
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const results = await searchFiles(home, args);
      const text = results.length > 0 ? results.map((r) => `[${r.score}] ${r.path}\n  ${r.snippet}`).join("\n\n") : "No matches.";
      ctx.ui.notify(text, "info");
    },
  });

  pi.registerCommand("brain:tend", {
    description: "Digest the pi-brain tend queue",
    handler: async (_args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const inbox = await readInbox(home);
      const count = countInboxItems(inbox);
      ctx.ui.notify(`${count} inbox item(s)\n\n${inbox.slice(0, 1500)}`, "info");
    },
  });

  pi.registerCommand("brain:sync", {
    description: "Run a pi-brain health sweep",
    handler: async (_args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const errors = await validateMarkdown(home);
      const viewMessage = await regenerateViews(home);
      const errorText = errors.length > 0 ? errors.map((e) => `${e.path}: ${e.errors.join(", ")}`).join("\n") : "No validation errors.";
      ctx.ui.notify(`${viewMessage}\n${errorText}`, errors.length > 0 ? "warning" : "success");
    },
  });

  pi.registerCommand("brain:shape", {
    description: "Human-gated ADR/PRD/epic/bet authoring in pi-brain",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const message = args.trim() ? `/skill:brain-shape ${args.trim()}` : "/skill:brain-shape";
      pi.sendUserMessage(message);
    },
  });

  pi.registerCommand("brain:in", {
    description: "Ingest a file, directory, or URL into sources/",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      if (!args.trim()) {
        ctx.ui.notify("Usage: /brain:in <path-or-url> [kind] [summary]", "warning");
        return;
      }
      const message = `/skill:brain-ingest ${args.trim()}`;
      pi.sendUserMessage(message);
    },
  });

  pi.registerCommand("brain:setup", {
    description: "Set up or reconfigure this directory as a pi-brain home",
    handler: async (_args, ctx) => {
      if (!ctx.hasUI) {
        ctx.ui.notify("/brain:setup requires interactive TUI mode", "error");
        return;
      }

      const cwd = ctx.cwd;
      const alreadyHome = await pathExists(join(cwd, "brain.config.yml"));

      if (alreadyHome) {
        const ok = await ctx.ui.confirm("pi-brain setup", "This directory is already configured. Reconfigure?");
        if (!ok) return;
      }

      const defaultOrg = alreadyHome ? (await readOrg({ path: cwd })) : "my-project";
      const org = await ctx.ui.input("Organisation or project name", defaultOrg);
      if (!org || !org.trim()) return;

      const defaultRepos = alreadyHome
        ? ""
        : cwd.split(/[\\/]/).pop() ?? "my-project";
      const reposInput = await ctx.ui.input("Active repos (comma-separated)", defaultRepos);
      const repos = (reposInput ?? "")
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean);

      const configLines = [
        `# pi-brain configuration for ${org.trim()}.`,
        "",
        `org: \"${org.trim()}\"`,
        "",
        "active_repos:",
        ...repos.map((r) => `  - ${r}`),
        "",
        "archived_repos: []",
        "",
        "connectors:",
        "  github:",
        "    repos: []",
        "  notion:",
        "    pages: []",
        "  slack:",
        "    channels: []",
        "  datadog:",
        '    site: ""',
        "  langfuse:",
        '    host: ""',
        "  structure:",
        "    repos: []",
        "",
      ];
      await writeFile(join(cwd, "brain.config.yml"), configLines.join("\n"), "utf-8");

      await mkdir(join(cwd, "wiki", "_state"), { recursive: true });
      await mkdir(join(cwd, "sources"), { recursive: true });
      await mkdir(join(cwd, "log"), { recursive: true });

      const indexPath = join(cwd, "wiki", "index.md");
      if (!(await pathExists(indexPath))) {
        await writeFile(
          indexPath,
          "---\nkind: meta\nstatus: living\nconfidence: high\n---\n\n# Home\n\nWelcome to the pi-brain home for this project.\n",
          "utf-8"
        );
      }

      const inboxPath = join(cwd, "wiki", "_state", "inbox.md");
      if (!(await pathExists(inboxPath))) {
        await writeFile(
          inboxPath,
          "---\nkind: inbox\n---\n\n# Inbox\n\nQueued items waiting to be digested.\n",
          "utf-8"
        );
      }

      const sourcesReadmePath = join(cwd, "sources", "README.md");
      if (!(await pathExists(sourcesReadmePath))) {
        await writeFile(
          sourcesReadmePath,
          "# sources\n\nImmutable inputs for this pi-brain instance.\n",
          "utf-8"
        );
      }

      const logPath = join(cwd, "log", "log.md");
      if (!(await pathExists(logPath))) {
        await writeFile(logPath, "# log\n\nAppend-only operations log.\n", "utf-8");
      }

      const home: BrainHome = { path: cwd };
      await regenerateViews(home);
      const errors = await validateMarkdown(home);

      const gitDir = join(cwd, ".git");
      if (await pathExists(gitDir)) {
        const installHook = await ctx.ui.confirm("pi-brain setup", "Install the pre-commit validation hook?");
        if (installHook) {
          const hookSource = join(cwd, "tools", "git-hooks", "pre-commit");
          const hookTarget = join(gitDir, "hooks", "pre-commit");
          if (await pathExists(hookTarget)) {
            await unlink(hookTarget);
          }
          await copyFile(hookSource, hookTarget);
        }
      }

      ctx.ui.notify(
        `pi-brain set up for ${org.trim()}\nRepos: ${repos.join(", ") || "none"}\n${errors.length > 0 ? "Validation warnings present." : "Ready to capture, ingest, and shape."}`,
        errors.length > 0 ? "warning" : "success"
      );
    },
  });

  pi.registerCommand("brain:connect", {
    description: "Run configured pull connectors to snapshot external sources",
    handler: async (_args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const script = join(home.path, "tools", "connectors", "run.mjs");
      if (!(await pathExists(script))) {
        ctx.ui.notify("Connector runner not found", "error");
        return;
      }
      const result = await execFilePromise("node", [script], { cwd: home.path });
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
      ctx.ui.notify(output || "Connectors finished.", result.code === 0 ? "success" : "error");
    },
  });

  pi.registerCommand("brain:auto", {
    description: "Toggle autonomous brain-maintenance mode",
    handler: async (_args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const state = await readAutonomy(home);
      state.enabled = !state.enabled;
      await writeAutonomy(home, state);
      ctx.ui.notify(
        state.enabled
          ? "Autonomy ON — pi will proactively maintain the brain this session."
          : "Autonomy OFF — pi will only use brain tools when explicitly asked.",
        "info"
      );
    },
  });

  pi.registerCommand("brain:continue", {
    description: "Continue in-flight pi-brain work",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const message = args.trim() ? `/skill:brain-continue ${args.trim()}` : "/skill:brain-continue";
      pi.sendUserMessage(message);
    },
  });

  pi.registerCommand("brain:investigate", {
    description: "Investigate a bug, risk, or open question",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      if (!args.trim()) {
        ctx.ui.notify("Usage: /brain:investigate <question>", "warning");
        return;
      }
      pi.sendUserMessage(`/skill:brain-investigate ${args.trim()}`);
    },
  });


  pi.registerCommand("brain:links", {
    description: "Derive and show the pi-brain link graph",
    handler: async (_args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const script = join(home.path, "tools", "brain-links.mjs");
      if (!(await pathExists(script))) {
        ctx.ui.notify("Link graph runner not found", "error");
        return;
      }
      const result = await execFilePromise("node", [script], { cwd: home.path });
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
      ctx.ui.notify(output || "Link graph finished.", result.code === 0 ? "success" : "error");
    },
  });


  pi.registerCommand("brain:groom", {
    description: "Groom the pi-brain corpus",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const message = args.trim() ? `/skill:brain-groom ${args.trim()}` : "/skill:brain-groom";
      pi.sendUserMessage(message);
    },
  });


  pi.registerCommand("brain:state", {
    description: "Regenerate state, roadmap, and options pages",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const script = join(home.path, "tools", "brain-state.mjs");
      if (!(await pathExists(script))) {
        ctx.ui.notify("State runner not found", "error");
        return;
      }
      const cmdArgs = args.trim() ? [script, args.trim()] : [script];
      const result = await execFilePromise("node", cmdArgs, { cwd: home.path });
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
      ctx.ui.notify(output || "State pages regenerated.", result.code === 0 ? "success" : "error");
    },
  });


  pi.registerCommand("brain:deepdive", {
    description: "Transiently read a target repo file/directory for shaping/investigation",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const [target, ...rest] = args.trim().split(/\s+/);
      if (!target) {
        ctx.ui.notify("Usage: /brain:deepdive <path> [question]", "error");
        return;
      }
      const question = rest.join(" ");
      const result = await pi.tools.brain_deepdive({ target, question });
      ctx.ui.notify(result.content[0].text.slice(0, 200), "success");
    },
  });


  pi.registerCommand("brain:ingest-repo", {
    description: "Onboard a repository as a maintained pi-brain project",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const [target, scope] = args.trim().split(/\s+/);
      if (!target) {
        ctx.ui.notify("Usage: /brain:ingest-repo <path-or-url> [scope]", "error");
        return;
      }
      const script = join(home.path, "tools", "brain-ingest-repo.mjs");
      if (!(await pathExists(script))) {
        ctx.ui.notify("Repo ingest runner not found", "error");
        return;
      }
      const cmdArgs = scope ? [script, target, scope] : [script, target];
      const result = await execFilePromise("node", cmdArgs, { cwd: home.path });
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
      ctx.ui.notify(output || "Repo ingested.", result.code === 0 ? "success" : "error");
    },
  });


  pi.registerCommand("brain:projects", {
    description: "List onboarded pi-brain projects",
    handler: async (_args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) return;
      const script = join(home.path, "tools", "brain-projects.mjs");
      if (!(await pathExists(script))) {
        ctx.ui.notify("Projects runner not found", "error");
        return;
      }
      const result = await execFilePromise("node", [script], { cwd: home.path });
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
      ctx.ui.notify(output || "No projects found.", result.code === 0 ? "success" : "error");
    },
  });


  pi.registerCommand("brain:convert", {
    description: "Convert the current repository into a pi-brain clone",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (home) {
        ctx.ui.notify("This directory already looks like a pi-brain home.", "error");
        return;
      }
      const script = join(ctx.cwd, "tools", "brain-convert.mjs");
      if (!(await pathExists(script))) {
        ctx.ui.notify("Convert runner not found", "error");
        return;
      }
      const tokens = args.trim().split(/\s+/).filter(Boolean);
      const dryRun = tokens.includes("--dry-run");
      const subdir = tokens.find((t) => t !== "--dry-run");
      const cmdArgs = [script];
      if (subdir) cmdArgs.push(subdir);
      if (dryRun) cmdArgs.push("--dry-run");
      const result = await execFilePromise("node", cmdArgs, { cwd: ctx.cwd });
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
      ctx.ui.notify(output || "Conversion complete.", result.code === 0 ? "success" : "error");
    },
  });

  // Session start widget
  pi.on("session_start", async (_event, ctx) => {
    await loadBriefing(ctx);
    const home = await requireBrain(ctx.cwd);
    if (home) {
      const state = await readAutonomy(home);
      if (state.enabled) {
        await autoGroom(home);
      }
    }
  });

  pi.on("session_tree", async (_event, ctx) => {
    await loadBriefing(ctx);
  });

  pi.on("before_agent_start", async (event, ctx) => {
    const home = await requireBrain(ctx.cwd);
    if (!home) return {};
    const state = await readAutonomy(home);
    if (!state.enabled) return {};

    let extra = AUTONOMY_PROMPT.replace("{BRAIN_HOME}", home.path);
    if (await readAutoConnect(home)) {
      extra += "\nauto_connect is enabled in brain.config.yml — run brain_pull_connectors opportunistically at session start if connectors are configured, but do not block user work for it.\n";
    }

    return {
      systemPrompt: event.systemPrompt + extra,
    };
  });
}
