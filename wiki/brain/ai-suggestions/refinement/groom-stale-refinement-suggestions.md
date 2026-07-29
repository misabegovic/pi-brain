---
kind: ai-suggestion
status: draft
confidence: medium
topic: grooming
created_at: 2026-07-29
---

# Groom stale refinement suggestions

## Observation

There are 8 AI suggestions in `wiki/brain/ai-suggestions/refinement/`. At least one — "Merge PR #14 and act on its suggestions" — is now stale because PR #14 has merged. Others overlap (e.g., mark epic accepted / document commands / add CI / RFC fate) and have been suggested multiple times without action.

## Why now

A cluttered suggestion queue reduces signal. Grooming makes it clear what is still worth doing.

## Suggested action

1. Delete `merge-pr-14-and-act-on-suggestions.md`.
2. Review the remaining 7 suggestions and consolidate duplicates.
3. For each remaining suggestion, either:
   - Act on it now.
   - Keep it as a tracked todo.
   - Archive/delete it if it is no longer relevant.

## Sources

- `wiki/brain/ai-suggestions/refinement/`
