---
kind: ai-suggestion
status: draft
confidence: low
topic: docs
created_at: 2026-07-29
---

# Add CHANGELOG.md

## Observation

The project has release tags and GitHub releases, but no `CHANGELOG.md` in the repository itself.

## Why now

A changelog in the repo gives users and contributors a quick, version-controlled summary of what changed in each release.

## Suggested action

1. Create `CHANGELOG.md` starting with v0.3.3:
   - regenerative-intent epic delivered,
   - new commands (`/brain:build`, `/brain:diff`, `/brain:sync-code`, etc.),
   - TypeScript checks, CI, tests,
   - link graph fixes,
   - pre-push hook.
2. Link to it from `README.md`.

## Sources

- `wiki/brain/records/version-0-3-3.md`
- https://github.com/misabegovic/pi-brain/releases/tag/v0.3.3
