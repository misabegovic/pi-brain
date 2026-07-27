import type { BrainHome, CompactionHarvestConfig } from "./types.ts";
import { buildInboxEntry, replaceInboxItem, appendLog } from "./inbox.ts";

const SIGNAL_PATTERNS = [
  /\b(decided|decision|we agreed|we decided|let's|let us|we will|we should|we must|constraint|no-go|no go|rabbit hole|open question|todo|action item|conclusion|conclude|proposed|proposal)\b/gi,
  /\b(agreed that|decided that|concluded that|resolved that|established that)\b/gi,
];

const NOISE_PATTERNS = [
  /\b(hi|hello|hey|thanks|thank you|ok|okay|bye)\b/gi,
];

function scoreSnippet(text: string): number {
  let score = 0;
  for (const pattern of SIGNAL_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) score += matches.length;
  }
  for (const pattern of NOISE_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) score -= matches.length;
  }
  return score;
}

function extractSnippets(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && s.length < 400);
}

function normalizeKey(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export async function runCompactionHarvest(
  home: BrainHome,
  entries: any[],
  config: CompactionHarvestConfig
): Promise<{ harvested: number; skipped: number }> {
  if (!config.enabled) {
    return { harvested: 0, skipped: 0 };
  }

  const candidates: { snippet: string; score: number; source: string }[] = [];
  const seen = new Set<string>();
  let skipped = 0;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (entry.type !== "message") continue;

    const msg = entry.message;
    if (!msg) continue;

    const text = typeof msg.content === "string" ? msg.content : "";
    if (!text) continue;

    const role = msg.role ?? "unknown";
    const source = `msg-${i}-${role}`;

    for (const snippet of extractSnippets(text)) {
      const score = scoreSnippet(snippet);
      if (score < config.minScore) {
        skipped++;
        continue;
      }

      const key = normalizeKey(snippet);
      if (seen.has(key)) continue;
      seen.add(key);

      candidates.push({ snippet, score, source });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  const top = candidates.slice(0, config.maxItems);

  const date = new Date().toISOString().slice(0, 10);
  let harvested = 0;
  for (let i = 0; i < top.length; i++) {
    const { snippet, score, source } = top[i];
    const id = `compaction-harvest-${date}-${i + 1}`;
    const summary = `Compaction harvest (score ${score}, ${source}): ${snippet.slice(0, 120).replace(/\n/g, " ")}${snippet.length > 120 ? "..." : ""}`;
    const note = [
      `Compaction harvest (score: ${score}, source: ${source}):`,
      "",
      `> ${snippet.replace(/\n/g, " ")}`,
      "",
      "Review and either capture as a real inbox item or discard.",
    ].join("\n");

    const entry = buildInboxEntry(id, date, "harvest", summary) + note + "\n";
    await replaceInboxItem(home, id, entry);
    harvested++;
  }

  if (harvested > 0) {
    await appendLog(home, `compaction-harvest: extracted ${harvested} item(s), skipped ${skipped} low-signal snippet(s)`);
  }

  return { harvested, skipped };
}
