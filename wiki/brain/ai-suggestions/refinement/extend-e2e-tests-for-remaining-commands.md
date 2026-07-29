---
kind: ai-suggestion
status: draft
confidence: medium
topic: tests
created_at: 2026-07-29
---

# Extend e2e tests for the remaining commands

## Observation

`tests/commands.test.ts` now covers `/brain:build` and `/brain:diff`. The other non-agent commands are still untested:

- `/brain:sync-code`
- `/brain:revise`
- `/brain:enqueue`
- `/brain:run-tasks`
- `/brain:tasks`
- `/brain:rfc-contribute`

## Why now

Each command is part of the public surface. Adding tests prevents regressions as the extension evolves.

## Suggested action

1. Add tests for `/brain:sync-code` and `/brain:revise` against a temporary brain with known drift.
2. Add tests for `/brain:enqueue`, `/brain:run-tasks`, and `/brain:tasks`.
3. Add a test for `/brain:rfc-contribute` that appends a contribution to an RFC.
4. Leave `/brain:collaborate` for a separate test because it spawns subagents.

## Sources

- `tests/commands.test.ts`
- `extensions/pi-brain/commands.ts`
