---
kind: record
status: delivered
scope: brain
sources:
  - wiki/brain/bets/autonomous-refinement-protocol.md
  - wiki/brain/prds/autonomous-refinement-protocol.md
  - wiki/brain/adrs/autonomous-refinement-protocol.md
confidence: high
---

# Record — Autonomous refinement protocol

## What was delivered

An opportunistic, read-only scan that runs when autonomy is ON and the agent becomes idle. It produces at most 3–5 suggestions per scan, written to `wiki/<scope>/ai-suggestions/` or captured as inbox items. The protocol never edits approved shelves, commits, or structural files autonomously.

## Implementation

- `extensions/pi-brain/refinement.ts` — core loop, gap scan, KISS/YAGNI audit, citation/drift checks.
- `extensions/pi-brain/autonomy.ts` — operation-class trust levels and session summaries.
- `extensions/pi-brain/commands.ts` — registered `/brain:auto` command.
- Updated `prompts/brain-autonomy.md` and skills.

## Verification

- Ran successfully on `main` after PR #12 merged.
- Generated 4 post-merge suggestions without validation errors.

## Pull request

- PR #12: https://github.com/misabegovic/pi-brain/pull/12

## Related

- [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- [wiki/brain/adrs/autonomous-refinement-protocol.md](../adrs/autonomous-refinement-protocol.md)
- [wiki/brain/prds/autonomous-refinement-protocol.md](../prds/autonomous-refinement-protocol.md)
- [wiki/brain/bets/autonomous-refinement-protocol.md](../bets/autonomous-refinement-protocol.md)
