---
kind: ai-suggestion
status: draft
confidence: medium
topic: docs
created_at: 2026-07-30
---

# Add a LICENSE file

## Observation

`package.json` declares the package as `MIT`, but there is no `LICENSE` file in the repository root. npm and GitHub both prefer a dedicated license file for clarity.

## Why now

A LICENSE file completes the package metadata and is expected by npm's license detection.

## Suggested action

1. Add a `LICENSE` file with the MIT license text and the author's name.
2. Verify `npm pack --dry-run` includes the file.

## Sources

- `package.json`
