---
kind: ai-suggestion
status: draft
confidence: low
topic: rfc
created_at: 2026-07-29
---

# Create a demo RFC to exercise `/brain:rfc-contribute`

## Observation

The `/brain:rfc-contribute` command is implemented and merged, but there are no RFCs in `wiki/brain/rfcs/` to run it against. The feature has not been exercised end-to-end in the actual wiki.

## Why now

Untested commands are risky. A lightweight demo RFC lets us verify that the command appends human and agent contributions correctly and that the output formatting is acceptable.

## Suggested action

1. Create a demo RFC at `wiki/brain/rfcs/demo-rfc.md` with a simple cross-cutting question (e.g., "Should pi-brain ship a default TUI theme?").
2. Add a human contribution and an agent contribution using `/brain:rfc-contribute`.
3. Optionally promote the RFC to a PRD/ADR via `/brain:shape` if it matures, or delete it if it was just a smoke test.

## Sources

- `wiki/brain/prds/multi-agent-rfc-collaboration.md`
- `wiki/brain/adrs/multi-agent-rfc-collaboration.md`
