---
kind: ai-suggestion
status: draft
confidence: low
topic: tests
created_at: 2026-07-30
---

# Add a test for search indexing

## Observation

`extensions/pi-brain/search.ts` provides corpus search used by several tools. It has no dedicated test.

## Why now

Search is a shared dependency; a regression would affect multiple commands.

## Suggested action

1. Add `tests/search.test.ts` that indexes a small temporary wiki and queries it.
2. Verify keyword search returns relevant pages and respects limits.
3. Include the test in `npm test`.

## Sources

- `extensions/pi-brain/search.ts`
