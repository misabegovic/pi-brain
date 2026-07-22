#!/usr/bin/env node
/**
 * brain-links — derive the pi-brain link graph.
 *
 * Parses wiki/ markdown for:
 * - Markdown links: [text](path)
 * - Wiki-style links: [[path]] or [[text|path]]
 * - ## Related sections
 * - Frontmatter: related, supersedes, superseded_by, parent_epic
 *
 * Writes wiki/_state/links.json with:
 * - nodes (pages)
 * - edges (source -> target, with kind and provenance)
 * - orphans (no incoming edges)
 * - hubs (many incoming edges)
 * - dead_links (target does not resolve)
 * - suggestions (pages that share neighbors but aren't linked)
 *
 * Usage:
 *   node tools/brain-links.mjs
 */

import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { join, relative, dirname } from "node:path";

const CWD = import.meta.dirname ? dirname(import.meta.dirname) : process.cwd();
const WIKI_DIR = join(CWD, "wiki");
const STATE_DIR = join(WIKI_DIR, "_state");

async function getMarkdownFiles(dir) {
  const result = [];
  async function walk(current) {
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join(current, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "_state") {
        await walk(full);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        result.push(full);
      }
    }
  }
  await walk(dir);
  return result;
}

function parseFrontmatter(text) {
  const trimmed = text.trim();
  if (!trimmed.startsWith("---")) return { valid: false, frontmatter: "", body: trimmed };
  const end = trimmed.indexOf("---", 3);
  if (end === -1) return { valid: false, frontmatter: "", body: trimmed };
  return {
    valid: true,
    frontmatter: trimmed.slice(3, end).trim(),
    body: trimmed.slice(end + 3).trim(),
  };
}

