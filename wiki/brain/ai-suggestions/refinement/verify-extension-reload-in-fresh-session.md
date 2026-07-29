---
kind: ai-suggestion
status: draft
confidence: medium
topic: runtime
created_at: 2026-07-29
---

# Verify extension reload in a fresh pi session

## Observation

PR #13 fixed `extensions/pi-brain/views.ts` so `brain_sync` generates `index.md` links relative to `wiki/`. This fix is on disk, but the current long-running pi session loaded the extension before the fix and still emits `wiki/brain/...` prefixes when `/brain:sync` runs inside pi.

## Why now

Before the fix can be trusted, it needs to be verified in a fresh session.

## Suggested action

1. Start a new pi session in this clone.
2. Run `/brain:sync`.
3. Inspect `wiki/index.md` and confirm links use `brain/...md`, not `wiki/brain/...md`.
4. Run `/brain:links` and confirm 0 dead links.
5. Delete `verify-extension-reload-in-fresh-session.md` if the test passes.

## Sources

- `extensions/pi-brain/views.ts`
- PR #13: https://github.com/misabegovic/pi-brain/pull/13
