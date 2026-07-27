---
kind: decision
status: accepted
confidence: low
---

# ADR — Tap pi’s full extension surface for pi-brain

## Context

pi-brain is currently a reactive command set: users type `/brain:*` to capture, ask, and tend knowledge. The Pi extension API offers many more integration points, and a recent source argues that pi-brain is using only a small slice of what pi makes available (source: `sources/web/2026-07-27--muhamed-at-brain-pi-untapped-extension-surface-for-pi-brain.md`).

Some hooks already exist in `extensions/pi-brain/hooks.ts`, but most are minimal or experimental:
- `session_before_compact` harvests simple regex matches into the inbox, gated by `harvest_compaction` (source: `extensions/pi-brain/hooks.ts`; source: `extensions/pi-brain/brain-home.ts`).
- `context` injection is hidden behind `PI_BRAIN_EXPERIMENTAL_CONTEXT=1` and limited to two records (source: `extensions/pi-brain/hooks.ts`).
- `tool_result` only refreshes the brain status widget (source: `extensions/pi-brain/hooks.ts`).
- Entry renderers, shortcuts/flags, the event bus, and `session_shutdown` are not used.

The PRD for this initiative frames a seven-phase expansion of these hooks, each phase independently configurable.

Active constraints apply:
- `adr-before-structural-changes` requires an approved ADR before changing extension code (source: `wiki/brain/constraints/adr-before-structural-changes.md`).
- `explicit-approval-for-commits` and `remote-promotion-requires-pr` govern how each phase lands (source: `wiki/brain/constraints/explicit-approval-for-commits.md`; source: `wiki/brain/constraints/remote-promotion-requires-pr.md`).

## Decision

We will expand pi-brain’s use of pi’s extension API in seven independent phases, each behind a feature flag in `brain.config.yml`:

1. **Compaction harvest** — harden the existing `session_before_compact` hook with better heuristics and a review queue.
2. **Context injection** — promote the experimental `context` hook to a config-driven, confidence-gated feature.
3. **Tool-result enrichment** — extend the existing `tool_result` hook to add citations, related wiki links, and size warnings.
4. **Entry renderers** — add `registerEntryRenderer` renderers for brain status, inbox, and record cards.
5. **Shortcuts & flags** — add `registerShortcut` and `registerFlag` bindings for common brain actions.
6. **Event bus** — publish lightweight `brain:*` events on `pi.events` for cross-extension observation.
7. **Session shutdown** — add explicit cleanup via `session_shutdown`.

Each phase ships as a separate, small PR linked to this ADR and the bet. Flags default to off or preserve current behavior so the change is safe to merge incrementally.

## Alternatives considered

1. **Do nothing.** Keep pi-brain reactive and rely only on `/brain:*` commands.
   - *Pros:* No new code, no new failure modes.
   - *Cons:* Decisions and open questions are still lost during compaction; the agent is not grounded; the brain feels separate from pi.
   - *Rejected:* the existing hooks already prove the value, and the source makes a strong case that the surface is underused.

2. **Compaction harvest only.** Ship only Phase 1 and ignore the other surfaces.
   - *Pros:* Highest signal-to-noise payoff; smallest scope; fastest validation.
   - *Cons:* Leaves context injection, tool enrichment, TUI rendering, and shortcuts unaddressed; does not match the shaped appetite.
   - *Rejected:* too narrow given the shaped PRD and user appetite.

3. **Big-bang release.** Implement all seven phases in one large change.
   - *Pros:* Coherent launch; all surfaces available at once.
   - *Cons:* Hard to review, hard to debug, hard to roll back; violates the small-bets spirit of the repo and increases risk of shipping broken hooks together.
   - *Rejected:* the `remote-promotion-requires-pr` constraint and the team’s release history favor small, reviewable PRs.

4. **Phased all-seven (chosen).** Ship each phase as a small, flag-gated PR.
   - *Pros:* Learn after each phase; easy to disable a bad hook; keeps reviews small; respects active workflow constraints.
   - *Cons:* Slightly more release overhead; users may not discover flags unless documented.
   - *Chosen:* best risk/learning trade-off for a big appetite.

## Consequences

- **Positive:** pi-brain becomes proactive — it harvests, grounds, enriches, and renders without waiting for slash commands.
- **Positive:** Feature flags let operators opt in and let us measure each phase before declaring it default-on.
- **Positive:** Each phase can cite this ADR and the bet, satisfying `adr-before-structural-changes` per PR.
- **Negative:** More extension code means more maintenance surface and more places for pi API changes to break us.
- **Negative:** Context injection and compaction harvest risk noise if heuristics are wrong; we must monitor signal-to-noise.
- **Negative:** Entry renderers and shortcuts require TUI/CLI design decisions that could expand scope if not held to the no-gos.

## Related

- [PRD — Tap pi’s full extension surface for pi-brain](../prds/tap-pi-extension-surface.md)
- [Bet — Tap pi’s full extension surface for pi-brain](../bets/tap-pi-extension-surface.md)
- Source: [Pi has way more extension surface than pi-brain uses](../../../sources/web/2026-07-27--muhamed-at-brain-pi-untapped-extension-surface-for-pi-brain.md)
- Source: [Pi extension docs](../../../sources/doc/2026-07-27--extensions-md.md)
- Source: [Pi TUI docs](../../../sources/doc/2026-07-27--tui-md.md)
- Source: [Pi keybindings docs](../../../sources/doc/2026-07-27--keybindings-md.md)
- Source: `extensions/pi-brain/hooks.ts`
- Source: `extensions/pi-brain/brain-home.ts`
- [Constraint — ADR before structural changes](../constraints/adr-before-structural-changes.md)
- [Constraint — Explicit approval required for commits](../constraints/explicit-approval-for-commits.md)
- [Constraint — Remote promotion requires a pull request](../constraints/remote-promotion-requires-pr.md)
