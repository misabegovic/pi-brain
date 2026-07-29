---
kind: ai-suggestion
status: draft
confidence: low
topic: config
created_at: 2026-07-29
---

# Audit `LOCAL_FIRST` in gitignored `.env`

## Observation

`.env.example` sets `LOCAL_FIRST="false"` for the product repo, but `.env` is gitignored. A stale `.env` on the maintainer's machine could still say `LOCAL_FIRST=true`, creating confusion with `remote-promotion-requires-pr`.

## Why now

Consistency between committed defaults and local environment prevents accidental local-first behavior in the PR-first product repo.

## Suggested action

1. Check the current value of `LOCAL_FIRST` in the local `.env`.
2. If it is `true`, update it to `false` and document why.
3. Consider adding a startup warning in the extension when `LOCAL_FIRST=true` in a product-repo context.

## Sources

- `.env.example`
- `wiki/brain/constraints/remote-promotion-requires-pr.md`
