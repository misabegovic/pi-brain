---
kind: ai-suggestion
status: draft
confidence: low
topic: release
created_at: 2026-07-29
---

# Run `npm pack --dry-run` before publishing

## Observation

Before publishing v0.3.3 to npm, it is worth verifying the package contents to ensure no unintended files are included and all required pi resources are present.

## Why now

A dry run catches packaging mistakes (wrong files, missing extension entry, oversized tarball) before the irreversible publish step.

## Suggested action

1. Run `npm pack --dry-run` on `main`.
2. Inspect the listed files for:
   - `extensions/pi-brain/index.ts`,
   - `skills/`, `prompts/`, `themes/`,
   - `tools/`,
   - no secrets or oversized assets.
3. Adjust `.gitignore`, `.npmignore`, or `package.json` `files` if needed.
4. Proceed to `npm publish --otp=<code>` once clean.

## Sources

- `package.json`
- `.gitignore`
