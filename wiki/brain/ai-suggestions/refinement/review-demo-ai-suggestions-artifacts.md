---
kind: ai-suggestion
status: draft
confidence: low
topic: cleanup
created_at: 2026-07-29
---

# Review or remove the demo ai-suggestions artifacts

## Observation

The validation runs on PR #12 left demo outputs in `wiki/brain/ai-suggestions/`:

- `build/types/generated.ts` — TypeScript generated from existing `data_model` blocks.
- `sync-code/types/*.md` — Drift proposals generated from comparing intent to the above file.

## Why now

These files were created as smoke-test outputs, not reviewed proposals. They now appear in the corpus and could be mistaken for intentional deliverables.

## Suggested action

1. Review `wiki/brain/ai-suggestions/build/types/generated.ts`. If it is useful as a real starting point, move it to a proper target repo or keep it with a clear record. If not, delete it.
2. Review the `sync-code/types/*.md` proposals. If the drift they describe should be resolved, resolve it; otherwise, delete the proposals.
3. Update the epic or records to mention whether these artifacts are intentional examples or transient test data.

## Sources

- [wiki/brain/ai-suggestions/build/types/generated.ts](../../../../ai-suggestions/build/types/generated.ts)
- [wiki/brain/ai-suggestions/sync-code/types/](../../../../ai-suggestions/sync-code/types/)
