---
kind: ai-suggestion
status: draft
confidence: medium
topic: tests
created_at: 2026-07-29
---

# Add a test for the suggestion TTL gate

## Observation

`extensions/pi-brain/refinement.ts` now skips the refinement trigger when more than 5 suggestions are queued. This behavior is not covered by tests.

## Why now

A test prevents accidental regression of the queue-throttle logic and documents the intended behavior.

## Suggested action

1. Add a test in `tests/` that creates a temporary brain home with 6 suggestion files.
2. Trigger the `agent_settled` event on a mock API and verify `sendMessage` is not called.
3. Remove suggestion files until 5 remain and verify `sendMessage` is called.

## Sources

- `extensions/pi-brain/refinement.ts`
- `tests/commands.test.ts`
