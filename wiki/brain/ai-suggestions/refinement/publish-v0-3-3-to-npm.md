---
kind: ai-suggestion
status: draft
confidence: high
topic: release
created_at: 2026-07-29
---

# Publish v0.3.3 to npm

## Observation

v0.3.3 is tagged and released on GitHub. The package is ready but has not been published to npm because the account requires a one-time password.

## Why now

This is the only remaining release blocker. Once published, users can install the new version.

## Suggested action

1. Obtain the OTP from the authenticator app.
2. Run `npm publish --otp=<code>` on `main`.
3. Verify at https://www.npmjs.com/package/@misabegovic/pi-brain.

## Sources

- `package.json`
- https://github.com/misabegovic/pi-brain/releases/tag/v0.3.3
