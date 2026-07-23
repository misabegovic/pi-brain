---
kind: record
status: current
confidence: high
decided_by: wiki/brain/adrs/brain-state-preserves-custom-content.md
implemented_in:
  - tools/brain-state.mjs
---

# Record — brain-state preserves custom content

## What this is

The current, approved state of `tools/brain-state.mjs` after the preserve-custom-content fix.

## Current truth

- `tools/brain-state.mjs` regenerates `wiki/<scope>/state.md`, `roadmap.md`, and `options.md` using marker-delimited sections.
- Generated sections are wrapped in `<!-- brain-state: <section> -->` ... `<!-- /brain-state -->` comments.
- Existing custom content outside the markers is preserved.
- If a file exists but has no markers, the script skips it with a warning.
- If a file does not exist, the script creates it from the template with markers.
- `brain_sync` no longer risks clobbering project-specific narrative in these pages.

## Origin

- Decision: [ADR — brain-state must preserve custom content](../adrs/brain-state-preserves-custom-content.md)
- Commitment: [Bet — Patch brain-state to preserve custom content](../bets/brain-state-preserves-custom-content.md)

## Implementation

- `tools/brain-state.mjs` — added `markerSection`, `hasMarker`, `replaceMarkerSection`, and `extractSectionLines` helpers; updated the main loop to conditionally create, update, or skip files.

## Boundaries

- The marker convention must be used for any section that should be auto-updated.
- Users who want a full reset can delete the file and re-run `brain_state`.
- The script does not attempt a three-way merge; it only replaces content between known markers.

## Related

- [ADR — brain-state must preserve custom content](../adrs/brain-state-preserves-custom-content.md)
- [Bet — Patch brain-state to preserve custom content](../bets/brain-state-preserves-custom-content.md)
