import { readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import type { BrainHome } from "./types.ts";
import { pathExists, getMarkdownFiles, tokenize } from "./utils.ts";

export async function searchFiles(
  home: BrainHome,
  query: string
): Promise<Array<{ path: string; score: number; snippet: string }>> {
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
