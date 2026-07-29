---
kind: record
status: delivered
scope: brain
sources:
  - wiki/brain/bets/autonomous-colleague-mode.md
  - wiki/brain/prds/autonomous-colleague-mode.md
  - wiki/brain/adrs/autonomous-colleague-mode.md
confidence: high
---

# Record — Autonomous colleague mode

## What was delivered

Operation-class trust levels (`silent`, `notify`, `ask`, `blocked`) that control what the agent may do autonomously. High-risk operations (shelves, commits, code edits) default to `blocked`; low-risk maintenance defaults to `silent` or `notify`.

## Implementation

- `extensions/pi-brain/autonomy.ts` — trust levels, `readAutonomyTrust()`, and session summaries.
- `prompts/brain-autonomy.md` — updated with trust levels and refinement protocol instructions.
- `extensions/pi-brain/commands.ts` — registered `/brain:auto`.
- Added `skills/brain-auto/SKILL.md`.

## Verification

- Autonomous refinement protocol ran under autonomy ON and produced valid suggestions.
- Trust-level defaults prevent silent structural changes.

## Pull request

- PR #12: https://github.com/misabegovic/pi-brain/pull/12

## Related

- [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- [wiki/brain/adrs/autonomous-colleague-mode.md](../adrs/autonomous-colleague-mode.md)
- [wiki/brain/prds/autonomous-colleague-mode.md](../prds/autonomous-colleague-mode.md)
- [wiki/brain/bets/autonomous-colleague-mode.md](../bets/autonomous-colleague-mode.md)