function getYamlList(text, key) {
  const regex = new RegExp(`^${key}:\\s*$`, "m");
  const inline = text.match(new RegExp(`^${key}:\\s*\\[(.*?)\\]`, "m"));
  if (inline) {
    return inline[1].split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
  }
  const lines = text.split("\n");
  const result = [];
  let inList = false;
  for (const line of lines) {
    if (line.match(regex)) {
      inList = true;
      continue;
    }
    if (inList) {
      if (line.match(/^\s*-/)) {
        result.push(line.replace(/^\s*-\s*/, "").trim().replace(/^["']|["']$/g, ""));
      } else if (line.trim() !== "" && !line.match(/^\s/)) {
        break;
      }
    }
  }
  return result;
}

function getYamlValue(text, key) {
  const match = text.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  return match?.[1].trim().replace(/^["']|["']$/g, "");
}

function extractLinks(body, fileDir) {
  const links = new Map();

  const mdLinkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
  let m;
  while ((m = mdLinkRegex.exec(body)) !== null) {
    const target = resolveLink(m[2], fileDir);
    if (target) links.set(target, { kind: "markdown", context: m[1].slice(0, 60) });
  }

  const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
  while ((m = wikiLinkRegex.exec(body)) !== null) {
    const target = resolveLink(m[1].split("|").pop()?.trim() ?? m[1], fileDir);
    if (target) links.set(target, { kind: "wiki", context: m[1].slice(0, 60) });
  }

  const relatedSection = body.match(/## Related([\s\S]*?)(?=^## |\Z)/m);
  if (relatedSection) {
    const section = relatedSection[1];
    const sectionMdLinks = [...section.matchAll(mdLinkRegex)];
    const sectionWikiLinks = [...section.matchAll(wikiLinkRegex)];
    for (const lm of [...sectionMdLinks, ...sectionWikiLinks]) {
      const raw = lm[2] ?? lm[1].split("|").pop()?.trim();
      const target = resolveLink(raw, fileDir);
      if (target) links.set(target, { kind: "related", context: "Related section" });
    }
  }

  return links;
}

function resolveLink(raw, fileDir) {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return null;
  if (trimmed.startsWith("#")) return null;
  if (trimmed.startsWith("mailto:")) return null;
  return trimmed.replace(/\.md$/, "");
}

function targetExists(target, pagePaths) {
  const candidates = [target, target + ".md", join(target, "index.md")];
  return candidates.some((c) => pagePaths.has(c.replace(/\\/g, "/")));
}

function normalizePagePath(file, wikiDir) {
  const rel = relative(wikiDir, file);
  return rel.replace(/\.md$/, "").replace(/\\/g, "/");
}

async function main() {
  const files = await getMarkdownFiles(WIKI_DIR);
  if (files.length === 0) {
    console.log("No wiki pages found.");
    return;
  }

  const pagePaths = new Set(files.map((f) => normalizePagePath(f, WIKI_DIR)));
  const nodes = [];
  const edges = [];

  for (const file of files) {
    const rel = normalizePagePath(file, WIKI_DIR);
    const text = await readFile(file, "utf-8");
    const { valid, frontmatter, body } = parseFrontmatter(text);

    const node = {
      path: rel + ".md",
      kind: valid ? getYamlValue(frontmatter, "kind") || "unknown" : "unknown",
      status: valid ? getYamlValue(frontmatter, "status") || "" : "",
      confidence: valid ? getYamlValue(frontmatter, "confidence") || "" : "",
      title: body.split("\n")[0].replace(/^#+\s*/, "").trim(),
    };
    nodes.push(node);

    if (valid) {
      for (const key of ["related", "supersedes", "superseded_by", "parent_epic"]) {
        const values = key === "related" ? getYamlList(frontmatter, key) : [getYamlValue(frontmatter, key)].filter((v) => Boolean(v));
        for (const value of values) {
          edges.push({
            source: rel,
            target: value,
            kind: key,
            provenance: "frontmatter",
          });
        }
      }
    }

    const links = extractLinks(body, dirname(file));
    for (const [target, meta] of links) {
      edges.push({
        source: rel,
        target,
        kind: meta.kind,
        provenance: "body",
        context: meta.context,
      });
    }
  }

  const incomingCounts = new Map();
  for (const edge of edges) {
    incomingCounts.set(edge.target, (incomingCounts.get(edge.target) ?? 0) + 1);
  }

  const orphans = nodes.filter((n) => !incomingCounts.has(n.path.replace(/\.md$/, "")));

  const hubs = nodes
    .map((n) => ({ node: n, count: incomingCounts.get(n.path.replace(/\.md$/, "")) ?? 0 }))
    .filter((x) => x.count >= 3)
    .sort((a, b) => b.count - a.count);

  const deadLinks = edges.filter((e) => !targetExists(e.target, pagePaths));

  const adjacency = new Map();
  for (const edge of edges) {
    if (!adjacency.has(edge.source)) adjacency.set(edge.source, new Set());
    adjacency.get(edge.source).add(edge.target);
  }
  const suggestions = [];
  const sources = Array.from(adjacency.keys());
  for (let i = 0; i < sources.length; i++) {
    for (let j = i + 1; j < sources.length; j++) {
      const a = sources[i];
      const b = sources[j];
      const shared = [...adjacency.get(a)].filter((x) => adjacency.get(b).has(x));
      if (shared.length >= 2 && !adjacency.get(a)?.has(b) && !adjacency.get(b)?.has(a)) {
        suggestions.push({ source: a, target: b, via: shared });
      }
    }
  }

  const report = {
    generated_at: new Date().toISOString(),
    node_count: nodes.length,
    edge_count: edges.length,
    nodes,
    edges,
    orphans: orphans.map((n) => n.path),
    hubs: hubs.map((h) => ({ path: h.node.path, incoming: h.count })),
    dead_links: deadLinks,
    suggestions: suggestions.slice(0, 20),
  };

  await mkdir(STATE_DIR, { recursive: true });
  await writeFile(join(STATE_DIR, "links.json"), JSON.stringify(report, null, 2), "utf-8");

  console.log(`Link graph: ${nodes.length} nodes, ${edges.length} edges`);
  console.log(`Orphans: ${orphans.length}, Hubs: ${hubs.length}, Dead links: ${deadLinks.length}, Suggestions: ${suggestions.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
