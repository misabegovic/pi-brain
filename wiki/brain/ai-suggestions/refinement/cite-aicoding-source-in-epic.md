---
kind: ai-suggestion
status: draft
confidence: low
topic: citations
created_at: 2026-07-29
---

# Cite the fetched aicoding source in the regenerative-intent epic

## Observation

The aicoding.leaflet.pub source has been fetched and saved to `sources/web/2026-07-28--aicoding-leaflet-pub.md`. The regenerative-intent epic discusses spec-driven development and regenerating code from intent, but it does not explicitly cite this source.

## Why now

The source is now readable and contains strong external evidence for the epic's north star. Adding a citation improves traceability and makes the decision record stronger.

## Suggested action

1. Open `wiki/brain/epics/regenerative-intent.md`.
2. Add the aicoding source to the `sources:` frontmatter list.
3. Add an inline citation near the north-star or spec-driven development claim.
4. Run `brain_sync`.

## Sources

- `sources/web/2026-07-28--aicoding-leaflet-pub.md`
- `wiki/brain/epics/regenerative-intent.md`
