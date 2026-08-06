/**
 * frontmatter — the one YAML-frontmatter reading contract for tools/*.mjs.
 *
 * Five tools each carried their own copy of these helpers, and two of the
 * copies disagreed (quote-stripping, null-vs-object returns) — the same
 * fragmentation that let the extension's flat-dotted config reader and a
 * nested-YAML test helper coexist unnoticed. One copy, two read shapes:
 *
 *   parseFrontmatter  — trimmed {valid, frontmatter, body} for readers.
 *   splitFrontmatter  — structure-preserving {frontmatter, rest} | null for
 *                       tools that rewrite the file byte-stably.
 */

export function parseFrontmatter(text) {
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

export function splitFrontmatter(text) {
  const trimmed = text.trimStart();
  if (!trimmed.startsWith("---")) return null;
  const end = trimmed.indexOf("\n---", 3);
  if (end === -1) return null;
  return {
    frontmatter: trimmed.slice(4, end),
    rest: trimmed.slice(end + 4).replace(/^\n/, ""),
  };
}

export function getYamlValue(text, key) {
  const match = text.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  return match?.[1].trim().replace(/^["']|["']$/g, "");
}

export function getYamlList(text, key) {
  const inline = text.match(new RegExp(`^${key}:\\s*\\[(.*?)\\]`, "m"));
  if (inline) {
    return inline[1].split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
  }
  const lines = text.split("\n");
  const result = [];
  let inList = false;
  for (const line of lines) {
    if (line.match(new RegExp(`^${key}:\\s*$`))) {
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
