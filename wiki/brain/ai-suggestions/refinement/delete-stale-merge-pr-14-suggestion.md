---
kind: ai-suggestion
status: draft
confidence: high
topic: grooming
created_at: 2026-07-29
---

# Delete the stale "Merge PR #14" suggestion

## Observation

`merge-pr-14-and-act-on-suggestions.md` is still in the queue even though PR #14 merged several turns ago.

## Why now

Stale suggestions mislead future refinement scans and humans. Removing it is a quick win.

## Suggested action

1. Delete `wiki/brain/ai-suggestions/refinement/merge-pr-14-and-act-on-suggestions.md`.
2. Run `brain_sync`.

## Sources

- `wiki/brain/ai-suggestions/refinement/merge-pr-14-and-act-on-suggestions.md`
- PR #14: https://github.com/misabegovic/pi-brain/pull/14
