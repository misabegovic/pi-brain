---
kind: ai-suggestion
status: draft
confidence: low
topic: tests
created_at: 2026-07-30
---

# Add tests for inbox helpers

## Observation

`extensions/pi-brain/inbox.ts` provides inbox parsing and formatting utilities. These are currently exercised only indirectly.

## Why now

Direct coverage for inbox helpers ensures the `/brain:tend` experience stays reliable.

## Suggested action

1. Add `tests/inbox.test.ts` covering inbox parsing, item extraction, and formatting helpers.
2. Verify behavior with active and archived items.
3. Include the test in `npm test`.

## Sources

- `extensions/pi-brain/inbox.ts`
