---
kind: ai-suggestion
status: draft
confidence: low
topic: inbox
created_at: 2026-07-29
---

# Tend the three queued inbox items now that PR #12 has merged

## Observation

The inbox still contains 3 unprocessed items from 2026-07-28:

1. `auto-ingest-batch` — auto-ingested source `https://aicoding.leaflet.pub/`.
2. `user-asserts-pi-brain-s-north-star-should-be-spe` — north-star assertion about spec-driven development.
3. `epic-expansion-regenerative-intent-now-also-incl` — epic expansion notes.

## Why now

PR #12 is merged, so the context for these items has changed. They can now be resolved against shipped reality rather than open design work.

## Suggested action

Run `/brain:tend` and decide for each item:
- **auto-ingest-batch**: Synthesize the aicoding source or archive if the content cannot be retrieved.
- **north-star insight**: Shape into a short ADR/PRD or add a "North star" section to the regenerative-intent epic if it is still missing.
- **epic-expansion**: Archive if the epic already covers the topics; otherwise, capture as a follow-up bet or constraint amendment.

## Sources

- [wiki/_state/inbox.md](../../../_state/inbox.md)
- [wiki/brain/epics/regenerative-intent.md](../../../epics/regenerative-intent.md)
