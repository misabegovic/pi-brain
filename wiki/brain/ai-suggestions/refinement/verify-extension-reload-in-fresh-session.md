---
kind: ai-suggestion
status: draft
confidence: medium
topic: runtime
created_at: 2026-07-29
---

# Verify extension reload in a fresh pi session

## Observation

PR #13 fixed `extensions/pi-brain/views.ts` so `brain_sync` generates `index.md` links relative to `wiki/`. The current long-running pi session still loads the pre-fix extension, so the in-tool `brain_sync` emits `wiki/brain/...` prefixes. This has been flagged in multiple refinement runs.

## Why now

With CI green and the queue being groomed, this is the right time to confirm the fix works in a fresh session.

## Suggested action

1. Start a new pi session in this clone.
2. Run `/brain:sync`.
3. Check that `wiki/index.md` links use `brain/...md` (not `wiki/brain/...md`).
4. Run `/brain:links` and confirm 0 dead links.
5. Update or delete `verify-extension-reloads-after-pr-13.md` based on the result.

## Sources

- `extensions/pi-brain/views.ts`
- `wiki/brain/ai-suggestions/refinement/verify-extension-reloads-after-pr-13.md`
