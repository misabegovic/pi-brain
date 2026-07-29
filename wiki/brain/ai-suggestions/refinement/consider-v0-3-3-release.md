---
kind: ai-suggestion
status: draft
confidence: low
topic: release
created_at: 2026-07-29
---

# Consider a v0.3.3 release

## Observation

Significant changes have landed since v0.3.2:

- Regenerative-intent epic delivered (9 new commands).
- Link graph fixed and TypeScript checks added.
- README, skills, and prompts updated.
- CI workflow added.
- `.env.example` added.

The current `package.json` version is still `0.3.2`.

## Why now

Cutting a release makes the new capabilities available to users who install `@misabegovic/pi-brain` and provides a version anchor for the template update path.

## Suggested action

1. Review changes since v0.3.2.
2. Decide whether the scope warrants v0.3.3 or v0.4.0.
3. If yes, follow the release process: bump version, tag, GitHub release, npm publish, and add `wiki/brain/records/version-0-3-3.md`.

## Sources

- `package.json`
- `wiki/brain/records/version-0-3-2.md`
- PR #12, PR #13, PR #19
