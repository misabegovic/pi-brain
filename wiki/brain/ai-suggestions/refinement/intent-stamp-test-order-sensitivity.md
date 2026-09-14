---
title: intent-stamp test is order-sensitive when the corpus changes mid-suite
description: tests/intent-stamp.test.ts asserts the first stamp run reports "stamped 0, unchanged N" — an idempotence check that breaks whenever a wiki page was added or edited between the last stamp and the test run (observed 2026-09-14 during the v0.5.1 release, writing version-0-5-1.md). Two of 28 test files failed inside npm run validate, then passed on every standalone rerun.
kind: refinement
status: draft
confidence: low
sources:
  - tests/intent-stamp.test.ts
  - CHANGELOG.md
enola_intent:
  page:
    type: refinement
    status: draft
    anchors:
    - repo: pi-brain
      path: CHANGELOG.md
    - repo: pi-brain
      path: tests/intent-stamp.test.ts
---

> Unreviewed ai-suggestion — promote only via /brain:tend.

# intent-stamp test is order-sensitive when the corpus changes mid-suite

## Observation

During the v0.5.1 release, `npm run validate` reported "2 of 28 test files failed" immediately after `version-0-5-1.md` was written; standalone `npm test` then passed three times in a row, as did three consecutive full `npm run validate` runs after a re-stamp. The failure mode: `tests/intent-stamp.test.ts` step 1 requires `stamped 0, unchanged \d+` on the live wiki — true only when the committed corpus is byte-identical to a fresh derivation. Any page added/edited since the last stamp run (a normal part of release bookkeeping) violates that assumption until someone re-stamps.

## Why it matters

A validator that fails transiently trains people to re-run until green, which erodes trust in the gate exactly when it should be loudest (mid-release).

## Suggested change

Either:
1. Have the test stamp first (heal) and then assert idempotence on the *second* run — keeps the byte-for-byte property under test without assuming the corpus was pre-stamped; or
2. Keep the assertion but scope it to "no *unexpected* drift" by running `--check` first and healing drift deterministically before the strict pass.

Option 1 matches the tool's own idempotence contract.

## Related

- tests/intent-stamp.test.ts
- tools/brain-intent.mjs
