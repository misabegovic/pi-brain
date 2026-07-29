---
kind: ai-suggestion
status: draft
confidence: low
topic: sources
created_at: 2026-07-29
---

# Fetch or manually capture the aicoding.leaflet.pub source content

## Observation

`sources/web/2026-07-28--aicoding-leaflet-pub.md` is cited in the regenerative-intent epic as external evidence for spec-driven development, but its body still says:

> "Content could not be fetched automatically."

## Why now

The epic is merged. A cited source that cannot be read weakens the decision record and makes it impossible for future readers to verify the claim.

## Suggested action

1. Try re-fetching `https://aicoding.leaflet.pub/` with `/brain:connect` or a manual fetch.
2. If automated fetch still fails, manually summarize the page's argument and update the source file body.
3. If the source is no longer relevant, remove the citation from the epic and archive the source.

## Sources

- [sources/web/2026-07-28--aicoding-leaflet-pub.md](../../../../sources/web/2026-07-28--aicoding-leaflet-pub.md)
- [wiki/brain/epics/regenerative-intent.md](../../../epics/regenerative-intent.md)
