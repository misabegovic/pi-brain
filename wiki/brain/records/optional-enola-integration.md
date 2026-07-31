---
kind: record
status: delivered
scope: brain
sources:
  - wiki/brain/adrs/optional-enola-integration.md
  - sources/repo/2026-07-31--github-com-enola-labs-enola.md
confidence: high
---

# Record — Optional enola integration

## What was delivered

An optional enola architecture-intelligence integration for pi-brain.

## Implementation

- `extensions/pi-brain/types.ts` — `EnolaConfig` interface.
- `extensions/pi-brain/brain-home.ts` — `readEnolaConfig()`.
- `extensions/pi-brain/enola.ts` — `runEnolaCheck`, `runEnolaBaseline`, `runEnolaGenerate`, `runEnolaDiff`, `runEnolaCitations`, `runEnolaQuery`, `runEnolaImpact`, `formatEnolaResult`, `enolaGateCheck`, `captureEnolaRegressions`, and `registerEnolaCommands`.
- `extensions/pi-brain/tools.ts` — `brain_enola` (with check/baseline/generate/diff/citations/query/impact) and `brain_enola_capture` tools.
- `extensions/pi-brain/commands.ts` — `/brain:enola-status`, `/brain:enola-check`, `/brain:enola-capture`, `/brain:enola-generate`, `/brain:enola-diff`, `/brain:enola-citations`, `/brain:enola-baseline`, `/brain:enola-query`, `/brain:enola-impact`.
- `extensions/pi-brain/refinement.ts` — autonomous refinement protocol prompt mentions `brain_enola_capture`.
- `extensions/pi-brain/build.ts` and `extensions/pi-brain/sync-code.ts` — optional enola gates and optional auto-baseline after code generation.
- `wiki/_state/enola/receipts.json` — per-repo snapshot receipt state.
- `.github/workflows/enola.yml` — opt-in CI workflow gated on `enola.config.yml`.
- `skills/brain-enola/SKILL.md` — agent skill documentation.
- `tests/enola.test.ts` — unit tests for the integration helpers.
- `wiki/brain/adrs/optional-enola-integration.md` — decision record.

## Verification

- `tsc --noEmit` passes.
- `npm test` passes, including `tests/enola.test.ts`.
- `npm run validate` passes.
- `brain_links` reports 0 dead links and 0 orphans.
- The integration degrades gracefully when enola is disabled or not installed.

## Pull request

- PR #68: https://github.com/misabegovic/pi-brain/pull/68

## Related

- [wiki/brain/adrs/optional-enola-integration.md](../adrs/optional-enola-integration.md)
- `skills/brain-enola/SKILL.md`
- [wiki/brain/records/enola-receipts-and-drift.md](../records/enola-receipts-and-drift.md)
