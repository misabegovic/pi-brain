import { readFile, writeFile, readdir, mkdir, unlink, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import type { BrainHome, AutoIngestBatch, AutoIngestBatchEntry } from "./types.ts";
import { pathExists, isTextFile, slugify } from "./utils.ts";
import { readInbox } from "./brain-home.ts";

export function buildInboxEntry(id: string, date: string, kind: string, summary: string): string {
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

export async function appendInboxItem(home: BrainHome, title: string, note: string) {
  const id = slugify(title);
  const date = new Date().toISOString().slice(0, 10);
  const entry = buildInboxEntry(id, date, "ingest", note);
  const inboxPath = join(home.path, "wiki", "_state", "inbox.md");
  const current = await readInbox(home);
  await writeFile(inboxPath, current.trimEnd() + entry + "\n", "utf-8");
}

export async function replaceInboxItem(home: BrainHome, id: string, newEntry: string) {
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

const AUTO_INGEST_BATCH_PATH = ["wiki", "_state", "auto-ingest-batch.json"];

export async function readAutoIngestBatch(home: BrainHome): Promise<AutoIngestBatch> {
  try {
    const text = await readFile(join(home.path, ...AUTO_INGEST_BATCH_PATH), "utf-8");
    return JSON.parse(text) as AutoIngestBatch;
  } catch {
    return { entries: [], createdAt: new Date().toISOString().slice(0, 10) };
  }
}

export async function writeAutoIngestBatch(home: BrainHome, batch: AutoIngestBatch) {
  await mkdir(join(home.path, "wiki", "_state"), { recursive: true });
  await writeFile(join(home.path, ...AUTO_INGEST_BATCH_PATH), JSON.stringify(batch, null, 2), "utf-8");
}

export async function appendAutoIngestBatch(home: BrainHome, source: string, targetPath: string) {
  const batch = await readAutoIngestBatch(home);
  batch.entries.push({ source, targetPath: relative(home.path, targetPath), date: new Date().toISOString().slice(0, 10) });
  await writeAutoIngestBatch(home, batch);
  await flushAutoIngestInboxItem(home, batch);
}

export async function flushAutoIngestInboxItem(home: BrainHome, batch: AutoIngestBatch) {
  const id = "auto-ingest-batch";
  const date = batch.createdAt;
  const summary = `Auto-ingested ${batch.entries.length} source(s). Review at ${AUTO_INGEST_BATCH_PATH.join("/")}. Run /brain:tend to synthesize, or /brain:groom to archive if stale.`;
  const entry = buildInboxEntry(id, date, "auto-ingest", summary);
  await replaceInboxItem(home, id, entry);
}

export async function clearAutoIngestBatch(home: BrainHome) {
  try {
    await unlink(join(home.path, ...AUTO_INGEST_BATCH_PATH));
  } catch {
    // ignore if missing
  }
}

const AUTO_INGEST_TTL_DAYS = 7;

function daysAgo(dateStr: string): number {
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

export async function appendLog(home: BrainHome, line: string) {
  const logPath = join(home.path, "log", "log.md");
  const current = await readFile(logPath, "utf-8").catch(() => "# Log\n\n");
  const date = new Date().toISOString().slice(0, 10);
  await writeFile(logPath, current.trimEnd() + `\n- ${date}: ${line}\n`, "utf-8");
}

export async function autoGroom(home: BrainHome) {
  const batch = await readAutoIngestBatch(home);
  if (batch.entries.length > 0 && daysAgo(batch.createdAt) >= AUTO_INGEST_TTL_DAYS) {
    await replaceInboxItem(home, "auto-ingest-batch", buildInboxEntry("auto-ingest-batch", batch.createdAt, "auto-ingest", "[archived] Stale auto-ingest batch archived by auto-groom."));
    await clearAutoIngestBatch(home);
    await appendLog(home, `auto-groom archived stale auto-ingest batch from ${batch.createdAt} (${batch.entries.length} entries)`);
  }
}

export async function ingestFile(
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

export async function ingestDirectory(
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
          if (content.length > 100_000) continue;
          if (totalSize + content.length > maxSize) continue;
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

export async function ingestUrl(
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
