---
kind: ai-suggestion
status: draft
confidence: low
topic: links
created_at: 2026-07-29
---

# Review top ten `brain_links` suggestions

## Observation

`brain_links` reports 313 suggestions. The top suggestions represent high-value missing cross-links between closely related pages.

## Why now

With dead links and orphans at zero, link quality is the last remaining corpus-health signal to act on.

## Suggested action

1. Read the top 10 suggestions from `wiki/_state/links.json`.
2. For each pair, decide if a direct link improves discoverability.
3. Add markdown links or frontmatter `related` entries.
4. Run `npm run validate` to confirm no dead links were introduced.

## Sources

- `wiki/_state/links.json`
