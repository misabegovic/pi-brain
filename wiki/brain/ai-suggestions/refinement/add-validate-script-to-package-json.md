---
kind: ai-suggestion
status: draft
confidence: low
topic: tooling
created_at: 2026-07-29
---

# Add a `validate` script to package.json

## Observation

The repo has `npm run check` (TypeScript) and `npm test`, but no single script runs the pi-brain-specific validation tools (`brain-sync` and `brain-links`). Contributors must remember to run them manually.

## Why now

A single `npm run validate` script makes local validation consistent with CI and reduces the chance of merging with link errors.

## Suggested action

1. Add to `package.json` scripts:
   ```json
   "validate": "node tools/brain-sync.mjs && node tools/brain-links.mjs"
   ```
2. Update `.github/workflows/ci.yml` to run `npm run validate`.
3. Update `skills/brain-setup/SKILL.md` to mention `npm run validate`.

## Sources

- `package.json`
- `.github/workflows/ci.yml`
- `skills/brain-setup/SKILL.md`
