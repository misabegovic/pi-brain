import * as fs from "node:fs";
import * as path from "node:path";
import type { BrainHome } from "./types.ts";
import { getMarkdownFiles } from "./utils.ts";

export type IntentBlockType = "data_model" | "api_surface" | "behavior" | "invariant";

export interface IntentBlock {
  type: IntentBlockType;
  name: string;
  source: string; // relative path from brain home
  data: unknown;
}

const BLOCK_FENCE_RE = /^```intent:([a-z_]+):([a-z_][a-z0-9_-]*)\s*$/im;
const BLOCK_END_RE = /^```\s*$/m;

function parseYamlLike(text: string): unknown {
  // Minimal YAML subset parser for intent blocks.
  // Supports:
  //   key: value
  //   list:
  //     - key: value
  //       key2: value2
  // Values are strings, numbers, or booleans.
  const lines = text.split("\n");
  let i = 0;

  function peekNonBlank(start: number): { line: string; index: number } | null {
    for (let j = start; j < lines.length; j++) {
      if (lines[j].trim() !== "") return { line: lines[j], index: j };
    }
    return null;
  }

  function leadingSpaces(line: string): number {
    let count = 0;
    while (count < line.length && line[count] === " ") count++;
    return count;
  }

  function parseValue(raw: string): string | number | boolean {
    const trimmed = raw.trim();
    if (trimmed === "true") return true;
    if (trimmed === "false") return false;
    if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed, 10);
    if (/^-?\d+\.\d+$/.test(trimmed)) return parseFloat(trimmed);
    // Strip optional quotes
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      return trimmed.slice(1, -1);
    }
    return trimmed;
  }

  function parseScalarOrCollection(parentIndent: number): unknown {
    const next = peekNonBlank(i);
    if (!next) return "";
    const childIndent = leadingSpaces(next.line);
    if (childIndent <= parentIndent) return "";
    if (next.line.slice(childIndent).startsWith("- ")) {
      return parseList(childIndent);
    }
    return parseObject(childIndent);
  }

  function parseObject(indent: number): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    while (i < lines.length) {
      const line = lines[i];
      if (line.trim() === "") { i++; continue; }
      const lineIndent = leadingSpaces(line);
      if (lineIndent < indent) return obj;
      if (lineIndent > indent) { i++; continue; }
      const content = line.slice(indent);
      if (content.startsWith("- ")) return obj;
      const colonIndex = content.indexOf(":");
      if (colonIndex === -1) { i++; continue; }
      const key = content.slice(0, colonIndex).trim();
      const rest = content.slice(colonIndex + 1).trim();
      i++;
      if (rest === "") {
        obj[key] = parseScalarOrCollection(indent);
      } else {
        obj[key] = parseValue(rest);
      }
    }
    return obj;
  }

  function parseList(indent: number): Array<Record<string, unknown> | string | number | boolean> {
    const list: Array<Record<string, unknown> | string | number | boolean> = [];
    while (i < lines.length) {
      const line = lines[i];
      if (line.trim() === "") { i++; continue; }
      const lineIndent = leadingSpaces(line);
      if (lineIndent < indent) return list;
      if (lineIndent > indent) { i++; continue; }
      const content = line.slice(indent);
      if (!content.startsWith("- ")) return list;
      const item = content.slice(2).trim();
      i++;
      if (item === "") {
        list.push(parseObject(indent + 2));
      } else if (item.includes(":")) {
        const colonIndex = item.indexOf(":");
        const key = item.slice(0, colonIndex).trim();
        const rest = item.slice(colonIndex + 1).trim();
        const obj: Record<string, unknown> = {};
        if (rest === "") {
          obj[key] = parseScalarOrCollection(indent);
        } else {
          obj[key] = parseValue(rest);
        }
        // Merge any following sibling keys indented under the same list item.
        const childIndent = indent + 2;
        while (i < lines.length) {
          const next = lines[i];
          if (next.trim() === "") { i++; continue; }
          const nextIndent = leadingSpaces(next);
          if (nextIndent < childIndent) break;
          if (nextIndent === childIndent && next.slice(childIndent).startsWith("- ")) break;
          // Consume one nested key/object group.
          const before = i;
          const nested = parseObject(childIndent);
          if (i > before) Object.assign(obj, nested);
          break;
        }
        list.push(obj);
      } else {
        list.push(parseValue(item));
      }
    }
    return list;
  }

  const first = peekNonBlank(0);
  if (!first) return {};
  const firstIndent = leadingSpaces(first.line);
  if (first.line.slice(firstIndent).startsWith("- ")) {
    return parseList(firstIndent);
  }
  return parseObject(firstIndent);
}

export function extractBlocks(text: string, source: string): IntentBlock[] {
  const blocks: IntentBlock[] = [];
  const lines = text.split("\n");
  let i = 0;

  while (i < lines.length) {
    const match = BLOCK_FENCE_RE.exec(lines[i]);
    if (!match) { i++; continue; }
    const type = match[1] as IntentBlockType;
    const name = match[2];
    i++;
    const start = i;
    while (i < lines.length && !BLOCK_END_RE.test(lines[i])) i++;
    const blockText = lines.slice(start, i).join("\n");
    i++;

    try {
      const data = parseYamlLike(blockText);
      blocks.push({ type, name, source, data });
    } catch {
      // Skip malformed blocks
    }
  }

  return blocks;
}

export async function collectBlocks(
  home: BrainHome,
  scope: string,
  types?: IntentBlockType[],
): Promise<IntentBlock[]> {
  const scopeDir = path.join(home.path, "wiki", scope);
  if (!fs.existsSync(scopeDir)) return [];

  const files = await getMarkdownFiles(scopeDir);
  const blocks: IntentBlock[] = [];

  for (const file of files) {
    const rel = path.relative(home.path, file);
    // Only approved shelves for now
    if (!/\/(prds|adrs|bets|records)\//.test(rel)) continue;
    const text = await fs.promises.readFile(file, "utf-8");
    const fileBlocks = extractBlocks(text, rel);
    for (const block of fileBlocks) {
      if (!types || types.includes(block.type)) {
        blocks.push(block);
      }
    }
  }

  return blocks;
}
