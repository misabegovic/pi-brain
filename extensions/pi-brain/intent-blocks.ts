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

  function parseObject(indent: number): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    while (i < lines.length) {
      const line = lines[i];
      if (line.trim() === "" || line.length < indent) return obj;
      if (line[indent] !== " ") return obj;
      const content = line.slice(indent);
      if (content.startsWith("- ")) return obj;
      const colonIndex = content.indexOf(":");
      if (colonIndex === -1) { i++; continue; }
      const key = content.slice(0, colonIndex).trim();
      const rest = content.slice(colonIndex + 1).trim();
      i++;
      if (rest === "") {
        // Could be nested object or list
        if (i < lines.length) {
          const nextLine = lines[i];
          if (nextLine.length > indent && nextLine[indent] === " " && nextLine.slice(indent).startsWith("- ")) {
            obj[key] = parseList(indent + 2);
          } else if (nextLine.length > indent && nextLine[indent] === " ") {
            obj[key] = parseObject(indent + 2);
          } else {
            obj[key] = "";
          }
        } else {
          obj[key] = "";
        }
      } else {
        obj[key] = parseValue(rest);
      }
    }
    return obj;
  }

  function parseList(indent: number): Array<Record<string, unknown> | string> {
    const list: Array<Record<string, unknown> | string> = [];
    while (i < lines.length) {
      const line = lines[i];
      if (line.trim() === "" || line.length < indent) return list;
      if (line[indent] !== " ") return list;
      const content = line.slice(indent);
      if (!content.startsWith("- ")) return list;
      const item = content.slice(2).trim();
      i++;
      if (item === "") {
        // Nested object follows
        list.push(parseObject(indent + 2));
      } else if (item.includes(":")) {
        // Inline key: value plus possible nested keys
        const colonIndex = item.indexOf(":");
        const key = item.slice(0, colonIndex).trim();
        const rest = item.slice(colonIndex + 1).trim();
        const obj: Record<string, unknown> = {};
        if (rest === "") {
          obj[key] = parseObject(indent + 2);
        } else {
          obj[key] = parseValue(rest);
        }
        // Merge any following indented keys
        const start = i;
        const nested = parseObject(indent + 2);
        if (i > start) {
          Object.assign(obj, nested);
        }
        list.push(obj);
      } else {
        list.push(parseValue(item));
      }
    }
    return list;
  }

  const result = parseObject(0);
  return result;
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
