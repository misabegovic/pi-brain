/**
 * Build-renderer tests: verify generated TypeScript from intent blocks.
 */

import { renderTarget } from "../extensions/pi-brain/build-renderers.js";
import type { IntentBlock } from "../extensions/pi-brain/intent-blocks.js";

async function main() {
  const blocks: IntentBlock[] = [
    {
      type: "data_model",
      name: "User",
      source: "wiki/brain/prds/test.md",
      data: {
        name: "User",
        fields: [
          { name: "id", type: "string" },
          { name: "age", type: "integer" },
          { name: "active", type: "boolean", optional: true, description: "is active" },
        ],
      },
    },
  ];

  const output = renderTarget(blocks, "types");
  if (!output) throw new Error("Expected rendered output");
  if (!output.includes("export interface User")) throw new Error("Expected User interface");
  if (!output.includes("id: string;")) throw new Error("Expected id field");
  if (!output.includes("age: number;")) throw new Error("Expected age mapped to number");
  if (!output.includes("active?: boolean;")) throw new Error("Expected optional active field");
  console.log("✓ renderTarget generates TypeScript interfaces from data_model blocks");

  const unknown = renderTarget(blocks, "unknown-target");
  if (unknown !== null) throw new Error("Expected null for unknown target");
  console.log("✓ renderTarget returns null for unknown targets");

  console.log("✓ build-renderers test passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
