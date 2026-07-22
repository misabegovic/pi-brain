#!/usr/bin/env node
/**
 * Connector runner for pi-brain.
 *
 * Runs all enabled pull connectors. Currently supports github.
 *
 * Usage:
 *   node tools/connectors/run.mjs
 */

import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const CWD = process.cwd();

function getYamlValue(text, key) {
  const match = text.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  return match?.[1].trim();
}

function runConnector(script) {
  return new Promise((resolve, reject) => {
    const child = execFile("node", [script], { cwd: CWD });
    child.stdout?.on("data", (d) => process.stdout.write(String(d)));
    child.stderr?.on("data", (d) => process.stderr.write(String(d)));
    child.on("error", reject);
    child.on("close", (code) => resolve(code ?? 0));
  });
}

async function main() {
  const configText = await readFile(join(CWD, "brain.config.yml"), "utf-8");
  const githubSite = getYamlValue(configText, "connectors")
    ? getYamlValue(configText.split("connectors:")[1], "site")
    : "";

  // GitHub connector runs if there are repos configured or active_repos look like owner/repo slugs.
  const githubEnabled = true; // always try; the connector itself no-ops if nothing to do
  if (githubEnabled) {
    const code = await runConnector(join(CWD, "tools", "connectors", "github.mjs"));
    if (code !== 0) process.exitCode = code;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
