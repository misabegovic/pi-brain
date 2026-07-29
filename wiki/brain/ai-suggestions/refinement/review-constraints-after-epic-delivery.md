---
kind: ai-suggestion
status: draft
confidence: low
topic: constraints
created_at: 2026-07-29
---

# Review active constraints after regenerative-intent delivery

## Observation

The regenerative-intent epic has been delivered and the main branch is now PR-first. Active constraints include `adr-before-structural-changes`, `explicit-approval-for-commits`, and `remote-promotion-requires-pr`. It may be time to review whether these constraints are still correctly phrased or whether new ones are needed (e.g., a constraint requiring CI green before merge).

## Why now

Constraints should reflect the current delivery model. After a major delivery, it is worth checking that guardrails still match how the team actually works.

## Suggested action

1. Read `wiki/brain/constraints/*.md`.
2. Check if any constraint needs rephrasing (e.g., `remote-promotion-requires-pr` already covers PR-first, but could explicitly mention `LOCAL_FIRST` behavior).
3. Decide whether to add a new `must` constraint for CI green before merge.
4. If changes are needed, shape an ADR or directly update the constraint pages.

## Sources

- `wiki/brain/constraints/adr-before-structural-changes.md`
- `wiki/brain/constraints/explicit-approval-for-commits.md`
- `wiki/brain/constraints/remote-promotion-requires-pr.md`
