---
kind: bet
status: accepted
confidence: medium
appetite: medium
prd: wiki/brain/prds/agent-maintained-intent.md
adr: wiki/brain/adrs/agent-maintained-intent.md
enola_intent:
  page:
    type: bet
    status: accepted
---

# Bet — Agent-maintained intent

## What we are betting on

That agents can safely propose concrete revisions to existing intent artifacts as AI-suggested drafts, reducing artifact proliferation and keeping intent current.

## Why now

We already generate suggestions, multiple perspectives, and code from intent. The next step is to make the output actionable: turn findings into proposed revisions rather than always creating new artifacts.

## Appetite

Medium. One focused build phase: revision proposal format, `/brain:revise` command, and integration with refinement/collaboration outputs.

## Success looks like

- `/brain:revise brain structured-intent-and-build` produces a revision proposal for that PRD.
- Proposals include targeted changes, rationale, and source citations.
- Proposals live in `ai-suggestions/revisions/` and are never auto-promoted.
- Autonomous refinement can produce revision proposals for low-risk updates.
- Users report fewer duplicate artifacts and fresher intent.

### Signals to cut losses

- Proposals are vague or require heavy rewriting before they are useful.
- Users ignore proposals because there are too many.
- Agents propose changes to high-risk artifacts (constraints, ADRs) too eagerly.
- The proposal format becomes a maintenance burden.

## Related

- [PRD](../prds/agent-maintained-intent.md)
- [ADR](../adrs/agent-maintained-intent.md)
- Parent epic: [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- Prior bets:
  - [wiki/brain/bets/autonomous-refinement-protocol.md](../bets/autonomous-refinement-protocol.md)
  - [wiki/brain/bets/multi-agent-intent-collaboration.md](../bets/multi-agent-intent-collaboration.md)
  - [wiki/brain/bets/structured-intent-and-build.md](../bets/structured-intent-and-build.md)
  - [wiki/brain/bets/brain-diff-drift-detection.md](../bets/brain-diff-drift-detection.md)
