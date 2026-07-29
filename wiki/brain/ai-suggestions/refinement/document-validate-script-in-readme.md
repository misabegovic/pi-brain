---
kind: ai-suggestion
status: draft
confidence: low
topic: docs
created_at: 2026-07-29
---

# Document `npm run validate` in README

## Observation

`package.json` now has a `validate` script, but `README.md` does not mention it. New contributors may not know the single command for full local validation.

## Why now

Documenting the script lowers the barrier to contribution and keeps validation consistent.

## Suggested action

1. Add a "Validate" or "Development" section to `README.md`.
2. Mention `npm install` and `npm run validate`.
3. Briefly explain what the script checks (TypeScript, tests, sync, links).

## Sources

- `package.json`
- `README.md`
