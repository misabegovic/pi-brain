---
kind: ai-suggestion
status: draft
confidence: low
topic: sources
created_at: 2026-07-29
---

# Fetch or manually capture the aicoding.leaflet.pub content

## Observation

The source `sources/web/2026-07-28--aicoding-leaflet-pub.md` is referenced in the regenerative-intent epic, but its body says:

> "Content could not be fetched automatically."

The URL is the user's evidence for the "spec-driven development / code regenerable from specs" north-star assertion.

## Why now

Without the actual content, the epic cites a source that cannot be verified or quoted. This weakens traceability.

## Suggested action

1. Try fetching `https://aicoding.leaflet.pub/` again with `/brain:connect` or a manual tool.
2. If fetching still fails, capture a human summary of the page's argument in a new source file or in the existing source's body.
3. Update the epic's citation if the source changes.

## Sources

- [sources/web/2026-07-28--aicoding-leaflet-pub.md](../../../../sources/web/2026-07-28--aicoding-leaflet-pub.md)
- [wiki/brain/epics/regenerative-intent.md](../../../epics/regenerative-intent.md)
