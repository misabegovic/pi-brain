---
kind: record
status: delivered
scope: brain
sources:
  - wiki/brain/bets/structured-intent-and-build.md
  - wiki/brain/prds/structured-intent-and-build.md
  - wiki/brain/adrs/structured-intent-and-build.md
confidence: high
---

# Record — Structured intent and `/brain:build`

## What was delivered

YAML intent blocks inside PRDs/ADRs, plus a `/brain:build` command that renders `data_model` blocks into TypeScript interfaces. Intent becomes the source of truth for code, starting with data models.

## Implementation

- `extensions/pi-brain/intent-blocks.ts` — block collection and YAML parsing.
- `extensions/pi-brain/intent-blocks.yaml.ts` — YAML normalization.
- `extensions/pi-brain/build-renderers.ts` — TypeScript renderer.
- `extensions/pi-brain/build.ts` — `/brain:build` command.
- Updated PRD/ADR templates with intent block examples.

## Verification

- End-to-end build/diff/sync flow tested with a temporary brain.
- Existing wiki `data_model` blocks parse correctly and generate TypeScript.

## Known limitations

- Only the `types` target is implemented; additional renderers need their own build-renderers.

## Pull request

- PR #12: https://github.com/misabegovic/pi-brain/pull/12

## Related

- [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- [wiki/brain/adrs/structured-intent-and-build.md](../adrs/structured-intent-and-build.md)
- [wiki/brain/prds/structured-intent-and-build.md](../prds/structured-intent-and-build.md)
- [wiki/brain/bets/structured-intent-and-build.md](../bets/structured-intent-and-build.md)
