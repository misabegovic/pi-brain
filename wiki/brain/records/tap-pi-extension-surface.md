---
title: "Record — Tap pi’s full extension surface for pi-brain"
scope: brain
kind: record
status: current
confidence: high
sources:
  - wiki/brain/prds/tap-pi-extension-surface.md
  - wiki/brain/adrs/tap-pi-extension-surface.md
  - wiki/brain/bets/tap-pi-extension-surface.md
  - extensions/pi-brain/compaction-harvest.ts
  - extensions/pi-brain/context-injection.ts
  - extensions/pi-brain/tool-result-enrichment.ts
  - extensions/pi-brain/entry-renderers.ts
  - extensions/pi-brain/shortcuts.ts
  - extensions/pi-brain/events.ts
  - extensions/pi-brain/session-shutdown.ts
  - extensions/pi-brain/hooks.ts
  - brain.config.yml
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
      path: brain.config.yml
    - repo: pi-brain
      path: extensions/pi-brain/compaction-harvest.ts
    - repo: pi-brain
      path: extensions/pi-brain/context-injection.ts
    - repo: pi-brain
      path: extensions/pi-brain/entry-renderers.ts
    - repo: pi-brain
      path: extensions/pi-brain/events.ts
    - repo: pi-brain
      path: extensions/pi-brain/hooks.ts
    - repo: pi-brain
      path: extensions/pi-brain/session-shutdown.ts
    - repo: pi-brain
      path: extensions/pi-brain/shortcuts.ts
    - repo: pi-brain
      path: extensions/pi-brain/tool-result-enrichment.ts
    - repo: pi-brain
      path: wiki/brain/adrs/tap-pi-extension-surface.md
    - repo: pi-brain
      path: wiki/brain/bets/tap-pi-extension-surface.md
    - repo: pi-brain
      path: wiki/brain/prds/tap-pi-extension-surface.md
---

## Current truth

pi-brain now wires all seven of the extension surfaces identified in the source pitch. Each surface is implemented in a dedicated module under `extensions/pi-brain/` and gated by a flag in `brain.config.yml`.

- **Phase 1 — Compaction harvest** (`extensions/pi-brain/compaction-harvest.ts`). `session_before_compact` extracts signal-bearing sentences, scores them for decisions/constraints/open questions, and writes the top candidates as draft inbox items for review. Config: `harvest_compaction`, `harvest_compaction_max_items`, `harvest_compaction_min_score`.
- **Phase 2 — Context injection** (`extensions/pi-brain/context-injection.ts`). `context` prepends relevant records and active constraints to the agent’s messages. Config: `inject_context`, `inject_context_max_records`, `inject_context_min_score`.
- **Phase 3 — Tool-result enrichment** (`extensions/pi-brain/tool-result-enrichment.ts`). `tool_result` adds size warnings, active-constraint notices, and related records for reads and bash results inside the brain home. Config: `enrich_tool_results`, `enrich_tool_results_max_related`, `enrich_tool_results_large_threshold`.
- **Phase 4 — Entry renderers** (`extensions/pi-brain/entry-renderers.ts`). Registers `pi-brain-briefing` and `pi-brain-inbox` TUI renderers via `registerEntryRenderer`.
- **Phase 5 — Shortcuts & flags** (`extensions/pi-brain/shortcuts.ts`). Registers `ctrl+shift+c`, `ctrl+shift+i`, `ctrl+shift+a` shortcuts and the `--brain-autonomy` CLI flag.
- **Phase 6 — Event bus** (`extensions/pi-brain/events.ts`). Publishes `brain:stateChanged` events on `pi.events` after state-changing brain operations. Config: `brain_event_bus`.
- **Phase 7 — Session shutdown** (`extensions/pi-brain/session-shutdown.ts`). Adds a `session_shutdown` hook that clears transient in-memory state. Config: `brain_session_shutdown`.

All new APIs are guarded so the extension still loads in environments that do not expose TUI/shortcut/event APIs.

## Delivery

- GitHub release / PR: https://github.com/misabegovic/pi-brain/pull/8
- Merged to `main` as `0f22424`.

## Origin

- PRD: [PRD — Tap pi’s full extension surface for pi-brain](../prds/tap-pi-extension-surface.md)
- ADR: [ADR — Tap pi’s full extension surface for pi-brain](../adrs/tap-pi-extension-surface.md)
- Bet: [Bet — Tap pi’s full extension surface for pi-brain](../bets/tap-pi-extension-surface.md)

## Related

- Source: (source: sources/web/2026-07-27--muhamed-at-brain-pi-untapped-extension-surface-for-pi-brain.md)
- Source: (source: sources/doc/2026-07-27--extensions-md.md)
- Source: (source: sources/doc/2026-07-27--tui-md.md)
- [ADR — Local-first brain self-maintenance workflow](../adrs/local-first-brain-self-maintenance.md)
