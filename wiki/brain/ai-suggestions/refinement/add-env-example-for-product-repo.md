---
kind: ai-suggestion
status: draft
confidence: low
topic: onboarding
created_at: 2026-07-29
---

# Add `.env.example` for the product repo

## Observation

`.env` is gitignored and currently contains `LOCAL_FIRST="true"`. The active constraint `remote-promotion-requires-pr` requires PRs for `main`, which conflicts with the local-first default. Because `.env` is not committed, new clones inherit no guidance on the expected workflow.

## Why now

The product repo is PR-first. A committed `.env.example` makes that explicit for contributors and reduces the chance of an agent defaulting to direct `main` pushes.

## Suggested action

1. Create `.env.example` with `LOCAL_FIRST=false` and a comment explaining the PR-first workflow.
2. Optionally update `README.md` or `AGENTS.md` to reference `.env.example`.
3. Do **not** modify the real `.env` (it is gitignored and per-clone).

## Sources

- `.env`
- `wiki/brain/constraints/remote-promotion-requires-pr.md`
