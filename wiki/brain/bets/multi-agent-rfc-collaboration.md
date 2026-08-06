---
kind: bet
status: accepted
confidence: medium
appetite: medium
prd: wiki/brain/prds/multi-agent-rfc-collaboration.md
adr: wiki/brain/adrs/multi-agent-rfc-collaboration.md
enola_intent:
  page:
    type: bet
    status: accepted
---

# Bet — Multi-agent RFC collaboration

## What we are betting on

That RFCs with an append-only contributions section and a `/brain:rfc-contribute` command enable richer, asynchronous collaboration between agents and humans on cross-cutting decisions.

## Why now

Multi-agent collaboration exists for intent artifacts, and RFCs are explicitly designed for multi-perspective review. Combining them is the natural final piece of the regenerative-intent epic.

## Appetite

Medium. One focused build phase: RFC contribution section format, `/brain:rfc-contribute` command, and attribution tracking.

## Success looks like

- `/brain:rfc-contribute brain background-task-runner brain-security-reviewer "review trust section"` appends a contribution to the RFC.
- Contributions include author, date, task, and text.
- Existing contributions are never deleted silently.
- Humans can add contributions manually or via the same command.
- Users report better cross-cutting decision discussions.

### Signals to cut losses

- RFCs become too long and hard to read.
- Agent contributions are low quality or repetitive.
- Users prefer one-shot RFCs created during `/brain:shape`.
- Attribution format becomes a maintenance burden.

## Related

- [PRD](../prds/multi-agent-rfc-collaboration.md)
- [ADR](../adrs/multi-agent-rfc-collaboration.md)
- Parent epic: [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- Prior bet: [wiki/brain/bets/multi-agent-intent-collaboration.md](../bets/multi-agent-intent-collaboration.md)
