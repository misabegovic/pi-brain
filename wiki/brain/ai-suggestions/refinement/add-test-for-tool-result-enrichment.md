---
kind: ai-suggestion
status: draft
confidence: low
topic: tests
created_at: 2026-07-30
---

# Add a test for tool-result enrichment

## Observation

`extensions/pi-brain/tool-result-enrichment.ts` enriches tool outputs with related wiki pages. It has no dedicated test.

## Why now

Enrichment affects what the agent sees after tool calls; regressions are subtle.

## Suggested action

1. Add `tests/tool-result-enrichment.test.ts` covering:
   - enrichment disabled returns original result,
   - enrichment finds related pages for a given tool output,
   - large outputs are truncated before enrichment.
2. Include the test in `npm test`.

## Sources

- `extensions/pi-brain/tool-result-enrichment.ts`
