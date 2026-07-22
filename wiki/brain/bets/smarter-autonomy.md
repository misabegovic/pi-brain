---
kind: bet
status: accepted
confidence: medium
appetite: medium
prd: wiki/brain/prds/smarter-autonomy.md
adr: wiki/brain/adrs/smarter-autonomy.md
---

# Bet — Smarter autonomy for pi-brain clones

## What we are betting on

That an autonomy mode with a clear low-risk/high-risk boundary makes pi-brain clones feel hands-off and well-maintained, without removing human control over commitments.

## Why now

The current auto mode produces inbox overload from auto-connect and waits for approval before trivial maintenance. Users are asking for the agent to "actually do stuff that is important" while respecting the brain contract.

## Appetite

Medium. One focused build phase: quiet auto-connect, auto-groom, smart tend, and the brain identity prompt. We will not add background scheduling or remove structural gates.

## Success looks like

- Auto-connect creates one inbox summary item per batch, not one per source.
- `brain_sync` runs automatically after auto-captures/ingests.
- Stale auto-connect batches are archived without asking.
- Low-risk observations can be synthesized into `ai-suggestions/` silently.
- High-risk items (constraints, ADRs, structural changes, incidents) remain in the inbox and require explicit approval.
- The session-start prompt in auto mode reminds the agent it's in a pi-brain clone and points to `AGENTS.md`.

### Signals to cut losses

- The risk classifier misclassifies structural items as low risk.
- Users report they don't know what auto mode changed.
- Auto-groom archives something the user wanted to keep.

## Related

- [PRD](../prds/smarter-autonomy.md)
- [ADR](../adrs/smarter-autonomy.md)
- [wiki/brain/constraints/adr-before-structural-changes.md](../constraints/adr-before-structural-changes.md)
