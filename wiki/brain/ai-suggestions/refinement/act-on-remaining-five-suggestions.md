---
kind: ai-suggestion
status: draft
confidence: high
topic: delivery
created_at: 2026-07-29
---

# Act on the remaining 5 refinement suggestions

## Observation

The suggestion queue is now down to 5 items:

1. `add-e2e-tests-for-new-commands.md`
2. `implement-suggestion-confidence-decay.md`
3. `review-constraints-after-epic-delivery.md`
4. `review-top-link-suggestions.md`
5. `verify-extension-reloads-after-pr-13.md`

## Why now

The queue is finally actionable. Addressing these closes the post-epic cleanup and prevents them from being re-suggested.

## Suggested action

Create a single focused PR that handles the highest-confidence items:
- Add e2e tests for the new commands (or a subset).
- Verify extension reload by starting a fresh pi session.
- Review constraints for any needed rephrasing.

The `implement-suggestion-confidence-decay.md` and `review-top-link-suggestions.md` items are lower priority and can stay for a future cycle.

## Sources

- `wiki/brain/ai-suggestions/refinement/`
