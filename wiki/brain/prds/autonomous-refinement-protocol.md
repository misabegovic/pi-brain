---
kind: initiative
status: living
confidence: low
appetite: medium
team: brain
repos: [brain]
---

# PRD — Autonomous refinement protocol for pi-brain

## Problem

Autonomy mode in pi-brain currently waits for user actions or auto-connect ingestions before doing anything useful. When the user has stepped away, the agent does not proactively refine the shared understanding. The brain accumulates sources, inbox items, and approved intent, but gaps, drift, and simplification opportunities sit unnoticed until the user asks.

Users want autonomous mode to feel like a colleague who is continuously tidying, questioning, and improving the shared understanding — but who still stops at commitment gates.

## Appetite

Medium. One focused build phase: a read-only refinement loop that outputs to `ai-suggestions/` and the inbox, plus the minimal extension/skill wiring to trigger it safely.

## Solution

Add an **autonomous refinement protocol** that runs opportunistically when the agent is idle in auto mode.

### Trigger

- Hook `agent_settled` in the pi-brain extension.
- Only run when autonomy is ON and `ctx.isIdle()` is true.
- Skip if the last user message was a direct command or question (don't answer questions that weren't asked).
- Skip if a refinement run already happened in the current idle window.

### Refinement loop

The agent evaluates the brain corpus for low-risk improvements:

1. **Gap scan** — Look at recent `sources/`, inbox items, and approved intent. Identify missing context, unanswered questions, or places where intent contradicts reality.
2. **Citation/drift check** — Run `brain_validate` / `brain_links` logic and surface broken citations or orphan pages.
3. **Complexity audit** — Review specs and (where accessible via deepdive) code for KISS/YAGNI violations: over-engineering, speculative abstractions, features without user need.
4. **Performance smell check** — For target repos that support it, use deepdive or connectors to spot obvious performance/throughput issues and capture them for investigation.
5. **Existing-artifact expansion** — Before proposing anything new, check for related PRDs/ADRs/bets/records and suggest revisions to them.
6. **Simplification proposals** — Draft low-risk suggestions in `ai-suggestions/` or capture inbox items.

### Output rules

- All proposals go to `wiki/<scope>/ai-suggestions/` or `wiki/_state/inbox.md`.
- Never mutate approved shelves (`prds/`, `adrs/`, `bets/`, `records/`, `constraints/`) silently.
- If something looks structural or ambiguous, it becomes an inbox item for the human.
- Each suggestion must cite the source(s) that motivated it.

### User experience

- A brief status notification: "Refinement scan complete: N suggestions, M questions."
- Suggestions appear in `/brain:tend` and in the next briefing.
- The user can review, ignore, or promote suggestions via `/brain:shape`.

## No-gos

- No autonomous commits.
- No structural/repo changes.
- No background scheduling outside the current session.
- No human-out-of-the-loop approval of ADRs/PRDs/bets.
- No auto-application of generated code.
- No rewriting approved intent from code changes.

## Rabbit holes

- Trying to make the protocol "smart" enough to handle every edge case. Start with a small, inspectable checklist.
- Running refinement too often and flooding the inbox. Rate-limit and batch.
- Letting the protocol trigger during active user work. Guard with `ctx.isIdle()` and session-state checks.
- Expensive deepdives on large repos. Cap depth and file count.

## Related

- [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- [wiki/brain/adrs/smarter-autonomy.md](../adrs/smarter-autonomy.md)
- [wiki/brain/constraints/adr-before-structural-changes.md](../constraints/adr-before-structural-changes.md)
- [wiki/brain/constraints/explicit-approval-for-commits.md](../constraints/explicit-approval-for-commits.md)
