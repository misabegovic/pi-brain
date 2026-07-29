---
kind: ai-suggestion
status: draft
confidence: high
topic: release
created_at: 2026-07-29
---

# Publish v0.3.3 to npm and close the suggestion

## Observation

v0.3.3 is tagged and released on GitHub. The npm registry still shows the previous version. The existing suggestion file has been pending for multiple refinement passes.

## Why now

Publishing completes the v0.3.3 release cycle and lets the suggestion queue close the loop.

## Suggested action

1. Run `npm publish --otp=<code>` on `main`.
2. Verify at https://www.npmjs.com/package/@misabegovic/pi-brain.
3. Delete `wiki/brain/ai-suggestions/refinement/publish-v0-3-3-to-npm.md`.
4. Regenerate the wiki index.

## Sources

- `package.json`
- `wiki/brain/ai-suggestions/refinement/publish-v0-3-3-to-npm.md`
- https://github.com/misabegovic/pi-brain/releases/tag/v0.3.3
