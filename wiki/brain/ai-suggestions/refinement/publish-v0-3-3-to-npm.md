---
kind: ai-suggestion
status: draft
confidence: high
topic: release
created_at: 2026-07-29
---

# Publish v0.3.3 to npm

## Observation

v0.3.3 is tagged and released on GitHub. The npm registry still lists the previous version because the publish step requires a one-time password.

## Why now

This is the final release step. Once published, the README npm badge and `pi install` will reflect the new version.

## Suggested action

1. Obtain the OTP from the authenticator app.
2. Run `npm publish --otp=<code>` on `main`.
3. Confirm at https://www.npmjs.com/package/@misabegovic/pi-brain.
4. Delete this suggestion after publish succeeds.

## Sources

- `package.json`
- https://github.com/misabegovic/pi-brain/releases/tag/v0.3.3
