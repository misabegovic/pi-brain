---
kind: bet
status: accepted
confidence: medium
appetite: medium
prd: wiki/brain/prds/autonomous-colleague-mode.md
adr: wiki/brain/adrs/autonomous-colleague-mode.md
---

# Bet — Autonomous colleague mode

## What we are betting on

That operation-class trust levels with session summaries make autonomy feel like a proactive colleague while preserving human control over commitments.

## Why now

We have an autonomous refinement protocol and several autonomous maintenance actions. They need a unified trust model and a way to surface activity to the user without being noisy.

## Appetite

Medium. One focused build phase: trust-level config, operation classification, and session summary reporting.

## Success looks like

- `brain.config.yml` supports `autonomy_trust` overrides.
- Silent operations run without interrupting.
- Notify operations run and produce a concise summary.
- Ask operations stop for approval.
- Blocked operations never run autonomously.
- Users report auto mode feels helpful and transparent.

### Signals to cut losses

- Users find the summary noisy or unhelpful.
- Trust levels are misconfigured and allow unwanted actions.
- The classification logic is complex and error-prone.
- Auto mode still feels passive despite the changes.

## Related

- [PRD](../prds/autonomous-colleague-mode.md)
- [ADR](../adrs/autonomous-colleague-mode.md)
- Parent epic: [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- Prior bets:
  - [wiki/brain/bets/autonomous-refinement-protocol.md](../bets/autonomous-refinement-protocol.md)
  - [wiki/brain/bets/agent-maintained-intent.md](../bets/agent-maintained-intent.md)
