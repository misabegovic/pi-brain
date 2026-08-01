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
import { join, dirname } from "node:path";
import { resolveHome } from "../lib/resolve-home.mjs";

// Package-dir fallback for a connector script is dirname(tools/), so pass
// dirname(import.meta.dirname) (= tools/) and let resolveHome take its parent.
const CWD = resolveHome(import.meta.dirname ? dirname(import.meta.dirname) : undefined);

async function loadEnv() {
  try {
    const text = await readFile(join(CWD, ".env"), "utf-8");
    for (const line of text.split("\n")) {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // no .env is fine
  }
}

export function getYamlValue(text, key) {
  const match = text.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  return match?.[1].trim();
}

export function parseYamlList(text, key) {
  const lines = text.split("\n");
  const result = [];
  let inList = false;
  let keyIndent = 0;
  for (const line of lines) {
    const keyMatch = line.match(/^(\s*)([A-Za-z_]+):\s*$/);
    if (!inList && keyMatch && keyMatch[2] === key) {
      inList = true;
      keyIndent = keyMatch[1].length;
      continue;
    }
    if (inList) {
      const itemMatch = line.match(/^(\s*)-\s*(.*)$/);
      if (itemMatch && itemMatch[2] && itemMatch[1].length >= keyIndent) {
        result.push(itemMatch[2].trim());
      } else if (line.trim() === "" || line.trim().startsWith("#")) {
        continue;
      } else {
        break;
      }
    }
  }
  return result;
}

/**
 * Parse a list nested inside a section, e.g. connectors.github.repos:
 *   parseYamlSectionList(config, "github", "repos")
 * The section key may itself be nested; only its direct block is scanned.
 */
export function parseYamlSectionList(text, section, key) {
  const lines = text.split("\n");
  const sectionLines = [];
  let sectionIndent = -1;
  for (const line of lines) {
    if (sectionIndent === -1) {
      const match = line.match(/^(\s*)([A-Za-z_]+):\s*$/);
      if (match && match[2] === section) {
        sectionIndent = match[1].length;
      }
      continue;
    }
    const indent = line.match(/^(\s*)/)[1].length;
    if (line.trim() !== "" && indent <= sectionIndent) {
      break;
    }
    sectionLines.push(line);
  }
  return parseYamlList(sectionLines.join("\n"), key);
}

/**
 * Collect repo slugs from brain.config.yml: active_repos (bare names get
 * the org as owner) plus connectors.github.repos, merged with argv slugs.
 */
export function collectRepoSlugs(configText, argvSlugs = []) {
  const org = getYamlValue(configText, "org")?.replace(/^["']|["']$/g, "") || "";
  const activeRepos = parseYamlList(configText, "active_repos").map((r) =>
    r.includes("/") || !org ? r : `${org}/${r}`
  );
  const extraRepos = parseYamlSectionList(configText, "github", "repos");
  return [...new Set([...activeRepos, ...extraRepos, ...argvSlugs])];
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
  const repoSet = collectRepoSlugs(configText, process.argv.slice(2));

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

if (process.argv[1] && import.meta.url === new URL(process.argv[1], "file://").href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
