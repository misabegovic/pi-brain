---
kind: ai-suggestion
status: draft
confidence: low
topic: tooling
created_at: 2026-07-29
---

# Fix `brain_links` markdown `.md` handling bug

## Observation

`brain_links` reports hundreds of dead links and dozens of orphans that are not actually broken. The checker appears to strip `.md` from markdown link targets while keeping `.md` on node names, causing every relative wiki link to be reported as dead.

Current output example:

- `brain/records/agent-maintained-intent` reports dead link to `../adrs/agent-maintained-intent` (target exists as `agent-maintained-intent.md`).
- Many ADRs/PRDs/bets are reported as orphans despite being linked from the epic.

## Why now

High false-positive noise makes the link checker unreliable. The team cannot trust it to catch real broken links, and every refinement scan must manually discount its output.

## Suggested action

1. Inspect the link-graph builder in the brain tooling (likely `tools/brain-links.mjs` or similar).
2. Normalize node IDs and link targets consistently — either keep or strip `.md` on both sides.
3. Re-run `brain_links` and confirm dead-link/orphan counts drop to near zero.

## Sources

- [wiki/_state/links.json](../../../../wiki/_state/links.json)
- [wiki/brain/epics/regenerative-intent.md](../../../epics/regenerative-intent.md)
