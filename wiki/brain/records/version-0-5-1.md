---
kind: record
status: delivered
scope: brain
confidence: high
sources:
  - CHANGELOG.md
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

# Record — pi-brain v0.5.1 release

## What shipped

v0.5.1 is a maintenance release restoring the enola architecture gate to working order and catching the brain's release bookkeeping up (source: `CHANGELOG.md` section `[0.5.1]`):

- **Root `mcp-arch.yaml`** declaring the graded scope (`repo: .`) and excluding `.pi/` — the embedded upstream-template clone that duplicated every enola finding (~1,100 phantom symbols, ~1,729 facts).
- **Enola grading binary pinned** via `enola.binary` to the stock upstream build (`enola-oss`, upgraded v0.4.11 → v0.4.19); the PATH copy was a 0.4.10 downstream build that made every `enola check` decline with `version_mismatch`. Baseline re-pinned at 0.4.19 (extractors v265, 19 explainers incl. `import-closure`).
- **`brain-intent.mjs` page-to-code anchor fix**: `wiki/` sources no longer compile into anchors. Anchors are page-to-code by design; all 50 dangling findings were page-to-page false positives (intent findings now 0, `enola check` PASS).
- **Release bookkeeping**: records for the previously unrecorded v0.4.0 and v0.5.0 releases; `template_version` bumped to v0.5.0; stale v0.4.0 npm-OTP inbox item archived; 0.3.6-era `.enola-b/` state removed; `.pi/` gitignored.

## Verification

- `npm run validate` green: tsc, 28/28 test files, 0 dead links, intent-stamp `--check`.
- `enola check` PASS at enola 0.4.19 against the re-pinned baseline (1,866 facts, intent explainer 0 findings).

## Related

- [wiki/brain/records/version-0-5-0.md](version-0-5-0.md)
- [wiki/brain/records/version-0-4-0.md](version-0-4-0.md)
- `CHANGELOG.md` (repo root) — section `[0.5.1]`
