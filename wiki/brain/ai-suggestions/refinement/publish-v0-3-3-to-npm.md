---
kind: ai-suggestion
status: draft
confidence: high
topic: release
created_at: 2026-07-30
---

# Publish v0.3.3 to npm

## Observation

v0.3.3 is tagged and released on GitHub. The npm registry still shows the previous version. This is the only remaining task before the 0.3.3 release line is complete.

## Why now

Publishing makes the latest fixes and commands available to users.

## Suggested action

1. Run `npm publish --otp=<code>` on `main`.
2. Verify at https://www.npmjs.com/package/@misabegovic/pi-brain.
3. Delete this suggestion after publish succeeds.

## Sources

- `package.json`
- https://github.com/misabegovic/pi-brain/releases/tag/v0.3.3
