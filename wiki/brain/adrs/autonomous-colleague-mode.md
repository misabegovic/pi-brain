---
kind: decision
status: accepted
confidence: low
enola_intent:
  page:
    type: decision
    status: accepted
---

# ADR — Autonomous colleague mode

## Context

The `regenerative-intent` epic and user feedback ask for auto mode to feel like a colleague: proactive, helpful, and trustworthy. The existing `smarter-autonomy.md` ADR set a low-risk/high-risk boundary but did not define operation-level trust or session summaries.

This ADR revisits the autonomy boundary by introducing explicit trust levels for operation classes.

## Decision

pi-brain will support **operation-class trust levels** in autonomous mode:

- `silent` — operation runs without interrupting the user.
- `notify` — operation runs and a summary is surfaced.
- `ask` — operation waits for explicit approval.
- `blocked` — operation never runs autonomously.

### Default levels

| Operation class | Default | Examples |
|---|---|---|
| `sync` | silent | `brain_sync`, index regeneration |
| `groom` | notify | inbox archiving, stale suggestion cleanup |
| `refine` | notify | autonomous refinement protocol |
| `suggest` | notify | writing to `ai-suggestions/` |
| `shelves` | blocked | editing `prds/`, `adrs/`, `bets/`, `records/`, `constraints/` |
| `commits` | blocked | any git commit or push |
| `code` | blocked | editing target repo code |

### Configuration

Trust levels are configurable in `brain.config.yml` under `autonomy_trust`. Unknown operation classes default to `ask`.

### Session summary

When autonomous operations run during an idle window, the extension accumulates a summary and surfaces it via `ctx.ui.notify()` at the next opportunity.

### Relation to `smarter-autonomy.md`

This ADR amends and extends `smarter-autonomy.md`. The existing low-risk/high-risk boundary is preserved but made more granular. Background scheduled LLM runs remain out of scope.

## Alternatives considered

1. **Keep the existing binary low-risk/high-risk boundary.**
   - *Rejected:* too coarse; users want more nuance between "silent" and "ask".

2. **Per-tool permission prompts.**
   - *Rejected:* too chatty; breaks the "colleague" feeling.

3. **Human-out-of-the-loop for everything except structural changes.**
   - *Rejected:* too risky; some operations (commits, code edits) need explicit gates regardless of trust.

4. **Operation-class trust levels with session summaries.** (Chosen.)
   - *Pros:* clear, configurable, preserves safety, surfaces activity without interrupting.
   - *Cons:* requires documenting each operation class; misconfiguration could allow too much.

## Consequences

- Auto mode becomes more proactive and transparent.
- Users can tune trust to their comfort level.
- The extension needs to classify each autonomous action and check trust before executing.
- Future bets (background task runner) can reuse the trust-level framework.

## Related

- [wiki/brain/prds/autonomous-colleague-mode.md](../prds/autonomous-colleague-mode.md)
- [wiki/brain/bets/autonomous-colleague-mode.md](../bets/autonomous-colleague-mode.md)
- [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- [wiki/brain/adrs/smarter-autonomy.md](../adrs/smarter-autonomy.md)
- [wiki/brain/bets/autonomous-refinement-protocol.md](../bets/autonomous-refinement-protocol.md)
- [wiki/brain/constraints/adr-before-structural-changes.md](../constraints/adr-before-structural-changes.md)
- [wiki/brain/constraints/explicit-approval-for-commits.md](../constraints/explicit-approval-for-commits.md)
