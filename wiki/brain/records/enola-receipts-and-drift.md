---
title: Record — enola receipts, drift detection, and citation verification
kind: record
status: closed
scope: brain
confidence: high
sources:
  - extensions/pi-brain/enola.ts
  - extensions/pi-brain/tools.ts
  - .github/workflows/enola.yml
  - wiki/brain/adrs/optional-enola-integration.md
---

# Record — enola receipts, drift detection, and citation verification

## What changed

Strengthened pi-brain's optional enola integration with patterns learned from `projects/tt/brain`:

1. **Receipt state** — `/brain:enola-generate` runs enola and records snapshot metadata in `wiki/_state/enola/receipts.json`.
2. **Content-digest drift detection** — `/brain:enola-diff` compares live snapshots to recorded receipts and reports fact-count deltas.
3. **Citation verification** — `/brain:enola-citations` scans wiki prose for `enola receipt <repo> sha256:<digest> @ <commit>, <date>` citations and verdicts them ok/stale/unknown-repo.
4. **CLI-agnostic spawn backend** — replaced `execFile` with `spawn(stdio: ['ignore','pipe','pipe'])` because the installed enola binary did not exit under `execFile`.
5. **Skip-when-absent CI** — `.github/workflows/enola.yml` only installs/runs enola when `enola.enabled: true` is present in `brain.config.yml`.
6. **Documentation** — updated ADR, record, README, GETTING_STARTED, and skill.

## Verification

- `npm run validate` passes.
- `brain_links` reports 0 dead links, 0 orphans.
- Receipt generated for pi-brain: 490 facts, no drift, no structural regressions.

## Related

- [wiki/brain/adrs/optional-enola-integration.md](../adrs/optional-enola-integration.md)
- [wiki/brain/epics/enola-integration.md](../epics/enola-integration.md)
- `skills/brain-enola/SKILL.md`
- `wiki/brain/ai-suggestions/refinement/learn-from-tt-brain-enola-integration.md` (implemented from)
