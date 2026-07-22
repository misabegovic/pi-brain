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

- The agent receives an extra system-prompt instruction before each turn telling it to:
  - Consult `brain_status` at session start.
  - Use `brain_ask` before guessing facts.
  - Capture decisions and observations with `brain_capture` without asking permission.
  - Suggest `/brain:tend` when the inbox has pending items.
  - Hand off to `/brain:shape` for pitches and commitment-class decisions.
  - Run `brain_sync` after wiki changes.

## What autonomy does NOT do

- It does not schedule background LLM runs.
- It does not auto-merge PRs or push code.
- It does not run expensive shape workflows without the user confirming phase boundaries.
- It does not lock files. Auto maintenance uses short, atomic reads/writes. If you start a manual `/brain:shape`, the agent yields; any auto suggestions wait until the next idle turn.

## When to use

- Turn ON when you want pi to keep the brain in sync as you work.
- Turn OFF when you want explicit, request-only brain interaction.
