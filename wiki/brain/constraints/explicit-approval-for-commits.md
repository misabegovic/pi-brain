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
  - "extensions/**"
  - "skills/**"
  - "prompts/**"
  - "themes/**"
  - "tools/**"
  - "wiki/**"
---

# Constraint — Explicit approval required for commits

## Statement

No commit may be created in the local repository, and no local branch may be pushed or merged, without explicit user approval in the same turn.

This applies to phase-level commits under `LOCAL_FIRST=true`, autonomous maintenance commits, and any other repository mutation. The agent may prepare a diff or a branch, but it must wait for explicit approval before running `git commit`, `git push`, or merging a pull request.

## Rationale

Repository mutations are commitment-class actions. Even when the change is low-risk, the user must retain control over when history is written and what enters the shared remote. This constraint prevents silent or autopilot commits and preserves trust.

## Applies to

- PRDs/epics/bets/ADRs in scope: `global`
- Categories: workflow

## Examples

- **Compliant:** The agent says "I have the changes ready. Commit?" and waits for the user to confirm before committing.
- **Violation:** The agent commits a cleanup pass or a low-risk fix without asking because autonomy mode is on.

## Related

- [wiki/brain/constraints/remote-promotion-requires-pr.md](./remote-promotion-requires-pr.md)
- [wiki/brain/constraints/adr-before-structural-changes.md](./adr-before-structural-changes.md)
- [AGENTS.md](../../../../AGENTS.md)
