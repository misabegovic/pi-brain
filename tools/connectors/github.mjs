#!/usr/bin/env node
/**
 * GitHub connector for pi-brain.
 *
 * Pulls public metadata for configured repos and writes an immutable
 * snapshot to sources/github/YYYY-MM-DD--<owner>-<repo>.md.
 *
 * Usage:
 *   node tools/connectors/github.mjs [owner/repo ...]
 *
 * Configuration:
 *   - repos listed in brain.config.yml under connectors.github.repos
 *   - active_repos are also covered automatically
 *   - GITHUB_TOKEN in .env (optional, raises rate limits)
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const CWD = process.cwd();

async function loadEnv() {
  try {
    const text = await readFile(join(CWD, ".env"), "utf-8");
    for (const line of text.split("\n")) {
      const match = line.match(/^([A-Z_]+)="(.*)"$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2];
      }
    }
  } catch {
    // no .env is fine
  }
}

function getYamlValue(text, key) {
  const match = text.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  return match?.[1].trim();
}

function parseYamlList(text, key) {
  const lines = text.split("\n");
  const result = [];
  let inList = false;
  for (const line of lines) {
    if (line.startsWith(`${key}:`)) {
      inList = true;
      continue;
    }
    if (inList) {
      if (line.match(/^\\s*-/)) {
        result.push(line.replace(/^\\s*-\\s*/, "").trim());
      } else if (line.trim() === "" || line.match(/^\\w/)) {
        break;
      }
    }
  }
  return result;
}

async function fetchJson(url, token) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "pi-brain-connector",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

async function snapshotRepo(owner, repo, token) {
  const [repoData, readmeData, treeData] = await Promise.all([
    fetchJson(`https://api.github.com/repos/${owner}/${repo}`, token).catch(() => null),
    fetchJson(`https://api.github.com/repos/${owner}/${repo}/readme`, token).catch(() => null),
    fetchJson(`https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`, token).catch(() => null),
  ]);

  if (!repoData) {
    throw new Error(`Could not fetch ${owner}/${repo}`);
  }

  const date = new Date().toISOString().slice(0, 10);
  const targetDir = join(CWD, "sources", "github");
  await mkdir(targetDir, { recursive: true });
  const targetPath = join(targetDir, `${date}--${owner}-${repo}.md`);

  const treeLines = treeData?.tree
    ? treeData.tree
        .filter((item) => item.type === "blob")
        .map((item) => `  ${item.path}`)
        .slice(0, 200)
    : [];

  const readmeContent = readmeData?.content
    ? Buffer.from(readmeData.content, "base64").toString("utf-8").slice(0, 10_000)
    : "README not available or too large.";

  const lines = [
    "---",
    "kind: source",
    "source_kind: github",
    `source_url: https://github.com/${owner}/${repo}`,
    `ingested_at: ${date}`,
    `owner: ${owner}`,
    `repo: ${repo}`,
    "---",
    "",
    `# ${owner}/${repo}`,
    "",
    `> ${repoData.description || "No description"}`,
    "",
    "## Metadata",
    "",
    `- **default branch:** ${repoData.default_branch}`,
    `- **language:** ${repoData.language || "unknown"}`,
    `- **stars:** ${repoData.stargazers_count}`,
    `- **forks:** ${repoData.forks_count}`,
    `- **open issues:** ${repoData.open_issues_count}`,
    `- **updated:** ${repoData.updated_at}`,
    "",
    "## README",
    "",
    "```markdown",
    readmeContent,
    "```",
    "",
  ];

  if (treeLines.length > 0) {
    lines.push("## File tree", "", "```", ...treeLines, "```", "");
  }

  await writeFile(targetPath, lines.join("\n"), "utf-8");
  return targetPath;
}

async function main() {
  await loadEnv();
  const token = process.env.GITHUB_TOKEN || "";

  const configText = await readFile(join(CWD, "brain.config.yml"), "utf-8");
  const activeRepos = parseYamlList(configText, "active_repos");
  const extraRepos = parseYamlList(configText, "connectors")
    .flatMap((line) => parseYamlList(configText, "repos"));

  const repoSet = new Set([
    ...activeRepos,
    ...extraRepos,
    ...process.argv.slice(2),
  ]);

  if (repoSet.size === 0) {
    console.log("No GitHub repos configured. Add them to active_repos or connectors.github.repos in brain.config.yml.");
    return;
  }

  const results = [];
  for (const slug of repoSet) {
    const [owner, repo] = slug.split("/");
    if (!owner || !repo) {
      console.error(`Skipping invalid repo slug: ${slug}`);
      continue;
    }
    try {
      const path = await snapshotRepo(owner, repo, token);
      console.log(`✓ ${owner}/${repo} → ${path}`);
      results.push({ slug, path });
    } catch (err) {
      console.error(`✗ ${owner}/${repo}: ${err.message}`);
    }
  }

  if (results.length === 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
