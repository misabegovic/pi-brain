---
kind: record
status: delivered
scope: brain
sources:
  - wiki/brain/bets/background-task-runner.md
  - wiki/brain/prds/background-task-runner.md
  - wiki/brain/adrs/background-task-runner.md
confidence: high
enola_intent:
  page:
    type: record
    status: delivered
    scope:
    - brain
    anchors:
    - repo: pi-brain
      path: wiki/brain/adrs/background-task-runner.md
    - repo: pi-brain
      path: wiki/brain/bets/background-task-runner.md
    - repo: pi-brain
      path: wiki/brain/prds/background-task-runner.md
---

# Record — Background task runner

## What was delivered

A file-based task queue in `wiki/_state/tasks/{pending,running,completed,failed}/` with commands `/brain:enqueue`, `/brain:run-tasks`, `/brain:run-tasks --detach`, `/brain:run-tasks --detach --parallel`, `/brain:bg-agent`, and `/brain:tasks`. The system is local-first and daemon-free; execution can be triggered by an external scheduler, an interactive run, a detached run, or parallel detached runs. Independent tasks can run concurrently; `/brain:bg-agent` spins off a general background agent from a plain description.

## Implementation

- `extensions/pi-brain/tasks.ts` — task queue read/write, execution, detached runner spawn, and CLI commands.
- `extensions/pi-brain/commands.ts` — registered `/brain:enqueue`, `/brain:run-tasks`, `/brain:tasks`.
- `tools/run-tasks.mjs` — standalone runner used by the detached path.
- Added `skills/brain-tasks/SKILL.md`.

## Verification

- Tasks are created, listed, run, and completed as files.
- `sync`, `groom`, `refine`, `suggest`, and `agent` operations are allowed as task operations.
- Detached execution starts pending tasks in a subprocess and returns immediately.
- Parallel detached execution starts one subprocess per pending task.
- `/brain:bg-agent` enqueues an `agent` task and starts it in parallel detached mode.

## Known limitations

- No built-in daemon or scheduler; users must wire cron/systemd/scheduler themselves for fully automated background execution.

## Pull request

- PR #12: https://github.com/misabegovic/pi-brain/pull/12

## Related

- [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- [wiki/brain/adrs/background-task-runner.md](../adrs/background-task-runner.md)
- [wiki/brain/prds/background-task-runner.md](../prds/background-task-runner.md)
- [wiki/brain/bets/background-task-runner.md](../bets/background-task-runner.md)
