---
kind: constraint
status: active
confidence: high
severity: must
category: workflow
scope: global
globs:
  - "AGENTS.md"
  - ".env"
  - ".github/**"
  - "brain.config.yml"
---

# Constraint — Remote promotion requires a pull request

## Statement

Even when `LOCAL_FIRST=true`, promoting local commits to the remote origin MUST go through a pull request, unless the repository's branch protection makes a PR impossible or the user explicitly overrides the constraint in the same turn.

Local commits and phase-level work may still land directly on the current branch; this constraint applies only to the remote promotion step.

## Rationale

`LOCAL_FIRST` controls how phased work is committed locally before review. It is not a license to bypass review when the work is being promoted to the shared remote. A pull request preserves the decision trail, allows CI to run, and prevents accidental direct pushes to protected branches.

## Applies to

- PRDs/epics/bets/ADRs in scope: `global`
- Categories: workflow

## Examples

- **Compliant:** The user says "push this." The agent opens a pull request, links to the relevant ADR/PRD/bet/record, and asks the user to merge.
- **Violation:** The user says "push this." The agent runs `git push` directly to `main` because `LOCAL_FIRST=true`.

## Related

- [wiki/brain/adrs/remote-promotion-requires-pr.md](../adrs/remote-promotion-requires-pr.md)
- [wiki/brain/constraints/explicit-approval-for-commits.md](./explicit-approval-for-commits.md)
- [wiki/brain/adrs/explicit-approval-for-commits.md](../adrs/explicit-approval-for-commits.md)
- [wiki/brain/constraints/adr-before-structural-changes.md](./adr-before-structural-changes.md)
- [AGENTS.md](../../../../AGENTS.md)
