---
kind: decision
status: accepted
confidence: high
---

# ADR — Remote promotion requires a pull request

## Context

`AGENTS.md` defines `LOCAL_FIRST=true` as landing each phase as a local commit and not opening pull requests unless the user explicitly asks. In practice, this was interpreted as allowing a direct `git push` when the user said "push it."

The user clarified that `LOCAL_FIRST` should govern local phase commits only, and that promotion to the remote origin must still go through a pull request. This keeps the solo-operator speed for local work while preserving review, CI, and an audit trail for anything that reaches the shared repository.

## Decision

Add an active `must` constraint: even when `LOCAL_FIRST=true`, pushing local commits to the remote origin must happen via a pull request, unless branch protection makes a PR impossible or the user explicitly overrides in the same turn.

## Alternatives considered

1. **Update `AGENTS.md` directly.**
   - Rejected: `AGENTS.md` is template-owned. A wiki constraint can express the per-clone rule without touching the product template, and constraints are designed to be retired if they no longer apply.

2. **Keep the previous interpretation and push directly on "push it."**
   - Rejected: the user explicitly ruled this out. Direct pushes to `main` bypass review and can break protected-branch workflows.

3. **Always open a PR regardless of `LOCAL_FIRST`.**
   - Accepted with nuance: local phase commits stay local; only remote promotion goes through a PR.

## Consequences

- The agent will create a branch, push it, and open a PR when asked to promote work to the remote.
- Solo operators still get fast local commits during phased work.
- The shared history retains PR references and can enforce CI checks.

## Related

- [wiki/brain/constraints/remote-promotion-requires-pr.md](../constraints/remote-promotion-requires-pr.md)
- [wiki/brain/constraints/adr-before-structural-changes.md](../constraints/adr-before-structural-changes.md)
- `AGENTS.md`
