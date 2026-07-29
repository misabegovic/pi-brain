---
kind: ai-suggestion
status: draft
confidence: low
topic: links
created_at: 2026-07-29
---

# Review top `brain_links` suggestions for missing cross-links

## Observation

`brain_links` currently reports 313 suggestions — pairs of pages that share neighbors but do not link to each other. Many are likely noise, but the top suggestions may reveal real missing cross-links (e.g., between the regenerative-intent epic and its child records, or between related ADRs and records).

## Why now

With dead links at zero, the next link-quality improvement is adding legitimate cross-links that the graph algorithm has surfaced.

## Suggested action

1. Inspect the top 20 suggestions in `wiki/_state/links.json`.
2. For each suggestion, decide if a direct link is warranted.
3. Add markdown links or frontmatter `related` entries where appropriate.
4. Ignore pairs that are already sufficiently connected through hubs.

## Sources

- `wiki/_state/links.json`
