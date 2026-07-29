---
kind: ai-suggestion
status: draft
confidence: low
topic: ci
created_at: 2026-07-29
---

# Add a GitHub Actions CI workflow for checks and tests

## Observation

`package.json` now has a `check` script (`tsc --noEmit`) and the repo has `tests/load.test.ts` and `tests/integration.test.ts`. These checks currently run only manually. There is no `.github/workflows/ci.yml`.

## Why now

PR-first workflow is now active. A CI workflow ensures that PRs cannot merge with type errors or broken tests, reducing reliance on the agent remembering to run checks locally.

## Suggested action

1. Create `.github/workflows/ci.yml` that runs on PRs and pushes to `main`:
   - `npm ci`
   - `npm run check`
   - `npm test` (add a `test` script to `package.json` that runs both test files)
2. Add the `test` script to `package.json`.
3. Verify the workflow passes on this branch.

## Sources

- `package.json`
- `tsconfig.json`
- `tests/load.test.ts`
- `tests/integration.test.ts`
