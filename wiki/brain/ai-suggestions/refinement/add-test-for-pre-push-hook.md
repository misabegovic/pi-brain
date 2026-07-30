---
kind: ai-suggestion
status: draft
confidence: low
topic: tests
created_at: 2026-07-29
---

# Add a test for the pre-push hook

## Observation

`tools/git-hooks/pre-push` now blocks direct pushes to `main`, but the hook logic is not covered by automated tests.

## Why now

A test ensures the hook continues to block main pushes and allows overrides as intended.

## Suggested action

1. Add `tests/pre-push-hook.test.ts` that executes the hook shell script with mock stdin.
2. Verify exit code 1 when pushing to `refs/heads/main` without `ALLOW_MAIN_PUSH`.
3. Verify exit code 0 when pushing to a feature branch or when `ALLOW_MAIN_PUSH=1`.

## Sources

- `tools/git-hooks/pre-push`
- `tests/autonomy.test.ts`
