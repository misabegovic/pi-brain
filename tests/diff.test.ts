/**
 * Diff tests: verify drift detection between intent and code interfaces.
 */

import { parseTypeScriptInterfaces, diffInterfaces } from "../extensions/pi-brain/diff.js";

async function main() {
  const code = parseTypeScriptInterfaces(`
export interface User {
  id: string;
  email: string;
}
`);
  if (code.length !== 1) throw new Error("Expected one parsed interface");
  if (code[0].fields.length !== 2) throw new Error("Expected two fields");
  console.log("✓ parseTypeScriptInterfaces extracts interfaces and fields");

  // Matching intent and code: no drift.
  const matched = diffInterfaces(
    [{ name: "User", fields: [{ name: "id", type: "string", optional: false }, { name: "email", type: "string", optional: false }] }],
    code
  );
  if (matched.length !== 0) throw new Error("Expected no drift for matching interfaces");
  console.log("✓ diffInterfaces reports no drift when intent matches code");

  // Missing field in code.
  const missing = diffInterfaces(
    [{ name: "User", fields: [{ name: "id", type: "string", optional: false }, { name: "email", type: "string", optional: false }, { name: "age", type: "number", optional: false }] }],
    code
  );
  if (!missing.some((d) => d.kind === "missing_in_code" && d.fieldName === "age")) {
    throw new Error("Expected missing field drift");
  }
  console.log("✓ diffInterfaces reports missing fields");

  // Extra field in code.
  const extra = diffInterfaces(
    [{ name: "User", fields: [{ name: "id", type: "string", optional: false }] }],
    code
  );
  if (!extra.some((d) => d.kind === "extra_in_code" && d.fieldName === "email")) {
    throw new Error("Expected extra field drift");
  }
  console.log("✓ diffInterfaces reports extra fields");

  // Type mismatch.
  const mismatch = diffInterfaces(
    [{ name: "User", fields: [{ name: "id", type: "number", optional: false }, { name: "email", type: "string", optional: false }] }],
    code
  );
  if (!mismatch.some((d) => d.kind === "type_mismatch" && d.fieldName === "id")) {
    throw new Error("Expected type mismatch drift");
  }
  console.log("✓ diffInterfaces reports type mismatches");

  console.log("✓ diff test passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
