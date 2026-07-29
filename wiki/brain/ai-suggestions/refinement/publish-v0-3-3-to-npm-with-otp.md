---
kind: ai-suggestion
status: draft
confidence: high
topic: release
created_at: 2026-07-29
---

# Publish v0.3.3 to npm with OTP

## Observation

v0.3.3 has been tagged and released on GitHub. The npm publish attempt failed because the account requires a one-time password. This is the only remaining blocker for the release.

## Why now

The package is otherwise ready. Publishing makes the new commands and fixes available to users.

## Suggested action

1. Obtain the OTP from the authenticator app.
2. Run `npm publish --otp=<code>` in the repo root on `main`.
3. Verify the version on https://www.npmjs.com/package/@misabegovic/pi-brain.
4. Delete this suggestion after publish succeeds.

## Sources

- `package.json`
- https://github.com/misabegovic/pi-brain/releases/tag/v0.3.3
- `wiki/brain/ai-suggestions/refinement/publish-v0-3-3-to-npm.md`
