import { readdir, access, constants } from "node:fs/promises";
import { join, relative } from "node:path";
import { execFile } from "node:child_process";
import type { BrainHome } from "./types.ts";

export function execFilePromise(
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

export async function pathExists(p: string): Promise<boolean> {
  try {
    await access(p, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function getMarkdownFiles(dir: string): Promise<string[]> {
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

export function parseFrontmatter(text: string): { frontmatter: string; body: string; valid: boolean } {
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

export { extractSimpleYamlValue } from "./yaml.ts";

export const STOP_WORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "had", "her", "was", "one", "our", "out", "day", "get", "has", "him", "his", "how", "its", "may", "new", "now", "old", "see", "two", "who", "boy", "did", "she", "use", "her", "way", "many", "oil", "sit", "set", "run", "eat", "far", "sea", "eye", "ago", "off", "too", "any", "say", "man", "try", "ask", "end", "why", "let", "put", "say", "she", "try", "way", "own", "say", "too", "old", "tell", "very", "when", "much", "would", "there", "their", "what", "said", "each", "which", "will", "about", "could", "other", "after", "first", "never", "these", "think", "where", "being", "every", "great", "might", "shall", "still", "those", "while", "this", "that", "with", "from", "they", "have", "were", "been", "than", "them", "into", "just", "like", "over", "also", "back", "only", "know", "take", "year", "good", "some", "come", "make", "well", "time", "here", "look", "down", "most", "long", "find", "give", "does", "made", "part", "such", "keep", "call", "came", "need", "feel", "seem", "turn", "hand", "high", "sure", "upon", "head", "help", "home", "side", "move", "both", "five", "once", "same", "must", "name", "left", "each", "done", "open", "case", "show", "live", "play", "went", "told", "seen", "heard", "talk", "soon", "read", "stop", "face", "fact", "land", "line", "kind", "next", "word", "came", "went", "told", "seen", "heard", "talk", "soon", "read", "stop", "face", "fact", "land", "line", "kind", "next", "word",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
}

export function countInboxItems(inbox: string): number {
  return (inbox.match(/^### /gm) ?? []).length;
}

export function listInboxItems(inbox: string, limit = 3): Array<{ id: string; summary: string }> {
  const items: Array<{ id: string; summary: string }> = [];
  const lines = inbox.split("\n");
  let current: { id: string; summary: string } | null = null;
  for (const line of lines) {
    const header = line.match(/^###\s+(\S+)\s+\((\d{4}-\d{2}-\d{2})\)/);
    if (header) {
      if (current) items.push(current);
      current = { id: header[1], summary: "" };
    } else if (current && line.trim().startsWith("- **summary:**")) {
      current.summary = line.replace(/^\s*[-]\s+\*\*summary:\*\*\s*/, "").trim();
    }
  }
  if (current) items.push(current);
  return items.slice(-limit).reverse();
}

export const TEXT_EXTENSIONS = new Set([
  ".md", ".txt", ".py", ".ts", ".js", ".mjs", ".cjs", ".json", ".yml", ".yaml",
  ".toml", ".rs", ".go", ".rb", ".java", ".kt", ".swift", ".c", ".cpp", ".h",
  ".css", ".scss", ".html", ".xml", ".sh", ".bash", ".zsh", ".fish", ".sql",
]);

export function isTextFile(name: string): boolean {
  const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
  return TEXT_EXTENSIONS.has(ext);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 64);
}

export function relativeToHome(home: BrainHome, file: string): string {
  return relative(home.path, file);
}

export function isValidIdentifier(value: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(value);
}
