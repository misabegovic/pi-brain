---
kind: ai-suggestion
status: draft
confidence: low
topic: workflow
created_at: 2026-07-29
---

# Add a pre-push hook to prevent direct pushes to main

## Observation

A recent accidental direct push to `main` required a revert. The `remote-promotion-requires-pr` constraint is active, but there is no local enforcement.

## Why now

A local pre-push hook catches mistakes before they reach the remote, especially since the GitHub ruleset on `main` was removed.

## Suggested action

1. Add a pre-push hook in `.pi/hooks/pre-push` or `.github/hooks/pre-push`.
2. Reject pushes to `main` with a message directing the user to open a PR.
3. Allow overrides with an environment variable for emergencies.
4. Document the hook in `skills/brain-setup/SKILL.md`.

## Sources

- `wiki/brain/constraints/remote-promotion-requires-pr.md`
