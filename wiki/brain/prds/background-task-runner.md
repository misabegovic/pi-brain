---
kind: initiative
status: living
confidence: low
appetite: big
team: brain
repos: [brain]
enola_intent:
  page:
    type: initiative
    status: living
---

# PRD — Background task runner

## Problem

pi-brain's autonomous features only run while a pi session is open and the agent is idle. Users want the brain to keep working when they are away — ingesting sources, running refinement, grooming stale items — without requiring a live terminal session. The current `smarter-autonomy.md` ADR explicitly rejects background scheduled LLM runs because pi is session-based.

We need a safe, local-first way to run background tasks outside an interactive session.

## Appetite

Big. This is infrastructure: task queue, execution model, scheduling integration, and trust boundaries.

## Solution

Add a **file-based background task runner** that external schedulers can invoke.

### Task queue

Tasks are stored as JSON files in `wiki/_state/tasks/`:

```
wiki/_state/tasks/
  pending/
    <id>.json
  running/
    <id>.json
  completed/
    <id>.json
  failed/
    <id>.json
```

Task JSON:

```json
{
  "id": "uuid",
  "description": "Run refinement scan",
  "operation": "refine",
  "scope": "brain",
  "createdAt": "2026-07-28T15:00:00Z",
  "maxAttempts": 3,
  "attempts": 0
}
```

### Enqueueing

- `/brain:enqueue <description>` — create a pending task.
- Autonomous colleague mode can enqueue tasks for later when an operation is `ask` or `notify` but the user is not present.
- Only low-risk operations can be enqueued: `sync`, `groom`, `refine`, `suggest`.

### Execution

- `/brain:run-tasks` — process all pending tasks.
- This command is designed to be invoked by an external scheduler (cron, systemd timer, launchd, etc.) via `pi --mode json -p /brain:run-tasks`.
- Each task runs in a fresh, minimal pi subprocess (`pi --mode json -p --no-session`) with autonomy ON and restricted tools.
- Task status moves: `pending` → `running` → `completed`/`failed`.

### Trust

- Background tasks use the same `autonomy_trust` config as interactive mode.
- Operations with trust level `blocked` are skipped.
- Operations with trust level `ask` are converted to `notify` and run, but only for low-risk operation classes.

### Reporting

- Completed tasks append a summary to `log/log.md`.
- Failed tasks remain in `failed/` with error output for inspection.
- A `/brain:tasks` command lists pending/running/recent tasks.

## No-gos

- No built-in scheduler daemon inside pi-brain (use external cron/systemd).
- No background tasks for structural/repo changes.
- No auto-commit or auto-push from background tasks.
- No editing approved shelves from background tasks.

## Rabbit holes

- Building a distributed task queue.
- Running tasks inside the interactive TUI process.
- Supporting long-running background LLM conversations.
- Complex retry/backoff logic in v1.

## Related

- [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- [wiki/brain/adrs/smarter-autonomy.md](../adrs/smarter-autonomy.md)
- [wiki/brain/bets/autonomous-colleague-mode.md](../bets/autonomous-colleague-mode.md)
- [wiki/brain/constraints/adr-before-structural-changes.md](../constraints/adr-before-structural-changes.md)
- [wiki/brain/constraints/explicit-approval-for-commits.md](../constraints/explicit-approval-for-commits.md)
