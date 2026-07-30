---
kind: ai-suggestion
status: draft
confidence: low
topic: tests
created_at: 2026-07-30
---

# Add tests for revision and RFC formatting helpers

## Observation

`extensions/pi-brain/revise.ts` and `extensions/pi-brain/rfc-contribute.ts` contain formatting helpers for revision proposals and RFC contributions. These pure functions are easy to test in isolation.

## Why now

Formatting regressions would produce noisy or broken wiki output.

## Suggested action

1. Add `tests/revise.test.ts` covering revision proposal formatting.
2. Add `tests/rfc-contribute.test.ts` covering contribution formatting and appending.
3. Include both tests in `npm test`.

## Sources

- `extensions/pi-brain/revise.ts`
- `extensions/pi-brain/rfc-contribute.ts`
