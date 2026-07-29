---
kind: ai-suggestion
status: draft
confidence: low
topic: docs
created_at: 2026-07-29
---

# Verify README CI badge shows green

## Observation

`README.md` includes a CI badge for `.github/workflows/validate.yml`, but the actual workflow file is `.github/workflows/ci.yml`. The badge may point to a workflow that no longer exists or has a different name.

## Why now

A broken or red badge on the README undermines trust in the project.

## Suggested action

1. Check the badge URL in `README.md`.
2. Update it to point to `.github/workflows/ci.yml` if needed.
3. Confirm the badge renders as green after the CI workflow runs on `main`.

## Sources

- `README.md`
- `.github/workflows/ci.yml`
