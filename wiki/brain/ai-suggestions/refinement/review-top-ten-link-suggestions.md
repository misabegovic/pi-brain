---
kind: ai-suggestion
status: draft
confidence: low
topic: links
created_at: 2026-07-29
---

# Review top ten `brain_links` suggestions

## Observation

`brain_links` reports 313 suggestions. These are non-dead, non-orphan opportunities for cross-linking. The top suggestions are likely the highest-value ones.

## Why now

Adding a few well-chosen cross-links improves corpus navigability without generating noise.

## Suggested action

1. Read `wiki/_state/links.json` and extract the top 10 suggestions.
2. For each pair, decide whether a direct link makes sense.
3. Add markdown links or frontmatter `related` entries.
4. Run `npm run validate` to confirm no dead links were introduced.

## Sources

- `wiki/_state/links.json`
