---
name: brain-tasks
description: Manage background tasks for pi-brain. Use when the user says "background task", "enqueue", "run tasks", "/brain:enqueue", "/brain:run-tasks", or "/brain:tasks".
---

# brain-tasks

Run pi-brain maintenance work outside interactive sessions via a file-based task queue.

## Commands

```
/brain:enqueue <scope> <operation> <description>
/brain:run-tasks
/brain:run-tasks --detach
/brain:run-tasks --detach --parallel
/brain:bg-agent <scope> <description>
/brain:tasks
```

## Allowed operations

Background-safe operation classes:

- `sync` — e.g., `brain_sync`
- `groom` — e.g., inbox cleanup, archiving stale suggestions
- `refine` — autonomous refinement protocol
- `suggest` — generate `ai-suggestions/` drafts
- `agent` — general background agent with an arbitrary description/prompt

Operations `shelves`, `commits`, and `code` are never allowed as background tasks.

## How it works

1. Tasks are stored as JSON files in `wiki/_state/tasks/pending/`.
2. `/brain:run-tasks` processes pending tasks sequentially and blocks until done.
3. `/brain:run-tasks --detach` starts the same work in a detached subprocess and returns immediately, so the interactive session stays available.
4. `/brain:run-tasks --detach --parallel` starts one detached subprocess per pending task, allowing independent tasks to run concurrently.
5. `/brain:bg-agent <scope> <description>` queues an `agent` task and starts it immediately in parallel detached mode.
6. Each task runs in a fresh subprocess.
7. Tasks move to `completed/` or `failed/` based on result.

## Scheduling

pi-brain does not include a built-in scheduler. Use external cron, systemd timer, launchd, etc.:

```cron
*/15 * * * * cd /path/to/brain && pi /brain:run-tasks
```

## Trust

Background tasks respect `autonomy_trust` from `brain.config.yml`:

- `blocked` operations are skipped.
- `ask` operations are treated as `notify` for background execution.

## Related

- [wiki/brain/bets/background-task-runner.md](../../../wiki/brain/bets/background-task-runner.md)
