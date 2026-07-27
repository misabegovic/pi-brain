---
kind: record
status: current
confidence: high
decided_by: wiki/brain/adrs/embed-pi-brain-default-behaviour.md
implemented_in:
  - extensions/pi-brain/index.ts
  - extensions/pi-brain.ts
  - tools/clone-pi-brain.sh
  - tools/brain-convert.mjs
  - tools/migrate-clone.mjs
  - prompts/brain-base.md
  - prompts/brain-autonomy.md
  - package.json
  - README.md
  - GETTING_STARTED.md
---

# Record — Embed pi-brain as default pi behaviour

## What this is

The current state of how pi-brain is distributed and how it becomes the default memory layer for pi sessions.

## Current truth

- pi-brain is distributed as a global pi package: `pi install @misabegovic/pi-brain`.
- The package provides the extension, skills, prompts, themes, templates, personas, and tools.
- Brain clones are content-only: `wiki/`, `sources/`, `log/`, `brain.config.yml`, `AGENTS.md`, `README.md`, `.gitignore`, `.env.example`, and optional `.brain/overrides/`.
- The extension resolves resources from the installed package, with per-clone overrides taking precedence.
- Tool registration is tiered:
  - `brain_status` and `brain_capture` are always active.
  - Brain-home tools are active when a brain home is detected.
  - `brain_convert` and `brain_ingest_repo` are active only when no brain home is detected.
- Brain awareness is woven into the system prompt by default for any session with a brain home. `/brain:auto` escalates to the fuller autonomy prompt.
- Compaction harvest extracts decision-shaped user messages before compaction and writes them as one batched inbox item.
- `/brain:update` tries the package path first (`pi install @misabegovic/pi-brain@latest`) and falls back to the legacy GitHub diff/apply flow.
- `tools/migrate-clone.mjs` migrates existing full-repo clones to the content-only model with `--dry-run` support.
- Experimental context injection (`PI_BRAIN_EXPERIMENTAL_CONTEXT=1`) can inject relevant `records/` pages on each turn.
- A prototype constraint gate (`tool_call`) blocks `write`/`edit` against paths matching active `must` constraint globs.
- The extension entry point is `extensions/pi-brain/index.ts`; `extensions/pi-brain.ts` remains a backward-compatible re-export.

## Origin

- Decision: [ADR — Embed pi-brain as default pi behaviour](../adrs/embed-pi-brain-default-behaviour.md)
- Requirement: [PRD — Embed pi-brain as default pi behaviour](../prds/embed-pi-brain-default-behaviour.md)
- Bet: [Bet — Embed pi-brain as default pi behaviour](../bets/embed-pi-brain-default-behaviour.md)

## Implementation

- Extension: `extensions/pi-brain/index.ts`
- Backward-compat re-export: `extensions/pi-brain.ts`
- Clone helper: `tools/clone-pi-brain.sh`
- Convert helper: `tools/brain-convert.mjs`
- Migration helper: `tools/migrate-clone.mjs`
- Prompts: `prompts/brain-base.md`, `prompts/brain-autonomy.md`
- Tests: `tests/load.test.ts`, `tests/integration.test.ts`
- Docs: `README.md`, `GETTING_STARTED.md`

## Boundaries

- Phase 5 (constraint gate, relevant-record injection) is prototyped but experimental. It should be measured before being enabled by default.
- Phase 6 structural split created `extensions/pi-brain/` with `index.ts`; further extraction of `brain-home.ts`, `tools/`, `commands/`, `prompts.ts`, and `hooks.ts` is future cleanup.
- Token-cost baselines in `tests/fixtures/baseline-v0.2.0-preembed.md` require manual measurement in a real pi TUI session.

## Related

- [Record — pi-brain v0.2.0 release](version-0-2-0.md)
- [Constraint — ADR before structural changes](../constraints/adr-before-structural-changes.md)
