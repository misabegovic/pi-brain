---
kind: ai-suggestion
status: draft
confidence: low
topic: runtime
created_at: 2026-07-29
---

# Verify the pi extension reloads the PR #13 view fix

## Observation

PR #13 fixed `extensions/pi-brain/views.ts` so `brain_sync` generates `index.md` links relative to `wiki/`. However, the current pi session appears to still load the pre-fix version of the extension, causing `brain_sync` via the pi tool to emit `wiki/brain/...` prefixes that `brain_links` reports as dead links. The standalone `node tools/brain-sync.mjs` produces the correct output.

## Why now

If the fix does not take effect on extension reload, users will see dead links every time they run `/brain:sync` inside pi, despite the on-disk code being correct.

## Suggested action

1. Start a fresh pi session in this clone.
2. Run `/brain:sync`.
3. Inspect `wiki/index.md` — links should be `brain/...md`, not `wiki/brain/...md`.
4. Run `/brain:links` and confirm 0 dead links.
5. If the issue persists, investigate whether pi is caching the extension or loading it from a different path.

## Sources

- `extensions/pi-brain/views.ts`
- PR #13: https://github.com/misabegovic/pi-brain/pull/13
