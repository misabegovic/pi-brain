---
kind: ai-suggestion
status: draft
confidence: low
topic: tests
created_at: 2026-07-29
---

# Add a test for the standalone `brain-links` tool

## Observation

`tools/brain-links.mjs` is part of `npm run validate`, but it has no dedicated test. A regression in link resolution could break validation without a targeted test catching it.

## Why now

The tool was recently fixed and is now load-bearing for corpus health.

## Suggested action

1. Add `tests/brain-links.test.ts` that runs `node tools/brain-links.mjs` against a temporary brain home.
2. Verify the output reports 0 dead links and 0 orphans for a clean corpus.
3. Optionally verify it detects a deliberately broken link.

## Sources

- `tools/brain-links.mjs`
- `tests/brain-home.test.ts`
