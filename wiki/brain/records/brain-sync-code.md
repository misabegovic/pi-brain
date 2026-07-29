---
kind: record
status: delivered
scope: brain
sources:
  - wiki/brain/bets/brain-sync-code.md
  - wiki/brain/prds/brain-sync-code.md
  - wiki/brain/adrs/brain-sync-code.md
confidence: high
---

# Record — `/brain:sync-code` reconciliation

## What was delivered

A proposal-first reconciliation command that takes drift detected by `/brain:diff` and writes actionable proposals to `wiki/<scope>/ai-suggestions/sync-code/`. Optional `--apply` updates code only; intent updates route through `/brain:revise`.

## Implementation

- `extensions/pi-brain/sync-code.ts` — drift-to-proposal generation and optional code apply.
- `extensions/pi-brain/commands.ts` — registered `/brain:sync-code`.
- Added `skills/brain-sync-code/SKILL.md`.

## Verification

- Generated proposals pass `brain_validate` after adding frontmatter.
- End-to-end build/diff/sync flow tested.

## Known limitations

- Code apply is limited to line-based edits of TypeScript interfaces; more complex transformations may need manual handling.

## Pull request

- PR #12: https://github.com/misabegovic/pi-brain/pull/12

## Related

- [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- [wiki/brain/adrs/brain-sync-code.md](../adrs/brain-sync-code.md)
- [wiki/brain/prds/brain-sync-code.md](../prds/brain-sync-code.md)
- [wiki/brain/bets/brain-sync-code.md](../bets/brain-sync-code.md)
