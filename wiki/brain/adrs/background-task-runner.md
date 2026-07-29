---
kind: decision
status: accepted
confidence: low
---

# ADR — Background task runner

## Context

The `regenerative-intent` epic asks for background running tasks and autonomous work outside interactive sessions. The existing `smarter-autonomy.md` ADR rejected background scheduled LLM runs because pi is session-based and local-first.

We need a decision on how to support background work without violating local-first principles or adding a persistent daemon.

## Decision

pi-brain will use a **file-based task queue** plus an external scheduler. The brain provides:
- Task queue storage in `wiki/_state/tasks/`.
- Commands to enqueue (`/brain:enqueue`) and run (`/brain:run-tasks`) tasks.
- A task list command (`/brain:tasks`).

Scheduling is the responsibility of the host environment (cron, systemd timer, launchd, etc.). pi-brain does not ship a built-in scheduler daemon.

### Task model

- Tasks are JSON files in `pending/`, `running/`, `completed/`, and `failed/` subdirectories.
- Each task has an `operation` field mapping to an operation class.
- Only low-risk operations are allowed: `sync`, `groom`, `refine`, `suggest`.

### Execution model

- `/brain:run-tasks` processes pending tasks sequentially.
- Each task runs in a minimal pi subprocess via `pi --mode json -p --no-session`.
- The subprocess receives the task as a user message and executes it.
- Status files are moved through the queue directories.

### Trust

- Background tasks respect `autonomy_trust` from `brain.config.yml`.
- `blocked` operations are skipped.
- `ask` operations are treated as `notify` for background execution.

### Why not a daemon?

- Local-first: no persistent process means fewer failure modes and simpler deployment.
- Security: external scheduler runs with user's existing permissions.
- Simplicity: pi-brain stays a package, not a service.

## Alternatives considered

1. **Built-in scheduler daemon inside pi-brain.**
   - *Rejected:* contradicts local-first, adds complexity, and risks running when the user doesn't expect it.

2. **No background tasks; rely only on idle interactive time.**
   - *Rejected:* does not meet the user need for work continuing while away.

3. **Event-driven hooks from filesystem/git/CI.**
   - *Rejected:* too narrow; doesn't cover the general "do this later" case.

4. **File-based queue + external scheduler.** (Chosen.)
   - *Pros:* simple, local-first, scheduler-agnostic, easy to inspect and debug.
   - *Cons:* requires user to configure cron/systemd; tasks only run as often as the scheduler.

## Consequences

- Users can configure cron/systemd to run `pi /brain:run-tasks` periodically.
- pi-brain remains daemon-free.
- The trust-level framework from autonomous-colleague-mode applies to background execution.
- Future work could add webhook-triggered tasks or connector-driven task enqueueing.

## Related

- [wiki/brain/prds/background-task-runner.md](../prds/background-task-runner.md)
- [wiki/brain/bets/background-task-runner.md](../bets/background-task-runner.md)
- [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- [wiki/brain/adrs/smarter-autonomy.md](../adrs/smarter-autonomy.md)
- [wiki/brain/adrs/autonomous-colleague-mode.md](../adrs/autonomous-colleague-mode.md)
- [wiki/brain/constraints/adr-before-structural-changes.md](../constraints/adr-before-structural-changes.md)
