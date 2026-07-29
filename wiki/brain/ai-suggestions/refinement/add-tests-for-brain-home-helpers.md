---
kind: ai-suggestion
status: draft
confidence: low
topic: tests
created_at: 2026-07-29
---

# Add tests for brain-home helpers

## Observation

`extensions/pi-brain/brain-home.ts` provides core helpers like `findBrainHome`, `readAutonomy`, `readOrg`, and `countPages`. These are currently untested.

## Why now

Reliable brain-home discovery and state reading are foundational to every command and tool.

## Suggested action

1. Add `tests/brain-home.test.ts` covering:
   - `findBrainHome` finds a home from a directory containing `wiki` + `brain.config.yml`.
   - `findBrainHome` respects `PI_BRAIN_HOME`.
   - `readAutonomy` returns enabled false when file is missing.
   - `readOrg` falls back to "pi-brain" when config is missing.
   - `countPages` excludes `_state/` files.
2. Include the test in `npm test`.

## Sources

- `extensions/pi-brain/brain-home.ts`
- `tests/autonomy.test.ts`
