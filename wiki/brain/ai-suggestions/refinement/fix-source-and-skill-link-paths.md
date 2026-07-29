---
kind: ai-suggestion
status: draft
confidence: low
topic: links
created_at: 2026-07-29
---

# Fix source and skill link paths in older ADRs/PRDs/bets

## Observation

Several older pages contain dead links to sources, skills, and repo files:

- `brain/adrs/tap-pi-extension-surface`, `brain/prds/tap-pi-extension-surface`, `brain/records/tap-pi-extension-surface` link to `../../../sources/web/...` and `../../../sources/doc/...` (wrong depth).
- `brain/adrs/adr-live-status-widget-refresh` and `brain/adrs/adr-pi-tool-wrapper-override` link to `../../../AGENTS` (missing `.md` and wrong depth).
- `brain/adrs/plain-language-triggers-shape` and `brain/bets/plain-language-triggers-shape` link to `../../../../skills/brain-shape/SKILL` (missing `.md`).
- `brain/adrs/brain-state-preserves-custom-content` links to `brain/adrs/wiki/brain/prds/some-page` (placeholder) and `../../../../tools/brain-state.mjs`.
- `brain/bets/extension-cleanup-resource-conflicts` links to `brain/bets/brain/prds/...` (wrong prefix).

## Why now

These are real broken links, not checker artifacts. They hurt trust in the corpus and make navigation fail.

## Suggested action

1. Update each link to use the correct relative path and `.md` suffix where appropriate.
2. Replace the `brain/adrs/wiki/brain/prds/some-page` placeholder with the actual PRD path or remove it.
3. Decide whether links to non-wiki files (`.mjs`, `package.json`) should remain as plain text/code or be handled by a different citation mechanism.

## Sources

- `wiki/brain/adrs/tap-pi-extension-surface.md`
- `wiki/brain/adrs/adr-live-status-widget-refresh.md`
- `wiki/brain/adrs/plain-language-triggers-shape.md`
- `wiki/brain/adrs/brain-state-preserves-custom-content.md`
- `wiki/brain/bets/extension-cleanup-resource-conflicts.md`
