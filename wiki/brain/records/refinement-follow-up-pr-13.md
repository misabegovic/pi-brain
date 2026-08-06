---
kind: record
status: delivered
scope: brain
sources:
  - PR #13: https://github.com/misabegovic/pi-brain/pull/13
confidence: high
enola_intent:
  page:
    type: record
    status: delivered
    scope:
    - brain
---

# Record — Refinement follow-up PR #13

## What was delivered

A follow-up PR to the regenerative-intent epic that fixed the link graph, corrected generated page links, added TypeScript dev tooling, fetched the aicoding source, archived resolved inbox items, deleted demo artifacts, and created an archived demo RFC.

## Changes

- Fixed `tools/brain-links.mjs` to resolve relative markdown links against the source file directory.
- Fixed `tools/brain-sync.mjs` and `extensions/pi-brain/views.ts` to generate `wiki/index.md` links relative to `wiki/`.
- Fixed `tools/brain-state.mjs` to generate `org/state.md`, `org/roadmap.md`, and `org/options.md` links relative to `wiki/org/`.
- Converted non-wiki citations (sources, AGENTS.md, skills, prompts, .ts, package.json) to `(source: ...)` or backtick form.
- Fixed real broken wiki links in archived bets, constraints, feedback, records, and ADRs.
- Fetched and saved `aicoding.leaflet.pub` content to `sources/web/`.
- Archived the 3 resolved inbox items.
- Deleted demo `ai-suggestions/build/` and `ai-suggestions/sync-code/` artifacts.
- Created archived demo RFC `wiki/brain/rfcs/demo-rfc.md`.
- Added `typescript`, `@earendil-works/pi-coding-agent`, and `@earendil-works/pi-tui` to `devDependencies`.
- Added `tsconfig.json`, `types/pi-tui.d.ts`, and `npm run check` script.
- Added `"type": "module"` to `package.json`.

## Verification

- `brain_links` reports **0 dead links** and **0 orphans**.
- `npx tsc --noEmit` passes.
- `tests/load.test.ts` and `tests/integration.test.ts` pass.
- `brain_sync` reports no validation errors.

## Pull request

- PR #13: https://github.com/misabegovic/pi-brain/pull/13

## Related

- [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- [wiki/brain/records/autonomous-refinement-protocol.md](autonomous-refinement-protocol.md)
