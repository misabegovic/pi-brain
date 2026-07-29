---
kind: ai-suggestion
status: draft
confidence: low
topic: tests
created_at: 2026-07-29
---

# Add tests for autonomy trust levels

## Observation

`extensions/pi-brain/autonomy.ts` implements trust-level logic (`silent`, `notify`, `ask`, `blocked`) for operations like sync, groom, refine, suggest, shelves, commits, and code. This logic is currently untested.

## Why now

Trust levels gate autonomous behavior. Tests prevent accidental regressions that could cause the agent to act without approval.

## Suggested action

1. Add `tests/autonomy.test.ts` covering:
   - `shouldProceed` returns true for `silent`/`notify`, false for `ask`/`blocked`.
   - `shouldNotify` returns true for `notify`/`ask`, false for `silent`/`blocked`.
   - `getTrustLevel` falls back to defaults when config is missing.
2. Include the test in `npm test`.

## Sources

- `extensions/pi-brain/autonomy.ts`
- `tests/refinement.test.ts`
