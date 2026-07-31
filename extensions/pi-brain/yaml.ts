/**
 * Minimal YAML helpers used across pi-brain.
 *
 * These are intentionally simple: we only read flat, string-valued keys from
 * brain.config.yml and frontmatter strings. For full YAML parsing use a proper
 * library.
 */

export function extractSimpleYamlValue(text: string, key: string): string | undefined {
  const match = text.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  return match?.[1].trim();
}
