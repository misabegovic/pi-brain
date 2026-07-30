---
kind: ai-suggestion
status: draft
confidence: low
topic: tests
created_at: 2026-07-30
---

# Add tests for context injection and harvest helpers

## Observation

`extensions/pi-brain/context-injection.ts` and `extensions/pi-brain/compaction-harvest.ts` are part of the autonomous maintenance surface but have no dedicated tests.

## Why now

These modules affect what the agent sees and what gets archived; regressions are hard to detect without tests.

## Suggested action

1. Add `tests/context-injection.test.ts` covering record selection based on query relevance.
2. Add `tests/compaction-harvest.test.ts` covering inbox/archived item scoring and selection.
3. Include both tests in `npm test`.

## Sources

- `extensions/pi-brain/context-injection.ts`
- `extensions/pi-brain/compaction-harvest.ts`
