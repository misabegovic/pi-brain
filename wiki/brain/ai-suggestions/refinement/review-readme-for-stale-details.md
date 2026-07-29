---
kind: ai-suggestion
status: draft
confidence: low
topic: docs
created_at: 2026-07-29
---

# Review README for stale or missing details

## Observation

`README.md` has grown through multiple iterations. Some sections may be stale, duplicated, or missing references to new commands and the `npm run validate` workflow.

## Why now

The README is the first thing visitors see. Keeping it accurate improves trust and onboarding.

## Suggested action

1. Read `README.md` end-to-end.
2. Update command lists to match the current extension surface.
3. Ensure the "Validate" section is discoverable.
4. Remove any duplicated or outdated claims.
5. Run `npm run validate` after edits.

## Sources

- `README.md`
- `extensions/pi-brain/commands.ts`
