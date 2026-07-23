---
kind: bet
status: accepted
confidence: medium
appetite: small
adr: wiki/brain/adrs/brain-state-preserves-custom-content.md
---

# Bet — Patch brain-state to preserve custom content

## What we are betting on

That a small patch to `tools/brain-state.mjs` — using marker comments to delimit generated sections — eliminates the data-loss risk while keeping dynamic page lists up to date.

## Why now

A user already lost custom content in `wiki/org/state.md`, `roadmap.md`, and `options.md` and had to restore manually. This is a trust-breaking bug in a core maintenance command.

## Appetite

Small. One focused change to `tools/brain-state.mjs` plus a test that custom content survives regeneration.

## Success looks like

- `brain_state` generates files with `<!-- brain-state: <section> -->` markers when they are missing.
- Re-running `brain_state` updates only the marked sections and preserves custom narrative.
- Files without markers are skipped with a clear warning.
- `brain_sync` no longer clobbers project-specific state/roadmap/options content.

### Signals to cut losses

- The marker parsing becomes brittle or surprising.
- Users report they don't understand why their files aren't updating.

## Related

- [ADR](../adrs/brain-state-preserves-custom-content.md)
- [tools/brain-state.mjs](../../../../tools/brain-state.mjs)
