---
kind: ai-suggestion
status: draft
confidence: low
topic: tests
created_at: 2026-07-30
---

# Add a test for the pre-commit hook

## Observation

`tools/git-hooks/pre-commit` runs `tools/brain-sync.mjs` before each commit. A dedicated test would catch regressions in the hook behavior.

## Why now

Both the pre-push and pre-commit hooks are now part of the local workflow. The pre-push hook is tested; pre-commit is not.

## Suggested action

1. Add `tests/pre-commit-hook.test.ts` that runs the pre-commit hook in a temporary git repo.
2. Verify the hook executes `node tools/brain-sync.mjs` and exits 0 when sync succeeds.
3. Include the test in `npm test`.

## Sources

- `tools/git-hooks/pre-commit`
- `tests/pre-push-hook.test.ts`
