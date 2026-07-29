---
kind: ai-suggestion
status: draft
confidence: low
topic: protocol
created_at: 2026-07-29
---

# Implement lightweight suggestion TTL

## Observation

The recent queue growth to 23 suggestions showed that the autonomous refinement protocol can produce backlog faster than it is cleared. A confidence-decay or TTL mechanism would prevent suggestion rot.

## Why now

The queue is now small (3–9 items), but without a freshness rule it could balloon again.

## Suggested action

1. Decide on a simple rule, e.g.:
   - Suggestions older than 14 days are marked `status: stale`.
   - The refinement protocol skips generating new suggestions if the queue has >5 items.
2. Implement the rule in `extensions/pi-brain/refinement.ts`.
3. Add a test or update the ADR/PRD to document the behavior.

## Sources

- `extensions/pi-brain/refinement.ts`
- `wiki/brain/adrs/autonomous-refinement-protocol.md`
