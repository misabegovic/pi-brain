---
kind: decision
status: accepted
confidence: high
enola_intent:
  page:
    type: decision
    status: accepted
---

# ADR — Explicit approval required for commits

## Context

The user clarified that repository mutations — local commits, branch pushes, and pull-request merges — must not happen without explicit approval in the same turn. This applies even when `LOCAL_FIRST=true` and even when autonomous maintenance mode is on.

Previously, `LOCAL_FIRST=true` was read as permission to land each approved phase as a local commit once the user had said yes to the overall bet. The user wants a finer-grained gate: every individual commit/push/merge must be explicitly allowed.

## Decision

Add an active `must` constraint: the agent must obtain explicit user approval before creating any local commit, pushing any branch, or merging any pull request.

## Alternatives considered

1. **Trust autonomy mode to commit low-risk maintenance silently.**
   - Rejected: the user wants to approve every commit, regardless of risk level.

2. **Commit automatically after a bet is approved, then ask before pushing.**
   - Rejected: this still writes local history without per-commit approval.

3. **Ask for approval per phase, not per commit.**
   - Rejected: the user wants per-commit gating.

4. **Do nothing and keep the previous interpretation.**
   - Rejected: it contradicts the user's explicit instruction.

## Consequences

- The agent will present changes and ask before committing.
- Work can still be prepared on a branch and pushed after approval.
- The `remote-promotion-requires-pr` constraint remains in force; remote promotion still requires a PR.

## Related

- [wiki/brain/constraints/explicit-approval-for-commits.md](../constraints/explicit-approval-for-commits.md)
- [wiki/brain/constraints/remote-promotion-requires-pr.md](../constraints/remote-promotion-requires-pr.md)
- [wiki/brain/constraints/adr-before-structural-changes.md](../constraints/adr-before-structural-changes.md)
- `AGENTS.md`
