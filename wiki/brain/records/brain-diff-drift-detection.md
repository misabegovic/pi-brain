---
kind: record
status: delivered
scope: brain
sources:
  - wiki/brain/bets/brain-diff-drift-detection.md
  - wiki/brain/prds/brain-diff-drift-detection.md
  - wiki/brain/adrs/brain-diff-drift-detection.md
confidence: high
enola_intent:
  page:
    type: record
    status: delivered
    scope:
    - brain
    anchors:
    - repo: pi-brain
      path: wiki/brain/adrs/brain-diff-drift-detection.md
    - repo: pi-brain
      path: wiki/brain/bets/brain-diff-drift-detection.md
    - repo: pi-brain
      path: wiki/brain/prds/brain-diff-drift-detection.md
---

# Record — `/brain:diff` drift detection

## What was delivered

A structural drift report comparing YAML intent blocks to generated or target TypeScript interfaces. Detects missing interfaces, missing or extra fields, type mismatches, and optional mismatches.

## Implementation

- `extensions/pi-brain/diff.ts` — intent block parser, TypeScript interface parser, and structural diff.
- `extensions/pi-brain/commands.ts` — registered `/brain:diff`.
- Added `skills/brain-diff/SKILL.md`.

## Verification

- Diff correctly identifies drift between the wiki's `data_model` blocks and generated TypeScript.
- Edge cases handled: line comments, indented YAML lists, top-level keys.

## Pull request

- PR #12: https://github.com/misabegovic/pi-brain/pull/12

## Related

- [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- [wiki/brain/adrs/brain-diff-drift-detection.md](../adrs/brain-diff-drift-detection.md)
- [wiki/brain/prds/brain-diff-drift-detection.md](../prds/brain-diff-drift-detection.md)
- [wiki/brain/bets/brain-diff-drift-detection.md](../bets/brain-diff-drift-detection.md)
