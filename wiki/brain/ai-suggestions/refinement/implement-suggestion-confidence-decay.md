---
kind: ai-suggestion
status: draft
confidence: low
topic: protocol
created_at: 2026-07-29
---

# Implement confidence decay or TTL for AI suggestions

## Observation

AI suggestions accumulate in `wiki/brain/ai-suggestions/refinement/` without an automatic expiration or promotion mechanism. Suggestions like `mark-epic-accepted-and-record-pr-13.md` remain open across multiple refinement runs, creating noise.

## Why now

A manual queue can grow indefinitely. Adding a lightweight freshness rule would force grooming and prevent suggestion rot.

## Suggested action

1. Extend the autonomous refinement protocol to:
   - Check the existing suggestion count before generating new ones.
   - If the count is >5, produce only a single "groom queue" suggestion and stop.
   - Optionally mark suggestions older than 7 days as `status: stale`.
2. Update `extensions/pi-brain/refinement.ts` and the ADR/PRD if needed.
3. Shape an ADR if this is a structural protocol change.

## Sources

- `extensions/pi-brain/refinement.ts`
- `wiki/brain/adrs/autonomous-refinement-protocol.md`
