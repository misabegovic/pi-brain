---
kind: record
status: delivered
scope: brain
confidence: high
sources:
  - CHANGELOG.md
  - wiki/brain/epics/enola-integration.md
enola_intent:
  page:
    type: record
    status: delivered
    scope:
    - brain
    anchors:
    - repo: pi-brain
      path: CHANGELOG.md
---

# Record — pi-brain v0.4.0 release

## What shipped

v0.4.0 delivers the enola-integration epic (source: `wiki/brain/epics/enola-integration.md`):

- Optional enola architecture intelligence integration: `/brain:enola-status`, `/brain:enola-check`, `/brain:enola-capture`, `/brain:enola-generate`, `/brain:enola-diff`, `/brain:enola-citations`, `/brain:enola-baseline`, `/brain:enola-query`, `/brain:enola-impact`.
- Enola receipt state in `wiki/_state/enola/receipts.json` with content-digest drift detection, and citation verification for wiki prose.
- Optional enola gates for `/brain:build` and `/brain:sync-code` (`enola.gate_build`, `enola.gate_sync_code`) and auto-baseline after build/sync (`enola.auto_baseline`).
- Enola capture in the autonomous refinement protocol.
- Enola-guided skill prompts across `brain-shape`, `brain-investigate`, `brain-revise`, `brain-diff`, `brain-collaborate`, `brain-rfc-contribute`, `brain-groom`, `brain-continue`.
- Skip-when-absent enola CI workflow.
- Extension refactor: `registerTools`, `registerCommands`, and `registerHooks` split into domain-specific registrars; `extractSimpleYamlValue` extracted into `extensions/pi-brain/yaml.ts`.

## Pull requests

- PR #80: env-first brain-home resolution for tools and the GitHub connector.
- Remaining slices landed directly on `main` in local-first mode (`dd1d122` integration slice, `a8bb9e3` epic slices, `74fb50e` receipts/drift/citations/CI, `6e3a515` enola-guided skills ADR).

## npm publication

- Published to npm as `@misabegovic/pi-brain@0.4.0` (2026-08-01; release process in `wiki/brain/records/version-0-3-3.md`'s line, changelog section `[0.4.0]`).

## Related

- [wiki/brain/records/version-0-3-3.md](version-0-3-3.md)
- [wiki/brain/records/version-0-5-0.md](version-0-5-0.md)
- [wiki/brain/epics/enola-integration.md](../epics/enola-integration.md)
- `CHANGELOG.md` (repo root) — section `[0.4.0]`
