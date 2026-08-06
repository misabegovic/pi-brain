---
kind: bet
status: accepted
confidence: medium
appetite: medium
prd: wiki/brain/prds/autonomous-refinement-protocol.md
adr: wiki/brain/adrs/autonomous-refinement-protocol.md
enola_intent:
  page:
    type: bet
    status: accepted
---

# Bet — Autonomous refinement protocol for pi-brain

## What we are betting on

That an opportunistic, read-only refinement loop running in auto mode when the agent is idle will make pi-brain feel like a proactive colleague without removing human control over commitments.

## Why now

The `regenerative-intent` epic defines a long-term vision, but we can prove value immediately with a small, safe slice. The pi extension surface already provides the hooks (`agent_settled`, `ctx.isIdle()`, `pi.sendUserMessage()`), and the existing `ai-suggestions/` + inbox mechanisms give us a place to put output.

## Appetite

Medium. One focused build phase: extension hook, skill/prompt updates, and a small set of refinement checks.

## Success looks like

- In auto mode, when the agent becomes idle, it runs a refinement scan.
- The scan produces ≤5 suggestions per run, all in `ai-suggestions/` or inbox.
- No approved shelves, commits, or repo changes happen silently.
- Suggestions cite their source and are reviewable via `/brain:tend`.
- Users report the brain feels "alive" rather than passive.

### Signals to cut losses

- The scan produces noise or repetitive suggestions.
- It triggers during active user work despite guards.
- It misses obvious gaps because the checklist is too shallow.
- Users ignore or dismiss most suggestions.

## Related

- [PRD](../prds/autonomous-refinement-protocol.md)
- [ADR](../adrs/autonomous-refinement-protocol.md)
- Parent epic: [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- [wiki/brain/adrs/smarter-autonomy.md](../adrs/smarter-autonomy.md)
- [wiki/brain/constraints/adr-before-structural-changes.md](../constraints/adr-before-structural-changes.md)
