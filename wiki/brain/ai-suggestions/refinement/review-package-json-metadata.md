---
kind: ai-suggestion
status: draft
confidence: low
topic: tooling
created_at: 2026-07-30
---

# Review package.json metadata

## Observation

`package.json` currently lacks `homepage`, `bugs`, and `repository` fields. These fields improve discoverability on npm and link the package back to the source repo.

## Why now

Filling in metadata is a small polish item that makes the published package look complete.

## Suggested action

1. Add `homepage` pointing to the GitHub repo.
2. Add `bugs` pointing to the GitHub issues page.
3. Add `repository` with `type: "git"` and the repo URL.
4. Verify `npm pack --dry-run` still succeeds.

## Sources

- `package.json`
