---
kind: record
status: delivered
scope: brain
sources:
  - wiki/brain/bets/agent-maintained-intent.md
  - wiki/brain/prds/agent-maintained-intent.md
  - wiki/brain/adrs/agent-maintained-intent.md
confidence: high
---

# Record — Agent-maintained intent

## What was delivered

A `/brain:revise` command that produces AI-suggested revision proposals for existing approved artifacts. Proposals land in `wiki/<scope>/ai-suggestions/revisions/` with the required banner and do not modify approved shelves until a human accepts them.

## Implementation

- `extensions/pi-brain/revise.ts` — revision proposal generator.
- `tools/templates/revision-ai-suggestion.md` — template for revision proposals.
- `extensions/pi-brain/commands.ts` — registered `/brain:revise`.
- Added `skills/brain-revise/SKILL.md`.

## Verification

- Proposal files pass `brain_validate`.
- Identifier validation prevents path traversal in scope/slug inputs.

## Pull request

- PR #12: https://github.com/misabegovic/pi-brain/pull/12

## Related

- [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- [wiki/brain/adrs/agent-maintained-intent.md](../adrs/agent-maintained-intent.md)
- [wiki/brain/prds/agent-maintained-intent.md](../prds/agent-maintained-intent.md)
- [wiki/brain/bets/agent-maintained-intent.md](../bets/agent-maintained-intent.md)
