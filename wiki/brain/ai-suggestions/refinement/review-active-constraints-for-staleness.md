---
kind: ai-suggestion
status: draft
confidence: low
topic: governance
created_at: 2026-07-29
---

# Review active constraints for staleness

## Observation

The regenerative-intent epic has landed. Some constraints may no longer apply or may need refinement. For example, `explicit-approval-for-commits` was relaxed in practice by allowing agent-merged PRs.

## Why now

Constraints are commitment-class artifacts and should be retired when they no longer reflect project practice.

## Suggested action

1. Read `wiki/brain/constraints/*.md`.
2. Identify any constraint that is no longer enforced or has been superseded.
3. Either retire it (move to archive with rationale) or update its text.
4. Capture the decision in the inbox or as an ADR if structural.

## Sources

- `wiki/brain/constraints/adr-before-structural-changes.md`
- `wiki/brain/constraints/explicit-approval-for-commits.md`
- `wiki/brain/constraints/remote-promotion-requires-pr.md`
