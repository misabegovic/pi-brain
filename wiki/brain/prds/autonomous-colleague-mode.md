---
kind: initiative
status: living
confidence: low
appetite: medium
team: brain
repos: [brain]
---

# PRD — Autonomous colleague mode

## Problem

Autonomy ON in pi-brain currently runs a narrow refinement protocol and low-risk maintenance. It still feels like a reactive assistant rather than a proactive colleague. Users want the agent to "actually do stuff that is important" while they are away — tidying, organizing, summarizing, and preparing next steps — but safely, with clear trust boundaries.

The current `smarter-autonomy.md` ADR explicitly rejects background scheduled LLM runs and keeps most work gated. This bet revisits that boundary for a well-defined set of safe operations.

## Appetite

Medium. One focused build phase: define operation trust levels, allow safe operations to run silently, and surface a summary to the user.

## Solution

Introduce **trust levels for autonomous operations**. Each operation class is either:

- **Silent** — runs without asking; outcome is logged/summarized.
- **Notify** — runs, then notifies the user with a summary.
- **Ask** — stops and waits for approval.
- **Blocked** — never runs autonomously.

### Operation classes

| Operation | Default level | Rationale |
|---|---|---|
| `brain_sync` | Silent | Low risk, keeps views current. |
| Archive stale `ai-suggestions/` | Silent | Cleanup, reversible. |
| Auto-groom inbox | Notify | May discard items; user should know. |
| Run refinement protocol | Notify | Produces suggestions; user should know. |
| Write to `ai-suggestions/` | Notify | Agent-authored output; user should know. |
| Write to approved shelves | Blocked | Commitment-class; always gated. |
| Commit or push | Blocked | Commitment-class; always gated. |
| Edit target repo code | Blocked | Commitment-class; always gated. |

### Configuration

Add `autonomy_trust` to `brain.config.yml`:

```yaml
autonomy_trust:
  sync: silent
  groom: notify
  refine: notify
  suggest: notify
  shelves: blocked
  commits: blocked
  code: blocked
```

Users can override defaults. Unknown operations default to `ask`.

### Session summary

At the end of an idle window, the agent posts a brief summary:

```
Autonomous session summary:
- Ran brain_sync
- Archived 3 stale suggestions
- Generated 2 refinement suggestions
- 0 items need approval
```

### Integration with refinement protocol

The refinement protocol becomes one of several autonomous colleague operations. It respects the `refine` trust level.

## No-gos

- No autonomous structural/repo changes.
- No autonomous commits, pushes, or code edits in target repos.
- No silent edits to approved shelves.
- No background scheduling outside the session (that's the background-task-runner bet).

## Rabbit holes

- Over-engineering a fine-grained permission system.
- Trying to make every operation configurable.
- Letting "notify" become noise; keep summaries concise.

## Related

- [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- [wiki/brain/adrs/smarter-autonomy.md](../adrs/smarter-autonomy.md)
- [wiki/brain/bets/autonomous-refinement-protocol.md](../bets/autonomous-refinement-protocol.md)
- [wiki/brain/constraints/adr-before-structural-changes.md](../constraints/adr-before-structural-changes.md)
- [wiki/brain/constraints/explicit-approval-for-commits.md](../constraints/explicit-approval-for-commits.md)
