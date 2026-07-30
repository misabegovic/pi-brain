---
kind: ai-suggestion
status: draft
confidence: low
topic: tests
created_at: 2026-07-30
---

# Add a test for drift detection

## Observation

`extensions/pi-brain/diff.ts` compares intent blocks to target files and reports drift. This logic is currently exercised only indirectly through `tests/commands.test.ts`.

## Why now

Direct coverage makes drift-reporting behavior explicit and prevents regressions.

## Suggested action

1. Add `tests/diff.test.ts` covering:
   - matching intent and target report no drift,
   - missing field in target reports drift,
   - extra field in target reports drift.
2. Include the test in `npm test`.

## Sources

- `extensions/pi-brain/diff.ts`
- `tests/commands.test.ts`
