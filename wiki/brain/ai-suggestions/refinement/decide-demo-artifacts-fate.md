---
kind: ai-suggestion
status: draft
confidence: low
topic: cleanup
created_at: 2026-07-29
---

# Decide the fate of the demo ai-suggestions artifacts

## Observation

Demo outputs from validating `/brain:build` and `/brain:sync-code` remain in `wiki/brain/ai-suggestions/`:

- `build/types/generated.ts`
- `sync-code/types/*.md`

These were created as smoke-test outputs and were never reviewed as real proposals.

## Why now

The regenerative-intent epic is merged and recorded. Transient demo artifacts clutter the corpus and may confuse future refinement scans.

## Suggested action

Choose one of:
- **Delete** the artifacts if they were only for validation.
- **Promote** `build/types/generated.ts` to a real target if the generated types are useful, with a corresponding record update.
- **Resolve** the drift described in the sync-code proposals and then delete them.

After deciding, remove any related stale refinement suggestions.

## Sources

- `wiki/brain/ai-suggestions/build/types/generated.ts`
- `wiki/brain/ai-suggestions/sync-code/types/`
