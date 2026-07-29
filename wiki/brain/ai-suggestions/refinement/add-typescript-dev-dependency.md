---
kind: ai-suggestion
status: draft
confidence: low
topic: tooling
created_at: 2026-07-29
---

# Add TypeScript as a dev dependency for strict checks

## Observation

The extension code is written in TypeScript, but `typescript` is not listed in `devDependencies`. Running `npx tsc` fails because the package is not installed. Strict checks (including `noUnusedLocals` and `noUnusedParameters`) were performed manually during PR #12, but there is no repeatable CI step.

## Why now

Without a local TypeScript compiler, regressions in type safety are easy to miss. Adding `typescript` and a `tsc` script makes validation repeatable and paves the way for CI.

## Suggested action

1. Add `typescript` to `devDependencies` in `package.json`.
2. Add a `tsconfig.json` with `strict`, `noUnusedLocals`, and `noUnusedParameters` enabled.
3. Add a `check` script to `package.json` that runs `tsc --noEmit`.
4. Fix any new TypeScript errors that appear.

## Sources

- `package.json`
- `extensions/pi-brain/`
