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
/brain:tasks
```

## Allowed operations

Only low-risk operation classes can run in the background:

- `sync` — e.g., `brain_sync`
- `groom` — e.g., inbox cleanup, archiving stale suggestions
- `refine` — autonomous refinement protocol
- `suggest` — generate `ai-suggestions/` drafts

Operations `shelves`, `commits`, and `code` are never allowed as background tasks.

## How it works

1. Tasks are stored as JSON files in `wiki/_state/tasks/pending/`.
2. `/brain:run-tasks` processes pending tasks sequentially and blocks until done.
3. `/brain:run-tasks --detach` starts the same work in a detached subprocess and returns immediately, so the interactive session stays available.
4. Each task runs in a fresh subprocess.
5. Tasks move to `completed/` or `failed/` based on result.

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
