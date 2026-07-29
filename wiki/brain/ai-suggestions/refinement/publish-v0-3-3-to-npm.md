---
kind: ai-suggestion
status: draft
confidence: high
topic: release
created_at: 2026-07-29
---

# Publish v0.3.3 to npm

## Observation

v0.3.3 has been tagged and released on GitHub, but `npm publish` failed because the npm account requires a one-time password (2FA).

## Why now

The GitHub release exists, but the package is not yet available on the npm registry. Users running `pi install @misabegovic/pi-brain` will still get v0.3.2.

## Suggested action

1. Obtain the OTP from the authenticator app.
2. Run `npm publish --otp=<code>` in the repo root.
3. Verify the new version appears on https://www.npmjs.com/package/@misabegovic/pi-brain.

## Sources

- `package.json`
- https://github.com/misabegovic/pi-brain/releases/tag/v0.3.3
