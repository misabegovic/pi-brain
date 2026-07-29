---
kind: ai-suggestion
status: draft
confidence: low
topic: links
created_at: 2026-07-29
---

# Review top `brain_links` suggestions for missing cross-links

## Observation

`brain_links` reports 313 suggestions — pairs of pages that share neighbors but do not link to each other. With dead links at zero, these are the only remaining link-quality signals.

## Why now

Adding legitimate cross-links improves discoverability and reduces orphan risk for future pages.

## Suggested action

1. Inspect the top 20 suggestions in `wiki/_state/links.json`.
2. For each suggestion, decide if a direct link is warranted.
3. Add markdown links or frontmatter `related` entries where appropriate.
4. Ignore pairs that are already sufficiently connected through hubs.

## Sources

- `wiki/_state/links.json`
- `wiki/brain/ai-suggestions/refinement/review-top-link-suggestions.md`
