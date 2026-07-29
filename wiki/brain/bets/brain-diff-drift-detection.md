---
kind: bet
status: accepted
confidence: medium
appetite: medium
prd: wiki/brain/prds/brain-diff-drift-detection.md
adr: wiki/brain/adrs/brain-diff-drift-detection.md
---

# Bet — `/brain:diff` drift detection

## What we are betting on

That a structural drift report between intent blocks and generated/target code is valuable enough to keep intent and code aligned, and is a necessary precursor to automatic reconciliation.

## Why now

`/brain:build` is in place. The next step in the regenerative-intent loop is detecting when code diverges from intent.

## Appetite

Medium. One focused build phase: structural diff for TypeScript interfaces, output to ai-suggestions/drift/.

## Success looks like

- `/brain:diff brain types` regenerates expected interfaces and compares them to `wiki/brain/ai-suggestions/build/types/generated.ts`.
- The report identifies missing, extra, and divergent declarations.
- Reports land in `ai-suggestions/drift/` or inbox, never approved shelves.
- Users can act on the report to update intent or regenerate code.

### Signals to cut losses

- Reports are too noisy due to simple parsing.
- Users find the diff format hard to act on.
- Drift detection misses important changes.
- `/brain:build` output is not yet stable enough to diff against.

## Related

- [PRD](../prds/brain-diff-drift-detection.md)
- [ADR](../adrs/brain-diff-drift-detection.md)
- Parent epic: [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- Prior bet: [wiki/brain/bets/structured-intent-and-build.md](../bets/structured-intent-and-build.md)
