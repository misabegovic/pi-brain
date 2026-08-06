---
kind: initiative
status: living
confidence: low
appetite: medium
team: brain
repos: [brain]
enola_intent:
  page:
    type: initiative
    status: living
---

# PRD — Multi-agent RFC collaboration

## Problem

RFCs in pi-brain are one-off documents created during `/brain:shape --rfc`. They capture multiple perspectives at a single point in time, but they don't evolve as the conversation continues. When agents and humans revisit a decision, they create new RFCs or ad-hoc comments instead of building on the existing RFC. The conversation fragments.

Users want RFCs to be living documents where multiple agents (and humans) can contribute asynchronously, with each contribution recorded and attributed.

## Appetite

Medium. One focused build phase: add agent contribution sections to RFCs, a `/brain:rfc-contribute` command, and attribution tracking.

## Solution

Make RFCs collaborative artifacts that accept asynchronous contributions from agents and humans.

### RFC format update

RFCs gain a `## Contributions` section where each entry has:

```markdown
## Contributions

### 2026-07-28 — brain-security-reviewer
Concern: the background task runner spawns subprocesses with full user permissions.
Suggestion: add a `code` trust level that defaults to blocked for background tasks.

### 2026-07-28 — human
Acknowledged. The ADR already blocks `code` operations; I will make that explicit in the PRD.
```

### Command

`/brain:rfc-contribute <scope> <slug> <agent> <prompt>`

Example:

```
/brain:rfc-contribute brain background-task-runner brain-security-reviewer "review the trust section"
```

This runs the specified subagent against the RFC and appends its contribution.

### Human contributions

Humans can edit the RFC directly and add a contribution entry, or use `/brain:rfc-contribute <scope> <slug> human <note>`.

### Agent ownership

Each contribution records:
- Timestamp
- Author (agent name or "human")
- The prompt/task that generated it
- The contribution text

### Lifecycle

- RFCs start in `wiki/<scope>/rfcs/` during `/brain:shape --rfc`.
- Contributions accumulate in `## Contributions`.
- When the RFC matures, it is promoted to an ADR/PRD through `/brain:shape`.

## No-gos

- No autonomous approval of RFCs.
- No editing approved ADRs/PRDs via RFC contributions.
- No infinite agent loops (e.g., one agent responding to another automatically).
- No removing or rewriting existing contributions silently.

## Rabbit holes

- Threaded discussions with nested replies.
- Real-time collaboration/locking.
- Automatic consensus detection.

## Related

- [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- [wiki/brain/bets/multi-agent-intent-collaboration.md](../bets/multi-agent-intent-collaboration.md)
- [wiki/brain/adrs/multi-agent-intent-collaboration.md](../adrs/multi-agent-intent-collaboration.md)
- [wiki/brain/constraints/adr-before-structural-changes.md](../constraints/adr-before-structural-changes.md)
