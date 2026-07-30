---
kind: ai-suggestion
status: draft
confidence: low
topic: tests
created_at: 2026-07-30
---

# Add a test for brain-projects lister

## Observation

`tools/brain-projects.mjs` lists onboarded projects from `brain.config.yml`. It is a small tool with no dedicated test.

## Why now

It is one of the last simple tools without coverage.

## Suggested action

1. Add `tests/brain-projects.test.ts` that runs `node tools/brain-projects.mjs` against a temporary brain home.
2. Verify it lists the `active_repos` from `brain.config.yml`.
3. Include the test in `npm test`.

## Sources

- `tools/brain-projects.mjs`
