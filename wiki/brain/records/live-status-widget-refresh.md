---
title: "Record — Live status widget refresh"
scope: brain
kind: record
status: current
confidence: high
sources:
  - wiki/brain/adrs/adr-live-status-widget-refresh.md
  - extensions/pi-brain/hooks.ts
  - sources/brain/feedback/live-status-widget-refresh.md
created: 2026-07-27
updated: 2026-07-27
author: pi-brain-agent
enola_intent:
  page:
    type: record
    status: current
    scope:
    - brain
    anchors:
    - repo: pi-brain
      path: extensions/pi-brain/hooks.ts
    - repo: pi-brain
      path: sources/brain/feedback/live-status-widget-refresh.md
    - repo: pi-brain
      path: wiki/brain/adrs/adr-live-status-widget-refresh.md
---

## Current truth

The pi-brain status widget now refreshes automatically during a session when brain state changes.

## Behavior

- The widget is rendered at session start by the `before_agent_start` hook.
- After any state-changing brain tool completes (`brain_capture`, `brain_ingest`, `brain_pull_connectors`, `brain_sync`, `brain_update`, `brain_state`, `brain_views`, `brain_validate`, `brain_links`, `brain_convert`, `brain_ingest_repo`, `brain_autonomy`), the extension re-reads the inbox/wiki/source counts and sends an updated widget via `pi.sendMessage`.
- Direct `write`/`edit` operations on `wiki/_state/inbox.md` or `wiki/_state/auto-ingest-batch.json` also trigger a refresh.
- Read-only tools (`brain_ask`, `brain_status`, `brain_projects`, `brain_tend`) do not trigger refresh.

## Implementation

- `renderBrainBriefing(home)` centralizes widget content generation in `extensions/pi-brain/hooks.ts`.
- A `tool_result` listener decides whether to refresh and calls `renderBrainBriefing` + `pi.sendMessage`.

## Related

- [ADR — Live-refresh the brain status widget during a session](../adrs/adr-live-status-widget-refresh.md)
- (source: sources/brain/feedback/live-status-widget-refresh.md)
