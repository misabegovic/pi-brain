/**
 * One template version: package.json is the source, and every place that
 * stamps a template_version reads it instead of carrying its own literal.
 */

import { readFile, mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const ROOT = join(import.meta.dirname, "..");

async function main() {
  const version = JSON.parse(await readFile(join(ROOT, "package.json"), "utf-8")).version;

  const config = await readFile(join(ROOT, "brain.config.yml"), "utf-8");
  const stamped = config.match(/^template_version:\s*"([^"]+)"/m)?.[1];
  if (stamped !== `v${version}`) throw new Error(`brain.config.yml template_version ${stamped} != v${version}`);
  console.log("✓ brain.config.yml template_version matches package.json");

  const shape = await readFile(join(ROOT, "extensions/pi-brain/commands/shape.ts"), "utf-8");
  if (/template_version: "v\d/.test(shape)) throw new Error("/brain:setup carries a literal template version");
  console.log("✓ /brain:setup reads the version from package.json");

  const tmp = await mkdtemp(join(tmpdir(), "pi-brain-clone-version-"));
  try {
    const target = join(tmp, "clone");
    const result = spawnSync("bash", [join(ROOT, "tools/clone-pi-brain.sh"), target, "Test"], { encoding: "utf-8" });
    if (result.status !== 0) throw new Error(`clone-pi-brain.sh failed: ${result.stderr}`);
    const cloneConfig = await readFile(join(target, "brain.config.yml"), "utf-8");
    if (!cloneConfig.includes(`template_version: "v${version}"`)) throw new Error("clone-pi-brain.sh did not stamp the package version");
    console.log("✓ clone-pi-brain.sh stamps the package version");
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
