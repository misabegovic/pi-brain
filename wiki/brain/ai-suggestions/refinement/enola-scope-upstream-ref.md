---
title: Exclude .pi/upstream-ref from enola's graded scope
description: The embedded upstream-template clone at .pi/upstream-ref added ~1,096 symbols / 1,729 facts to the enola graph, so every finding is reported twice (once for real paths, once prefixed .pi/upstream-ref/) and will churn on every /brain:update. Exclude .pi/ from the graded scope and re-pin the baseline.
kind: refinement
status: closed
confidence: low
source: enola check (2026-09-14) — "+9 modules, +1096 symbols, +1729 added"
sources:
  - wiki/brain/ai-suggestions/enola/enola-regression-2026-09-14.md
enola_intent:
  page:
    type: refinement
    status: closed
---

> Unreviewed ai-suggestion — promote only via /brain:tend.

# Exclude .pi/upstream-ref from enola's graded scope

## Observation

`.pi/upstream-ref/` is an embedded git clone of the upstream pi-brain template (it has its own `.git`; zero files are tracked by this repo, and it is not in `.gitignore`). Enola grades whatever is on disk, so the vendored copy entered the graph: the 2026-09-14 check reports **+9 modules, +1,096 symbols, +357 dependencies, +1,729 facts added**, nearly all under `.pi/upstream-ref/`. Every structural finding is duplicated — e.g. `extensions/pi-brain.parseYamlLike (39)` and `.pi/upstream-ref/extensions/pi-brain.parseYamlLike (39)` are the same function.

## Why it matters

- The upstream-ref copy is reference material for `/brain:update` diffs, not code this repo maintains; grading it doubles noise and will produce phantom churn on every template update.
- The duplication also inflates hotspot/god-class rankings and makes the real findings harder to spot.

## Suggested change

1. Add `.pi/` (or at least `.pi/upstream-ref/`) to enola's ignore configuration for this checkout, or relocate the upstream ref outside the graded tree.
2. Re-pin the baseline (`/brain:enola-baseline`) after the scope change so the exclusion is not itself graded as a mass deletion.
3. Re-run `enola check` and confirm the duplicated `.pi/upstream-ref/` findings are gone.

## Resolution

Closed 2026-09-14. Root `mcp-arch.yaml` added with `repo: .` and an ignore list whose headline entry is `.pi/**`; baseline re-pinned under the new config (1,862 facts, down from 1,913 with the ~1,100 vendored symbols gone). `enola check` passes and no `.pi/upstream-ref/` finding remains.

## Related

- wiki/brain/ai-suggestions/enola/enola-regression-2026-09-14.md — raw receipt showing the duplicated findings.
- wiki/brain/records/upstream-template-sync.md — what the upstream-ref snapshot is for.
