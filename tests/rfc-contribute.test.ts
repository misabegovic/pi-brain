/**
 * RFC-contribute tests: verify formatting and appending helpers.
 */

import { formatContribution, appendContribution } from "../extensions/pi-brain/rfc-contribute.js";

async function main() {
  const formatted = formatContribution("brain-pm", "review trust section", "Consider failure isolation.");
  if (!formatted.includes("brain-pm")) throw new Error("Expected author in contribution");
  if (!formatted.includes("review trust section")) throw new Error("Expected task in contribution");
  if (!formatted.includes("Consider failure isolation.")) throw new Error("Expected text in contribution");
  console.log("✓ formatContribution structures contributions");

  const rfcWithoutSection = "# RFC\n\n## Context\n";
  const updated1 = appendContribution(rfcWithoutSection, formatted);
  if (!updated1.includes("## Contributions")) throw new Error("Expected Contributions section created");
  console.log("✓ appendContribution creates Contributions section when absent");

  const rfcWithSection = "# RFC\n\n## Contributions\n";
  const updated2 = appendContribution(rfcWithSection, formatted);
  if ((updated2.match(/## Contributions/g) || []).length !== 1) throw new Error("Expected single Contributions section");
  console.log("✓ appendContribution appends to existing Contributions section");

  console.log("✓ rfc-contribute test passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
