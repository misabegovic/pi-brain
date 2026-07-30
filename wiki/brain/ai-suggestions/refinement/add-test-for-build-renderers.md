---
kind: ai-suggestion
status: draft
confidence: low
topic: tests
created_at: 2026-07-30
---

# Add a test for build renderers

## Observation

`extensions/pi-brain/build-renderers.ts` turns intent blocks into generated code. It has no dedicated test, so regressions in generated output could slip through.

## Why now

`/brain:build` is a headline feature; its renderers deserve direct coverage.

## Suggested action

1. Add `tests/build-renderers.test.ts` that imports the renderers and passes sample `data_model` and `api_surface` blocks.
2. Verify the generated TypeScript contains expected interfaces and function stubs.
3. Include the test in `npm test`.

## Sources

- `extensions/pi-brain/build-renderers.ts`
- `tests/intent-blocks.test.ts`
