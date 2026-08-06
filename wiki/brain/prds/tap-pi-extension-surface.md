---
kind: initiative
status: draft
confidence: medium
appetite: big
team: pi-brain
repos: []
enola_intent:
  page:
    type: initiative
    status: draft
---

# PRD — Tap pi’s full extension surface for pi-brain

## Problem

pi-brain is leaving most of pi’s extension API unused. Today it is mainly reactive: the user has to remember and type `/brain:*` commands to capture, ask, or tend the brain.

A few hooks already exist but are minimal or experimental:
- `session_start`, `resources_discover`, and `before_agent_start` load the brain briefing and inject the brain-awareness system prompt (source: `extensions/pi-brain/hooks.ts`).
- `session_before_compact` already harvests simple decision-pattern matches into the inbox, gated by `harvest_compaction` in `brain.config.yml` (source: `extensions/pi-brain/hooks.ts`; source: `extensions/pi-brain/brain-home.ts`).
- `context` can inject relevant records, but only when `PI_BRAIN_EXPERIMENTAL_CONTEXT=1` is set and it is limited to two records (source: `extensions/pi-brain/hooks.ts`).
- `tool_result` currently only refreshes the brain status widget; it does not enrich the model’s view of tool results (source: `extensions/pi-brain/hooks.ts`).

The result is that valuable signal can still be lost during compaction, the agent is not proactively grounded, and the brain feels like a separate utility rather than a native part of pi.

## Appetite

Big. This is a roadmap-level initiative, but it ships as seven small, independently flag-gated phases so we can learn after each one.

## Solution

Stabilize and expand the existing hook set in `extensions/pi-brain/hooks.ts`. Each phase is independently flag-gated in `brain.config.yml` so operators can enable only what they want, and so we can ship and learn after each phase.

### Phase 1 — Compaction harvest (`session_before_compact`)

The hook already exists but uses a simple regex heuristic. Harden it:
- Improve the heuristic (pattern + lightweight LLM/structured extraction) to reduce false positives.
- Write each extraction as a draft inbox item tagged `compaction-harvest` with `confidence: low`.
- Add a weekly/monthly metric item so operators can review signal-to-noise.

Success signal: harvested items are useful more often than they are noise.

### Phase 2 — Context injection (`context` event)

Promote the existing `PI_BRAIN_EXPERIMENTAL_CONTEXT` behavior to a first-class config option (`inject_context: true`):
- Search `wiki/<scope>/records/` and active constraints for relevance to the last user message.
- Cap injected records and require a confidence threshold.
- Include citations so the agent knows the source of injected context.

Success signal: the agent answers corpus questions correctly without the user needing to invoke `/brain:ask`.

### Phase 3 — Tool-result enrichment (`tool_result`)

Extend the existing `tool_result` hook beyond widget refresh:
- For `brain_ask` results, append inline citations to the records/sources used.
- For `read`/`bash` results inside the brain home, surface related wiki links and active constraints.
- Add a size warning when a tool output is large enough to dominate context.

Success signal: tool results cite the source of claims and surface related brain pages automatically.

### Phase 4 — Entry renderers (`registerEntryRenderer`)

Add custom renderers for brain entry types (status cards, inbox summaries, record previews) so the TUI can show them as structured cards instead of plain text blobs. This makes long brain-tending sessions more scannable (source: `sources/doc/2026-07-27--tui-md.md`).

Success signal: users can scan brain state at a glance in the TUI.

### Phase 5 — Shortcuts & flags (`registerShortcut`, `registerFlag`)

Give brain commands real keybindings and CLI flags (source: `sources/doc/2026-07-27--extensions-md.md`; source: `sources/doc/2026-07-27--keybindings-md.md`). Examples: a global shortcut to capture a note, a flag to start pi with autonomy pre-enabled for a brain home, or a shortcut to open the inbox.

Success signal: common brain actions are reachable without typing slash commands.

### Phase 6 — Event bus (`pi.events`)

Publish lightweight brain state events (e.g., `brain:stateChanged`, `brain:inboxUpdated`) on `pi.events` so other extensions can react. Keep the payload minimal and avoid leaking sensitive corpus content (source: `sources/doc/2026-07-27--extensions-md.md`).

Success signal: other extensions can observe brain state changes without calling brain tools.

### Phase 7 — Session shutdown (`session_shutdown`)

Add an explicit cleanup hook that flushes any in-memory caches, closes open file handles, and writes a short session summary to `log/log.md` if anything changed (source: `sources/doc/2026-07-27--extensions-md.md`).

Success signal: no resource leaks across long-running sessions.

## No-gos

- Auto-promoting harvested inbox items into ADRs, records, or constraints without explicit human approval.
- Replacing existing `/brain:*` commands with new shortcuts until the old commands are deprecated with notice.
- Capturing sensitive, customer-specific, or env-var-containing content outside the configured brain home.
- Building a generic plugin framework before the seven concrete hooks are proven.

## Rabbit holes

- **Heuristic tuning** for compaction harvest becoming a research project. Start with simple rules and measure signal-to-noise.
- **Context bloat** from over-eager context injection. Cap the number of injected records and require a confidence threshold.
- **TUI design drift** when building entry renderers. Keep the cozy, low-contrast theme and avoid custom layouts for every page kind.
- **Event bus payload creep.** Publish only event names and small IDs, not full corpus content.

## Related

- Source: (source: sources/web/2026-07-27--muhamed-at-brain-pi-untapped-extension-surface-for-pi-brain.md)
- Source: (source: sources/doc/2026-07-27--extensions-md.md)
- Source: (source: sources/doc/2026-07-27--tui-md.md)
- Source: (source: sources/doc/2026-07-27--keybindings-md.md)
- Source: `extensions/pi-brain/hooks.ts`
- Source: `extensions/pi-brain/brain-home.ts`
- [ADR — Versioning and release strategy](../adrs/versioning-and-releases.md)
- [ADR — Stronger default guardrails against eager implementation](../adrs/stronger-default-implementation-guardrails.md)
- [Constraint — ADR before structural changes](../constraints/adr-before-structural-changes.md)
- [Constraint — Explicit approval required for commits](../constraints/explicit-approval-for-commits.md)
- [Constraint — Remote promotion requires a pull request](../constraints/remote-promotion-requires-pr.md)
