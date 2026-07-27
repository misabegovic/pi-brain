---
title: "Live-refresh the brain status widget during a session"
scope: brain
kind: adr
status: accepted
confidence: low
sources:
  - AGENTS.md
  - sources/brain/feedback/live-status-widget-refresh.md
created: 2026-07-27
updated: 2026-07-27
author: pi-brain-agent
---

## Context

pi-brain renders a compact status widget at session start (source: AGENTS.md, extension behavior). The widget reads `wiki/_state/inbox.md`, `wiki/`, `sources/`, and `brain.config.yml` and prints a one-line summary such as:

> 🧠 Brain home: /path — 32 pages, 4 sources, 53 inbox items.

Currently the widget is computed once during `session_start` and never updated. After the agent performs grooming or tending that empties the inbox, the user still sees the stale count until a new session begins. User feedback states this should refresh automatically during the session (source: sources/brain/feedback/live-status-widget-refresh.md).

## Decision

The brain status widget **SHOULD** refresh automatically during a session when the brain state changes.

Specifically:

1. **Invalidate on state-changing operations.** After any pi-brain tool or command that mutates state (`brain_capture`, `brain_tend`, `brain_ingest`, `brain_pull_connectors`, `brain_sync`, grooming, etc.), the widget should be re-rendered with current counts.
2. **Keep the source of truth in files.** The widget always re-reads `wiki/_state/inbox.md` and re-counts pages/sources; do not cache counts in memory.
3. **Render opportunistically, not on every turn.** Only re-render after a brain tool/command completes, not after every user/agent message, to limit token cost.
4. **Fallback to session-start render.** If the extension cannot hook a live refresh, the existing session-start widget remains as a fallback.

## Consequences

- **Positive:** Users see accurate state without starting a new session.
- **Positive:** Reduces confusion after `/brain:groom`, `/brain:tend`, or `brain_capture`.
- **Negative:** Slightly more terminal noise if many brain operations run in one session.
- **Negative:** Requires identifying the right extension hook/event for re-rendering without disrupting the session tree.

## Related

- [AGENTS.md](../../../AGENTS.md)
- [sources/brain/feedback/live-status-widget-refresh.md](../../../sources/brain/feedback/live-status-widget-refresh.md)
- [extensions/pi-brain/hooks.ts](../../../extensions/pi-brain/hooks.ts)
