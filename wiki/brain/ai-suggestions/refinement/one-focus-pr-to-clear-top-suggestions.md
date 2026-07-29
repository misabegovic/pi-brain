---
kind: ai-suggestion
status: draft
confidence: high
topic: delivery
created_at: 2026-07-29
---

# One focused PR to clear the top suggestions

## Observation

The queue has 20 suggestions, but a small set of high-value actions would resolve many of them:

- Mark epic accepted + record PR #13.
- Delete stale merge-PR-14 suggestion.
- Add `.env.example` and update setup skill.
- Update README, brain skill, and home prompt.
- Add CI workflow.
- Archive or delete demo RFC.
- Log PR #13 and PR #14.

## Why now

A single focused PR can reduce the queue from 20 to ~5 and unblock further refinement runs.

## Suggested action

1. Create branch `brain/groom-refinement-queue`.
2. In one PR, implement the items above.
3. Delete all acted-on suggestions.
4. Merge to `main`.

## Sources

- `wiki/brain/ai-suggestions/refinement/`
