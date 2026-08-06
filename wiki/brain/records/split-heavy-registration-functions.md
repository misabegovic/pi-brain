---
title: Record — split high-complexity registration functions
kind: record
status: delivered
scope: brain
confidence: high
sources:
  - extensions/pi-brain/commands.ts
  - extensions/pi-brain/tools.ts
  - extensions/pi-brain/hooks.ts
enola_intent:
  page:
    type: record
    status: delivered
    scope:
    - brain
    anchors:
    - repo: pi-brain
      path: extensions/pi-brain/commands.ts
    - repo: pi-brain
      path: extensions/pi-brain/hooks.ts
    - repo: pi-brain
      path: extensions/pi-brain/tools.ts
---

# Record — split high-complexity registration functions

## What changed

Refactored the three largest registration functions flagged by enola:

- `registerCommands` (complexity 92) split into domain-specific registrars in `extensions/pi-brain/commands/`:
  - `core.ts` — `brain`, `brain:capture`, `brain:ask`, `brain:tend`
  - `sync.ts` — `brain:sync`, `brain:update`, `brain:connect`
  - `shape.ts` — `brain:shape`, `brain:in`, `brain:setup`
  - `views.ts` — `brain:links`, `brain:groom`, `brain:state`
  - `ingest.ts` — `brain:ingest-repo`, `brain:projects`
  - `autonomy.ts` — `brain:auto`, `brain:continue`, `brain:investigate`
  - `misc.ts` — `brain:dump-prompt`, `brain:convert`, `brain:deepdive`

- `registerTools` (complexity 116) split into domain-specific registrars in `extensions/pi-brain/tools/`:
  - `core.ts` — `brain_status`, `brain_capture`, `brain_ask`, `brain_tend`, `brain_validate`, `brain_views`, `brain_sync`
  - `update.ts` — `brain_update`, `brain_pull_connectors`, plus `findRecentSources`
  - `autonomy.ts` — `brain_autonomy`
  - `projects.ts` — `brain_convert`, `brain_projects`, `brain_ingest_repo`
  - `state.ts` — `brain_state`, `brain_links`
  - `deepdive.ts` — `brain_deepdive`
  - `ingest.ts` — `brain_ingest`
  - `enola.ts` — `brain_enola_capture`, `brain_enola`

- `registerHooks` (complexity 57) split into `extensions/pi-brain/hooks/`:
  - `lifecycle.ts` — `agent_settled`, `session_start`, `session_tree`, `resources_discover`, `before_agent_start`
  - `context.ts` — `context`, `session_before_compact`
  - `tool.ts` — `tool_call`, `tool_result`
  - `shared.ts` — `renderBrainBriefing`, `STATE_CHANGING_BRAIN_TOOLS`

- Extracted `extractSimpleYamlValue` into `extensions/pi-brain/yaml.ts` and re-exported it from `utils.ts` for backwards compatibility.

## Verification

- `npm run validate` passes.
- `brain_links` reports 0 dead links / 0 orphans.
- `brain_enola_capture` reports no structural regressions.
- Enola re-run shows the original top complexity outliers eliminated:
  - `registerTools` (116), `registerCommands` (92), `registerHooks` (57) no longer appear.

## Related

- [wiki/brain/ai-suggestions/refinement/enola-insights-split-heavy-registration-functions.md](../ai-suggestions/refinement/enola-insights-split-heavy-registration-functions.md)
- [wiki/brain/ai-suggestions/refinement/enola-insights-reduce-shared-utility-hotspots.md](../ai-suggestions/refinement/enola-insights-reduce-shared-utility-hotspots.md)
