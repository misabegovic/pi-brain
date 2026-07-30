/**
 * Intent-block tests: verify parsing of YAML-like intent blocks.
 */

import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { collectBlocks } from "../extensions/pi-brain/intent-blocks.js";

async function createTempBrainHome(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "pi-brain-intent-test-"));
  await mkdir(join(dir, "wiki", "brain", "prds"), { recursive: true });
  await writeFile(join(dir, "brain.config.yml"), "org: Test\n", "utf-8");
  return dir;
}

async function main() {
  const home = await createTempBrainHome();
  try {
    const prd = [
      "---",
      "kind: prd",
      "---",
      "",
      "# PRD",
      "",
      "```intent:data_model:User",
      "fields:",
      "  - name: id",
      "    type: string",
      "  - name: email",
      "    type: string",
      "```",
      "",
      "```intent:behavior:Login",
      "description: User logs in",
      "steps:",
      "  - Enter email",
      "  - Enter password",
      "```",
      "",
    ].join("\n");
    await writeFile(join(home, "wiki", "brain", "prds", "test.md"), prd, "utf-8");

    const blocks = await collectBlocks({ path: home }, "brain");
    if (blocks.length !== 2) throw new Error(`Expected 2 blocks, got ${blocks.length}`);

    const userBlock = blocks.find((b) => b.name === "User");
    if (!userBlock) throw new Error("Expected User block");
    if (userBlock.type !== "data_model") throw new Error("Expected data_model type");
    const fields = (userBlock.data as any).fields as Array<Record<string, string>>;
    if (!fields || fields.length !== 2) throw new Error("Expected 2 fields");
    if (fields[0].name !== "id") throw new Error("Expected first field name 'id'");

    const loginBlock = blocks.find((b) => b.name === "Login");
    if (!loginBlock) throw new Error("Expected Login block");
    if (loginBlock.type !== "behavior") throw new Error("Expected behavior type");

    console.log("✓ findIntentBlocks parses data_model and behavior blocks");
    console.log("✓ intent-blocks test passed");
  } finally {
    await rm(home, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
