---
kind: ai-suggestion
status: draft
confidence: low
topic: tests
created_at: 2026-07-30
---

# Add tests for remaining standalone tools

## Observation

`tools/brain-sync.mjs` and `tools/brain-state.mjs` are part of `npm run validate` but have no dedicated tests. A regression in either could break the validation workflow.

## Why now

With the core feature work complete, increasing tool test coverage is a safe 0.3.3 improvement.

## Suggested action

1. Add `tests/brain-sync.test.ts` that runs `node tools/brain-sync.mjs` against a temporary brain home and verifies it reports no validation errors.
2. Add `tests/brain-state.test.ts` that runs `node tools/brain-state.mjs <scope>` and verifies it regenerates `wiki/<scope>/state.md` without overwriting custom content.
3. Include both tests in `npm test`.

## Sources

- `tools/brain-sync.mjs`
- `tools/brain-state.mjs`
- `tests/brain-links.test.ts`
