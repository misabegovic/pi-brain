/**
 * Autonomy tests: verify trust-level helpers.
 */

import {
  shouldProceed,
  shouldNotify,
  recordOperation,
  getSessionSummary,
  clearSessionSummary,
  formatSummary,
} from "../extensions/pi-brain/autonomy.js";

async function main() {
  // shouldProceed
  if (!shouldProceed("silent")) throw new Error("silent should proceed");
  if (!shouldProceed("notify")) throw new Error("notify should proceed");
  if (shouldProceed("ask")) throw new Error("ask should not proceed");
  if (shouldProceed("blocked")) throw new Error("blocked should not proceed");
  console.log("✓ shouldProceed respects trust levels");

  // shouldNotify
  if (!shouldNotify("notify")) throw new Error("notify should notify");
  if (shouldNotify("silent")) throw new Error("silent should not notify");
  if (shouldNotify("ask")) throw new Error("ask should not notify");
  if (shouldNotify("blocked")) throw new Error("blocked should not notify");
  console.log("✓ shouldNotify respects trust levels");

  // session summary
  const session = "/tmp/test-session.json";
  recordOperation(session, { class: "sync", description: "Ran sync", timestamp: 1 });
  recordOperation(session, { class: "groom", description: "Groomed inbox", timestamp: 2 });
  const summary = getSessionSummary(session);
  if (summary.length !== 2) throw new Error("Expected 2 operations in summary");
  const formatted = formatSummary(summary);
  if (!formatted.includes("Ran sync") || !formatted.includes("Groomed inbox")) {
    throw new Error("Expected formatted summary to include operation descriptions");
  }
  console.log("✓ session summary records and formats operations");

  clearSessionSummary(session);
  if (getSessionSummary(session).length !== 0) throw new Error("Expected cleared summary");
  console.log("✓ session summary clears");

  console.log("✓ autonomy test passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
