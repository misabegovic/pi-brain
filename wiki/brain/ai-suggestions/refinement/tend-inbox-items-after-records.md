---
kind: ai-suggestion
status: draft
confidence: low
topic: inbox
created_at: 2026-07-29
---

# Tend the three queued inbox items now that records exist

## Observation

The inbox still contains 3 unprocessed items from 2026-07-28. Records for all nine regenerative-intent bets have now been created, so the product context for these items has stabilized.

## Why now

Stale inbox items lose relevance quickly. The auto-ingest batch, north-star assertion, and epic-expansion notes can now be triaged against the shipped state rather than the in-flight design.

## Suggested action

Run `/brain:tend` and decide for each item:
- **auto-ingest-batch**: Synthesize the aicoding source if content can be retrieved; otherwise archive.
- **north-star insight**: If the regenerative-intent epic already captures the spec-driven north star, update the epic citation and archive the item; otherwise shape it into a short ADR.
- **epic-expansion**: The epic already covers collaboration, colleague mode, and background tasks. Archive the item and, if needed, open a follow-up bet for pi-extension background-task research.

## Sources

- `wiki/brain/_state/inbox.md`
- `wiki/brain/records/`
