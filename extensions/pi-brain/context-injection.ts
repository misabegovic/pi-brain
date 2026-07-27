import type { BrainHome, ContextInjectionConfig } from "./types.ts";
import { searchFiles } from "./search.ts";

export async function buildInjectedMessages(
  home: BrainHome,
  messages: any[],
  config: ContextInjectionConfig
): Promise<any[] | undefined> {
  if (!config.enabled) return undefined;

  const lastUser = [...messages].reverse().find((m: any) => m.role === "user");
  if (!lastUser) return undefined;

  const query = typeof lastUser.content === "string" ? lastUser.content : "";
  if (!query.trim()) return undefined;

  const results = await searchFiles(home, query);
  const relevant = results
    .filter((r) => r.path.includes("/records/") || r.path.includes("/constraints/"))
    .filter((r) => r.score >= config.minScore)
    .slice(0, config.maxRecords);

  if (relevant.length === 0) return undefined;

  const injection = {
    role: "user",
    content: [
      "Relevant brain context for this turn:",
      ...relevant.map((r) => `- ${r.path} (score ${r.score.toFixed(2)}): ${r.snippet}`),
      "",
      "Cite the source path when using this context.",
    ].join("\n"),
  };

  return [...messages, injection];
}
