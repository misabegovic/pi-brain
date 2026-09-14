---
title: Investigate ~45 dangling code anchors — self-repo name does not resolve
description: >-
  The 2026-09-14 enola check reports ~45 "Dangling code anchor" findings,
  every one with repo: pi-brain pointing at a wiki page that exists on disk
  (e.g. wiki/brain/adrs/autonomous-refinement-protocol.md). Likely cause:
  enola ran with built-in defaults (no mcp-arch.yaml), so the repo name
  "pi-brain" never resolved to this checkout. Teach enola the self-repo
  mapping or compile self-anchors repo-less.
kind: refinement
status: closed
confidence: low
source: enola check (2026-09-14) — 45 [intent] dangling-code-anchor findings
sources:
  - wiki/brain/ai-suggestions/enola/enola-regression-2026-09-14.md
  - wiki/brain/records/autonomous-refinement-protocol.md
enola_intent:
  page:
    type: refinement
    status: closed
---

> Unreviewed ai-suggestion — promote only via /brain:tend.

# Investigate ~45 dangling code anchors — self-repo name does not resolve

## Observation

The compiled `enola_intent` blocks in wiki records declare anchors as:

```yaml
anchors:
  - repo: pi-brain
    path: wiki/brain/adrs/autonomous-refinement-protocol.md
```

The 2026-09-14 check flags ~45 of these as `Dangling code anchor` — yet every target path exists on disk (verified for `wiki/brain/adrs/autonomous-refinement-protocol.md` and siblings). `enola doctor` reports "no mcp-arch.yaml in /home/muhamed/projects/pi-brain, using built-in defaults", and the same check notes "148 depends_on targets outside the graph; 352 imports targets outside the graph" — consistent with a repo-name that enola cannot map to a checkout. `active_repos` in `brain.config.yml` is empty, so nothing declares `pi-brain` to enola either.

## Why it matters

- Groom's dangling-anchor repair protocol (source: wiki/brain/records/enola-receipts-and-drift.md) would "fix" these by editing pages — but the anchors are correct; the resolver is what's missing. Repairing pages would destroy valid intent.
- Until resolved, every check re-reports ~45 false findings, drowning real signal.

## Suggested change

Pick one, after confirming with `enola govern`/a 0.4.11 build (see the grader-version-drift suggestion, which currently blocks clean grading):

1. Declare the self-repo mapping so `repo: pi-brain` resolves to this checkout (e.g. an `mcp-arch.yaml` or the enola repo config enola expects), or
2. Change `tools/brain-intent.mjs` to compile anchors for the brain home's own pages without a `repo:` prefix, if enola resolves repo-less anchors against the graded root.

## Resolution

Closed 2026-09-14. Investigation confirmed the anchors were page-to-page, not page-to-code: the intent explainer grades an anchor dangling when no measured fact touches the path, and compiled pages emit intent page facts which do not count as touches. All 50 dangling anchors targeted `wiki/` paths; all 21 code/manifest anchors joined. Fix: `tools/brain-intent.mjs` now skips `wiki/` sources (matching its own "page-to-code anchors" docstring), and the root `mcp-arch.yaml` declares `repo: .` so the self-repo name resolves. Intent explainer went from 50 findings to 0; `enola check` passes. Also surfaced: enola's mdintent parses frontmatter with strict YAML — an unquoted `description:` containing `key: value` fails extraction, while pi-brain's own validator passes it. Worth a validator hardening follow-up.

## Related

- wiki/brain/ai-suggestions/enola/enola-regression-2026-09-14.md — raw findings list.
- wiki/brain/ai-suggestions/refinement/enola-grader-version-drift.md — grading is currently declined; verify on a matched binary first.
- wiki/brain/records/enola-receipts-and-drift.md — the repair protocol this would feed.
