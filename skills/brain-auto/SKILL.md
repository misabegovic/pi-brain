---
name: brain-auto
description: Toggle and explain autonomous brain-maintenance mode. Use when the user says "brain auto", "autonomy mode", "let pi maintain the brain", or "stop auto brain".
---

# brain-auto

Autonomous mode makes pi proactively maintain the pi-brain instead of waiting for explicit instructions.

## Command

```
/brain:auto
```

Toggles autonomy on/off for the current clone.

## Tool

### `brain_autonomy`

- `enabled` (optional): `true` to turn on, `false` to turn off. Omit to read current state.

## What changes when autonomy is ON

- The agent receives an extra system-prompt instruction before each turn reminding it:
  - It is working inside a pi-brain clone and must follow `AGENTS.md`.
  - It may do low-risk maintenance silently: batch auto-connect ingestions, run `brain_sync`, auto-groom stale auto-ingest batches, synthesize low-risk observations into `wiki/<scope>/ai-suggestions/`, and flag drift.
  - It must pause for explicit approval before commitment-class work: writing/moving ADRs, PRDs, epics, bets, or records; editing approved wiki pages; running the expensive `/brain:tend` digest on high-risk/structural items; any structural/repo change.
  - It should consult `brain_status` at session start.
  - It should use `brain_ask` before guessing facts.
  - It should capture decisions and observations with `brain_capture` without asking permission.
  - It should suggest `/brain:tend` only for high-risk/structural inbox items; summarize low-risk ones in `ai-suggestions/`.
  - It should hand off to `/brain:shape` for pitches and commitment-class decisions.
  - It should run `brain_sync` after wiki changes.

## What autonomy does NOT do

- It does not schedule background LLM runs.
- It does not auto-merge PRs or push code.
- It does not silently write ADRs, PRDs, epics, bets, or records.
- It does not silently reshape approved wiki pages.
- It does not run the expensive `/brain:tend` digest on high-risk/structural items without explicit approval.
- It does not lock files. Auto maintenance uses short, atomic reads/writes. If you start a manual `/brain:shape`, the agent yields; any auto suggestions wait until the next idle turn.
- It may draft AI-suggested RFCs for cross-cutting or uncertain commitments before writing ADRs/PRDs.

## When to use

- Turn ON when you want pi to keep the brain in sync as you work.
- Turn OFF when you want explicit, request-only brain interaction.
