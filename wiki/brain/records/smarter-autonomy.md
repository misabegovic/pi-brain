---
kind: record
status: current
confidence: high
decided_by: wiki/brain/adrs/smarter-autonomy.md
implemented_in:
  - extensions/pi-brain.ts
  - skills/brain-auto/SKILL.md
  - AGENTS.md
---

# Record — Smarter autonomy for pi-brain clones

## What this is

The current, approved state of autonomy mode after the smarter-autonomy bet was implemented.

## Current truth

- Autonomy mode now injects a **brain identity prompt** that tells the agent it is inside a pi-brain clone, points to the brain home, and references `AGENTS.md`.
- The autonomy boundary is explicit in the prompt and the `brain-auto` skill:
  - **Silently allowed:** batch auto-connect ingestions, run `brain_sync`, auto-groom stale auto-ingest batches, synthesize low-risk observations into `wiki/<scope>/ai-suggestions/`, flag drift.
  - **Explicitly gated:** ADRs, PRDs, epics, bets, records, approved wiki edits, expensive `/brain:tend` on high-risk items, structural/repo changes.
- `brain_ingest` batches sources into a single inbox summary item when auto mode is ON, instead of creating one inbox item per source.
- `brain_pull_connectors` batches recently created source files into the same auto-ingest summary when auto mode is ON.
- `autoGroom` runs at session start in auto mode and archives auto-ingest batches older than 7 days, logging the action to `log/log.md`.
- `AGENTS.md` references the autonomy boundary.

## Origin

- Decision: [ADR — Smarter autonomy boundaries](../adrs/smarter-autonomy.md)
- Requirement: [PRD — Smarter autonomy for pi-brain clones](../prds/smarter-autonomy.md)
- Commitment: [Bet — Build `/brain:update` for safe upstream template sync](../bets/smarter-autonomy.md)

## Implementation

- `extensions/pi-brain.ts` — added `AUTONOMY_PROMPT`, batch helpers (`appendAutoIngestBatch`, `flushAutoIngestInboxItem`, `autoGroom`), modified `brain_ingest` and `brain_pull_connectors` to batch in auto mode, and added brain identity injection.
- `skills/brain-auto/SKILL.md` — documented the new allowed/gated boundary.
- `AGENTS.md` — added autonomy mode subsection under "Stop and shape".

## Boundaries

- Auto-groom only archives `auto-ingest-batch` items; user-created captures are untouched.
- Smart-tend synthesis is still agent-driven; the extension provides the prompt permission, not an automatic LLM run.
- Background scheduling is explicitly out of scope; all auto work happens within active sessions.

## Related

- [wiki/brain/adrs/smarter-autonomy.md](../adrs/smarter-autonomy.md)
- [wiki/brain/prds/smarter-autonomy.md](../prds/smarter-autonomy.md)
- [wiki/brain/bets/smarter-autonomy.md](../bets/smarter-autonomy.md)
