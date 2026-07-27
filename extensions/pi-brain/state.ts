import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { BrainHome } from "./types.ts";
import { getMarkdownFiles, parseFrontmatter, extractSimpleYamlValue } from "./utils.ts";

export interface ActiveConstraint {
  title: string;
  globs: string[];
}

export async function loadActiveConstraints(home: BrainHome): Promise<ActiveConstraint[]> {
  const constraintsDir = join(home.path, "wiki");
  const files = await getMarkdownFiles(constraintsDir);
  const result: ActiveConstraint[] = [];
  for (const file of files) {
    if (!file.includes("/constraints/")) continue;
    const text = await readFile(file, "utf-8");
    const { valid, frontmatter, body } = parseFrontmatter(text);
    if (!valid) continue;
    const severity = extractSimpleYamlValue(frontmatter, "severity");
    const status = extractSimpleYamlValue(frontmatter, "status");
    if (severity !== "must" || status !== "active") continue;
    const title = body.split("\n")[0].replace(/^#+\s*/, "").trim();
    const globs: string[] = [];
    const globLines = frontmatter.split("\n");
    let inGlobs = false;
    for (const line of globLines) {
      if (line.startsWith("globs:")) {
        inGlobs = true;
        continue;
      }
      if (inGlobs) {
        const match = line.match(/^\s*-\s*"?(.+?)"?\s*$/);
        if (match) {
          globs.push(match[1]);
        } else if (!line.startsWith(" ") && !line.startsWith("-")) {
          inGlobs = false;
        }
      }
    }
    if (globs.length > 0) result.push({ title, globs });
  }
  return result;
}

export function matchGlob(path: string, glob: string): boolean {
  if (glob.includes("*")) {
    const regex = new RegExp(
      "^" + glob.replace(/\*\*/g, "<<<DOUBLESTAR>>>")
              .replace(/\*/g, "[^/]*")
              .replace(/<<<DOUBLESTAR>>>/g, ".*") + "$"
    );
    return regex.test(path);
  }
  return path === glob || path.startsWith(glob + "/");
}
