---
kind: bet
status: accepted
confidence: medium
appetite: big
prd: wiki/brain/prds/background-task-runner.md
adr: wiki/brain/adrs/background-task-runner.md
---

# Bet — Background task runner

## What we are betting on

That a file-based task queue plus external scheduler integration lets pi-brain do useful work outside interactive sessions while staying local-first and daemon-free.

## Why now

Autonomous colleague mode defines trust levels for interactive idle time. Background tasks extend that model to when no session is open, completing the "colleague that works while I'm away" vision.

## Appetite

Big. One build phase: queue directories, enqueue/run/list commands, task execution via subprocess, and trust integration.

## Success looks like

- `/brain:enqueue "run refinement for brain"` creates a pending task.
- `/brain:run-tasks` processes pending tasks and moves them to `completed/` or `failed/`.
- `/brain:tasks` lists pending, running, and recent tasks.
- External cron can run `pi /brain:run-tasks` periodically.
- Only low-risk operations run in the background; structural/repo work remains gated.

### Signals to cut losses

- Tasks fail frequently due to subprocess complexity.
- Users don't configure external schedulers.
- The queue accumulates stale tasks.
- Background execution feels unsafe despite trust levels.

## Related

- [PRD](../prds/background-task-runner.md)
- [ADR](../adrs/background-task-runner.md)
- Parent epic: [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- Prior bets:
  - [wiki/brain/bets/autonomous-refinement-protocol.md](../bets/autonomous-refinement-protocol.md)
  - [wiki/brain/bets/autonomous-colleague-mode.md](../bets/autonomous-colleague-mode.md)
