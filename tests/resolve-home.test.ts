/**
 * Resolve-home regression tests (ADR: env-first brain-home resolution).
 *
 * The bug class is silent failure: tools read the npm package's pristine
 * brain.config.yml instead of the clone's, and the GitHub connector parsed
 * zero repos from a populated config. These tests run the real scripts
 * against a fixture clone and assert the clone's config is the one read.
 */

// @ts-ignore .mjs tool has no declaration file
import { resolveHome } from "../tools/lib/resolve-home.mjs";
// @ts-ignore .mjs tool has no declaration file
import { collectRepoSlugs, parseYamlList, parseYamlSectionList } from "../tools/connectors/github.mjs";
import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";

const PACKAGE_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

function execFilePromise(
  file: string,
  args: string[],
  options: { cwd?: string; env?: NodeJS.ProcessEnv } = {}
): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    const child = execFile(file, args, { maxBuffer: 8 * 1024 * 1024, ...options });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (d) => (stdout += String(d)));
    child.stderr?.on("data", (d) => (stderr += String(d)));
    child.on("error", reject);
    child.on("close", (code) => resolve({ stdout, stderr, code: code ?? 0 }));
  });
}

function assert(cond: unknown, message: string): asserts cond {
  if (!cond) throw new Error(message);
}

async function main() {
  // 1. resolveHome precedence: PI_BRAIN_HOME > cwd > package-dir fallback
  const prevEnv = process.env.PI_BRAIN_HOME;
  try {
    process.env.PI_BRAIN_HOME = "/tmp/env-home";
    assert(resolveHome("/pkg/tools") === "/tmp/env-home", "env var must win");
    delete process.env.PI_BRAIN_HOME;
    assert(resolveHome("/pkg/tools") === process.cwd(), "cwd must win when no env");
    const origCwd = process.cwd();
    process.chdir("/"); // make cwd differ from package root
    assert(resolveHome("/pkg/tools") === "/", "cwd is honored even outside the package");
    process.chdir(origCwd);
  } finally {
    if (prevEnv === undefined) delete process.env.PI_BRAIN_HOME;
    else process.env.PI_BRAIN_HOME = prevEnv;
  }
  console.log("✓ resolveHome honors PI_BRAIN_HOME > cwd > fallback");

  // 2. Fixture clone: brain-projects must read the fixture's config even
  //    though the script file lives in the package (whose config is empty).
  const fixture = await mkdtemp(join(tmpdir(), "pi-brain-home-test-"));
  try {
    await mkdir(join(fixture, "wiki", "fixture-repo"), { recursive: true });
    await writeFile(
      join(fixture, "brain.config.yml"),
      'org: "fixture-org"\nactive_repos:\n  - fixture-repo\n',
      "utf-8"
    );
    await writeFile(
      join(fixture, "wiki", "fixture-repo", "index.md"),
      "---\nstatus: active\nconfidence: high\n---\n\n# Fixture Repo\n",
      "utf-8"
    );

    const script = join(PACKAGE_ROOT, "tools", "brain-projects.mjs");

    // 2a. cwd only (extension passes cwd: home.path)
    let result = await execFilePromise("node", [script], { cwd: fixture });
    assert(
      result.stdout.includes("fixture-repo"),
      `cwd run should list fixture-repo, got: ${result.stdout}`
    );
    assert(!result.stdout.includes("No active projects"), "must not fall back to package config");

    // 2b. env only, cwd somewhere else entirely
    result = await execFilePromise("node", [script], {
      cwd: "/",
      env: { ...process.env, PI_BRAIN_HOME: fixture },
    });
    assert(
      result.stdout.includes("fixture-repo"),
      `env run should list fixture-repo, got: ${result.stdout}`
    );
    console.log("✓ brain-projects reads the clone config via cwd and via PI_BRAIN_HOME");
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }

  // 3. Connector YAML parsing: regression for the double-escaped regex and
  //    the nested connectors.github.repos list.
  const config = [
    'org: "my-org"',
    "active_repos:",
    "  - alpha", // bare name → my-org/alpha
    "  - other/beta",
    "",
    "connectors:",
    "  github:",
    "    repos:",
    "      - my-org/gamma",
    "  rss:",
    "    feeds: []",
    "",
  ].join("\n");

  const slugs = collectRepoSlugs(config, ["extra/delta"]);
  assert(slugs.includes("my-org/alpha"), `bare active_repos name must get org prefix, got ${slugs}`);
  assert(slugs.includes("other/beta"), "qualified active_repos pass through");
  assert(slugs.includes("my-org/gamma"), `nested connectors.github.repos must be parsed, got ${slugs}`);
  assert(slugs.includes("extra/delta"), "argv slugs pass through");
  assert(slugs.length === 4, `expected 4 unique slugs, got ${slugs.length}: ${slugs}`);
  console.log("✓ collectRepoSlugs parses active_repos, nested github.repos, and argv");

  // 3b. parseYamlList tolerates comments and blank lines inside lists
  const withComments = "active_repos:\n  # a comment\n  - one\n\n  - two\nnext: 1\n";
  const list = parseYamlList(withComments, "active_repos");
  assert(list.length === 2 && list[0] === "one" && list[1] === "two", `got ${list}`);

  // 3c. inline empty lists yield nothing
  assert(parseYamlList("active_repos: []\n", "active_repos").length === 0, "inline [] must be empty");
  assert(parseYamlSectionList("connectors:\n  github:\n    repos: []\n", "github", "repos").length === 0,
    "nested inline [] must be empty");
  console.log("✓ parseYamlList handles comments, blanks, and inline empty lists");

  console.log("✓ resolve-home test passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
