---
kind: bet
status: accepted
confidence: medium
appetite: medium
prd: wiki/brain/prds/multi-agent-intent-collaboration.md
adr: wiki/brain/adrs/multi-agent-intent-collaboration.md
enola_intent:
  page:
    type: bet
    status: accepted
---

# Bet — Multi-agent intent collaboration for pi-brain

## What we are betting on

That delegating intent work to specialized subagents (PM, Tech Lead, Developer, Security Reviewer) produces deeper, more balanced intent artifacts than a single agent context-switching between personas.

## Why now

The autonomous refinement protocol proves that auto mode can proactively inspect the corpus. The next step is to make that inspection multi-perspective. pi's `subagent/` example gives us a proven pattern to build on.

## Appetite

Medium. One focused build phase: ship four agent definitions, a `/brain:collaborate` command, and parallel/chain support.

## Success looks like

- `/brain:collaborate brain "review the X PRD"` returns structured feedback from ≥2 perspectives.
- Parallel and chain modes both work.
- Output lands in `ai-suggestions/` or inbox, never approved shelves.
- Project-local agents prompt for trust confirmation.
- Users report that intent artifacts feel more complete after collaboration.

### Signals to cut losses

- Subagent runs are too slow or expensive for routine use.
- Agent feedback is repetitive or generic.
- Trust prompts become annoying.
- Output is hard to consolidate into actionable suggestions.

## Related

- [PRD](../prds/multi-agent-intent-collaboration.md)
- [ADR](../adrs/multi-agent-intent-collaboration.md)
- Parent epic: [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- Prior bet: [wiki/brain/bets/autonomous-refinement-protocol.md](../bets/autonomous-refinement-protocol.md)
