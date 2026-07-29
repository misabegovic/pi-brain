---
kind: ai-suggestion
status: draft
confidence: low
topic: tests
created_at: 2026-07-29
---

# Add end-to-end tests for the new PR #12 commands

## Observation

The test suite has `tests/load.test.ts` and `tests/integration.test.ts` for the core extension surface, but there are no tests for the nine new commands: `/brain:build`, `/brain:diff`, `/brain:sync-code`, `/brain:revise`, `/brain:collaborate`, `/brain:enqueue`, `/brain:run-tasks`, `/brain:tasks`, `/brain:rfc-contribute`.

## Why now

These commands are now part of the public surface. Without tests, regressions in intent parsing, drift detection, proposal generation, or task queuing will only be caught manually.

## Suggested action

1. Create `tests/commands.test.ts` that exercises each new command against a temporary brain home.
2. Start with the non-agent commands (`build`, `diff`, `sync-code`, `enqueue`, `run-tasks`, `tasks`).
3. Add integration-level tests for `revise` and `rfc-contribute` that verify proposal/RFC file output.
4. Leave `collaborate` for last because it spawns subagent processes.

## Sources

- `tests/load.test.ts`
- `tests/integration.test.ts`
- `extensions/pi-brain/commands.ts`
