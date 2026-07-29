---
kind: ai-suggestion
status: draft
confidence: high
topic: delivery
created_at: 2026-07-29
---

# Continue with the remaining 5 original suggestions

## Observation

The suggestion queue contains 9 items, but 5 are the original post-epic cleanup items:

1. `add-e2e-tests-for-new-commands.md`
2. `implement-suggestion-confidence-decay.md`
3. `review-constraints-after-epic-delivery.md`
4. `review-top-link-suggestions.md`
5. `verify-extension-reloads-after-pr-13.md`

The other 4 are newer meta-suggestions from the last few runs.

## Why now

The original 5 suggestions represent the real remaining work. Acting on them clears the queue and moves the project out of the post-delivery cleanup phase.

## Suggested action

1. Create a focused PR for the highest-confidence subset:
   - Review constraints after epic delivery.
   - Verify extension reloads after PR #13 (start a fresh pi session).
   - Add e2e tests for at least the non-agent commands.
2. Keep `implement-suggestion-confidence-decay.md` and `review-top-link-suggestions.md` as lower-priority follow-ups.
3. Delete acted-on suggestions.

## Sources

- `wiki/brain/ai-suggestions/refinement/`
