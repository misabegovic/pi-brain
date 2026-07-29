---
kind: bet
status: accepted
confidence: medium
appetite: medium
prd: wiki/brain/prds/brain-sync-code.md
adr: wiki/brain/adrs/brain-sync-code.md
---

# Bet — `/brain:sync-code` reconciliation

## What we are betting on

That a proposal-first reconciliation command closes the build/diff/sync loop and makes drift actionable without removing human approval.

## Why now

`/brain:diff` is in place. The natural next step is to act on the drift it detects.

## Appetite

Medium. One focused build phase: read drift, generate proposals, optional code apply.

## Success looks like

- `/brain:sync-code brain types` produces reconciliation proposals in `ai-suggestions/sync-code/`.
- Each proposal presents clear options (update intent vs. update code).
- `--apply` updates code only after interactive approval.
- Intent updates are routed through `/brain:revise` proposals, not applied directly.
- Users report resolving drift faster.

### Signals to cut losses

- Proposals are confusing or require heavy editing.
- `--apply` produces wrong code changes.
- Users prefer to resolve drift manually.
- The command generates too many proposals for small drift.

## Related

- [PRD](../prds/brain-sync-code.md)
- [ADR](../adrs/brain-sync-code.md)
- Parent epic: [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- Prior bets:
  - [wiki/brain/bets/structured-intent-and-build.md](../bets/structured-intent-and-build.md)
  - [wiki/brain/bets/brain-diff-drift-detection.md](../bets/brain-diff-drift-detection.md)
