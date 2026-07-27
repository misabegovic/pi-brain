---
kind: decision
status: accepted
confidence: high
---

# ADR — Local-first brain self-maintenance workflow

## Context

pi-brain is intended to be a standalone, primary working contract for target repositories. Maintaining the brain itself — keeping ADRs, PRDs, bets, records, sources, and state current — is operational work that the agent performs on behalf of the user.

The active `explicit-approval-for-commits` constraint currently requires the agent to ask for explicit user approval before every local commit, even for low-risk brain-maintenance changes. With `LOCAL_FIRST=true` set in `.env`, the user expects day-to-day brain work to stay local and trusted to the agent, with remote promotion only happening when explicitly requested.

## Decision

For **brain self-maintenance** in this clone, when `LOCAL_FIRST=true`:

1. The agent may create local commits without asking for explicit per-commit approval.
2. Work should land on `main` unless there is a specific reason to use a branch.
3. Remote promotion (push, PR, merge) still requires an explicit user request and must follow the `remote-promotion-requires-pr` protocol.
4. For **target repositories**, the previous behavior remains: work in a separate branch, do not open a PR until prompted, and backlink intent resources (PRD/ADR/bet/record) in the PR description.

This ADR amends the active `explicit-approval-for-commits` constraint to exempt brain self-maintenance under `LOCAL_FIRST=true`.

## Alternatives considered

1. **Keep asking before every commit.**
   - *Rejected:* it adds friction to routine brain upkeep and contradicts the trust the user places in the agent for brain maintenance.

2. **Require a separate branch for every local change even when `LOCAL_FIRST=true`.**
   - *Rejected:* the user explicitly prefers work on `main` for local-first brain maintenance; branches are for target repos or for explicitly shaped work that will be promoted.

3. **Allow silent remote promotion when `LOCAL_FIRST=true`.**
   - *Rejected:* remote promotion is still commitment-class and must go through the PR protocol per `remote-promotion-requires-pr`.

## Consequences

- Brain maintenance becomes faster and less chatty.
- The agent must still respect `remote-promotion-requires-pr` and only push/PR when asked.
- The change is recorded in the constraint file so future sessions inherit the rule.
- Target-repo workflows are unaffected.

## Related

- [Constraint — Explicit approval required for commits](../constraints/explicit-approval-for-commits.md)
- [Constraint — Remote promotion requires a pull request](../constraints/remote-promotion-requires-pr.md)
- [AGENTS.md](../../../../AGENTS.md)
- `.env`
