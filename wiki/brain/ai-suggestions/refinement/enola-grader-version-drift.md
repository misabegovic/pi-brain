---
title: Pin the enola grading binary to 0.4.11 — PATH copy drifted to 0.4.10
description: Every `enola check` currently declines with version_mismatch because the grading binary (enola 0.4.10 on PATH) no longer matches the pinned baseline (enola 0.4.11, extractors v258). Pin `enola.binary` or ENOLA_BINARY to a 0.4.11 build so checks grade again.
kind: refinement
status: closed
confidence: low
source: enola check decline (2026-09-14), `enola doctor`, .enola/baseline/receipt.json
sources:
  - wiki/brain/ai-suggestions/enola/enola-regression-2026-09-14.md
  - CHANGELOG.md
enola_intent:
  page:
    type: refinement
    status: closed
    anchors:
    - repo: pi-brain
      path: CHANGELOG.md
---

> Unreviewed ai-suggestion — promote only via /brain:tend.

# Pin the enola grading binary to 0.4.11

## Observation

The v0.5.0 baseline was pinned with **enola 0.4.11** (extractors v258, see `.enola/baseline/receipt.json`, generated 2026-08-31). The enola binary now resolving on PATH is **0.4.10** (extractors v257, confirmed via `enola doctor` on 2026-09-14). Every `enola check` therefore declines with `version_mismatch` — "DECLINED — refusing to grade" — plus a stale-baseline advisory (14 days old).

## Why it matters

- The v0.5.0 work explicitly made "declined" a non-verdict so gates proceed by name — but a permanently declining check means `brain_enola_capture` and the `/brain:build` + `/brain:sync-code` gates can never produce a real verdict until the versions match again.
- `brain.config.yml` already documents the remedy: the binary resolves env-first (`ENOLA_BINARY`, then `enola.binary`, then PATH), precisely so a machine carrying several enola builds pins the right one per checkout.

## Suggested change

1. Point `enola.binary` (or `ENOLA_BINARY`) at the 0.4.11 build used for the v0.5.0 baseline.
2. Re-run `enola check`; re-pin the baseline (`/brain:enola-baseline`) once grading is clean, so the 14-day staleness advisory clears too.
3. Housekeeping while there: `.enola-b/` holds 0.3.6-era receipts (2026-08-06, branch `simplify/tooling`, dirty) and is referenced by no extension code — archive or delete it so stale artifacts don't get mistaken for current state.

## Resolution

Closed 2026-09-14. `enola.binary: /home/muhamed/.local/bin/enola-oss` set in `brain.config.yml` — a stock 0.4.11 build (extractors v258) matching the pinned baseline; the PATH copy was a 0.4.10 downstream build. The stale 0.3.6-era `.enola-b/` directory was removed (unreferenced by any code). `enola check` now grades: PASS.

## Related

- wiki/brain/ai-suggestions/enola/enola-regression-2026-09-14.md — the raw declined receipt this derives from.
- wiki/brain/records/enola-receipts-and-drift.md — receipt/drift discipline.
- CHANGELOG.md (0.5.0) — "declined is a non-verdict" behavior and the documented env-first binary resolution.
