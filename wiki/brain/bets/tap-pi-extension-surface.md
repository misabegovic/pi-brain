---
kind: bet
status: accepted
confidence: medium
appetite: big
prd: brain/prds/tap-pi-extension-surface.md
adr: brain/adrs/tap-pi-extension-surface.md
---

# Bet — Tap pi’s full extension surface for pi-brain

## What we are betting on

That pi-brain can become a proactive, native-feeling memory layer by incrementally wiring seven Pi extension hooks — compaction harvest, context injection, tool-result enrichment, entry renderers, shortcuts/flags, event bus, and session shutdown — each behind a feature flag in `brain.config.yml`.

## Why now

- The source pitch makes the opportunity explicit: pi-brain uses only a small slice of the Pi extension API (source: `sources/web/2026-07-27--muhamed-at-brain-pi-untapped-extension-surface-for-pi-brain.md`).
- Several hooks already exist in `extensions/pi-brain/hooks.ts` but are experimental or minimal, so the foundation is in place and the risk of each phase is low.
- The repo just cut v0.3.1, and the extension cleanup ADR/bet/record landed cleanly, leaving the extension code in a good state for expansion.

## Appetite

Big, but shipped as seven small, independently flag-gated phases. We are willing to spend multiple shaping/build cycles, but each phase must be reviewable, reversible, and measurable on its own.

## Success looks like

- **Phase 1:** Compaction harvest produces useful draft inbox items more often than noise.
- **Phase 2:** With context injection enabled, the agent answers corpus questions without the user invoking `/brain:ask`.
- **Phase 3:** Tool results inside the brain home cite related records or constraints automatically.
- **Phase 4:** Brain status, inbox, and record entries render as structured cards in the TUI.
- **Phase 5:** Common brain actions are reachable via shortcuts or CLI flags.
- **Phase 6:** Other extensions can observe brain state changes without calling brain tools.
- **Phase 7:** No resource leaks or stale in-memory state across session shutdowns.

## Cut-loss signals

- Any phase’s signal-to-noise ratio stays below roughly 2:1 after two weeks of dogfooding.
- A phase measurably increases token usage or latency without improving answer quality.
- A Pi API change breaks a hook and the fix is larger than the original phase.
- Users report that a feature feels intrusive or noisy rather than helpful.

## Related

- [PRD — Tap pi’s full extension surface for pi-brain](../prds/tap-pi-extension-surface.md)
- [ADR — Tap pi’s full extension surface for pi-brain](../adrs/tap-pi-extension-surface.md)
- Source: [Pi has way more extension surface than pi-brain uses](../../../sources/web/2026-07-27--muhamed-at-brain-pi-untapped-extension-surface-for-pi-brain.md)
- Source: [Pi extension docs](../../../sources/doc/2026-07-27--extensions-md.md)
- Source: `extensions/pi-brain/hooks.ts`
- Source: `extensions/pi-brain/brain-home.ts`
