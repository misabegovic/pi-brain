---
kind: ai-suggestion
status: draft
confidence: low
topic: tests
created_at: 2026-07-30
---

# Add an integration test for brain-ingest-repo

## Observation

`tools/brain-ingest-repo.mjs` onboards an external repository as a maintained project. It has no automated test.

## Why now

This tool scaffolds wiki metadata; a regression would produce malformed project pages.

## Suggested action

1. Add `tests/brain-ingest-repo.test.ts` that runs `node tools/brain-ingest-repo.mjs <temp-repo> <scope>`.
2. Verify it creates `wiki/<scope>/projects/<repo>.md` and `sources/<scope>/README.md`.
3. Clean up the temporary repo after the test.
4. Include the test in `npm test`.

## Sources

- `tools/brain-ingest-repo.mjs`
