---
kind: ai-suggestion
status: draft
confidence: low
topic: sources
created_at: 2026-07-29
---

# Resolve the aicoding.leaflet.pub source

## Observation

`sources/web/2026-07-28--aicoding-leaflet-pub.md` remains unfetched. It is cited implicitly by the north-star inbox item and the regenerative-intent epic, but readers cannot verify the claim because the source body is empty.

## Why now

Records for the regenerative-intent bets are now complete. The only remaining traceability gap for the epic's external evidence is this source.

## Suggested action

1. Attempt to fetch `https://aicoding.leaflet.pub/` again using `curl` or a browser.
2. If successful, update the source file body with the fetched content.
3. If unsuccessful, either:
   - Replace the citation with a human summary of the page's argument, or
   - Remove the external citation and rely on internal reasoning in the epic.

## Sources

- [sources/web/2026-07-28--aicoding-leaflet-pub.md](../../../../sources/web/2026-07-28--aicoding-leaflet-pub.md)
- [wiki/brain/epics/regenerative-intent.md](../../../epics/regenerative-intent.md)
