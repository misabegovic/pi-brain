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

# Record — pi-brain v0.5.0 release

## What shipped

v0.5.0 ships workflow parity with the origin brain's enola surface and the intent-first contract (source: `CHANGELOG.md` section `[0.5.0]`):

- **Intent compilation**: every wiki page carries a derived `enola_intent:` block (`node tools/brain-intent.mjs`, idempotent, `--check` wired into `npm run validate`); kind, scope, supersedes relations, and resolvable citations compile into knowledge nodes and page-to-code anchors.
- **Govern reverse query**: `brain_enola` gains `operation: "govern"` and `/brain:enola-govern <target>` — which compiled pages govern a file or symbol, with relation trails.
- **Intent-first gates**: the first write into each sibling repo per piece of work is blocked once with its governing pages surfaced; code-without-spec turns carry an intent-debt accounting. Config-gated via `intent_first` (default enabled).
- **Enola workflow parity**: `/brain:enola-plan` (pre-edit contract), `/brain:enola-findings` (snapshot findings joined against a judgment ledger), `/brain:enola-judge` (write-on-judgment verdicts at `wiki/_state/enola-verdicts.json`).
- **Enola hardening**: `enola check` exit 3 (baseline not comparable) is a non-verdict, not a regression; env-first binary resolution (`ENOLA_BINARY`, `enola.binary`, PATH); `enola-intent.yaml` declares every direct dependency with a stated purpose (enola v0.4.8 rule H14).
- **Simplification**: one frontmatter/YAML helper lib for tools, one enola artifact resolver, one glob-runner test script, `runEnolaGovern` decomposed (cyclomatic 62 → helpers).
- Verified against enola v0.4.11 and re-baselined (1,730 facts at v0.4.11); receipt carries `format_version: 1` per the v0.4.10 artifact contract.

## Pull requests

- PR #87: intent compilation — derived `enola_intent` stamping and the govern reverse query.
- PR #88: brain-intent resolves the brain home env-first like every other tool.
- PR #89: one parser lib, one artifact resolver, one test runner, govern decomposed.
- PR #90: cycle-finding verdict recorded — module-level cycle is a directory-aggregation artifact; file-level graph acyclic.
- PR #91: intent-first gates — governing specs surfaced before sibling code moves.
- PR #92: intent surface needs enola v0.3.9 or later (docs).
- PR #93: enola v0.4.11 — declined is a non-verdict, and workflow parity with the origin brain.

## npm publication

- Published to npm as `@misabegovic/pi-brain@0.5.0` (2026-08-31; verified on the registry 2026-09-14).

## Related

- [wiki/brain/records/version-0-4-0.md](version-0-4-0.md)
- [wiki/brain/records/version-0-3-3.md](version-0-3-3.md)
- [wiki/brain/adrs/structured-intent-and-build.md](../adrs/structured-intent-and-build.md)
- `CHANGELOG.md` (repo root) — section `[0.5.0]`
