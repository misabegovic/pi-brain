---
kind: ai-suggestion
status: draft
confidence: low
topic: docs
created_at: 2026-07-29
---

# Add CONTRIBUTING.md

## Observation

The repo has `README.md` and `GETTING_STARTED.md`, but no contributor-facing guide for the PR-first workflow, pre-push hooks, and validation expectations.

## Why now

A CONTRIBUTING.md lowers friction for external contributors and documents the project's active constraints.

## Suggested action

1. Create `CONTRIBUTING.md` with:
   - PR-first workflow (`remote-promotion-requires-pr`).
   - How to run `npm run validate` locally.
   - Pre-commit and pre-push hooks.
   - ADR-before-structural-changes constraint.
   - How to capture decisions and update the inbox.
2. Link to it from `README.md`.

## Sources

- `README.md`
- `GETTING_STARTED.md`
- `wiki/brain/constraints/remote-promotion-requires-pr.md`
- `wiki/brain/constraints/adr-before-structural-changes.md`
