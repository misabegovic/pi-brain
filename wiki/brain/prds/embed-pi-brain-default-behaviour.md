---
kind: initiative
status: living
confidence: low
appetite: big
team: "pi-brain"
repos:
  - pi-brain
sources:
  - sources/doc/2026-07-27--pi-brain-embed-plan-md.md
---

# PRD — Embed pi-brain as default pi behaviour

## Problem

Today pi-brain is a repository template. A user must clone or convert a repo, keep code and content together, and explicitly enable autonomy before the agent acts brain-aware. This creates friction:

- **Activation friction:** Brain awareness is opt-in per clone (`/brain:auto`) rather than ambient whenever a brain home is present.
- **Distribution friction:** Every clone carries a full copy of skills, templates, personas, prompts, themes, and extension code. Updating the template requires `/brain:update` fetching files from GitHub into each clone.
- **Scope friction:** Working inside an arbitrary project repo does not automatically connect to the relevant brain unless `PI_BRAIN_HOME` or `.pi/brain-home` is set.

The result is that pi-brain behaves like an optional add-on instead of the default memory layer for pi.

## Appetite

**Big.** This is a multi-phase architectural change, but we will ship it as a sequence of small patch releases (`v0.2.1`, `v0.2.2`, `v0.2.3`, …) until the full initiative is complete and we are ready to call it `v0.3.0`. No single phase gets its own minor version.

## Solution

Make pi-brain install once as a global pi package and become the default memory behaviour whenever a brain home is present, while costing approximately nothing when no brain home exists.

### High-level shape

1. **Package-resolved resources.** Skills, templates, personas, prompts, themes, and the extension resolve from the installed package. Brain clones contain only content (`wiki/`, `sources/`, `log/`, `brain.config.yml`) and optional local overrides in `.brain/overrides/`.
2. **Global install + registration tiers.** After `pi install @misabegovic/pi-brain`, the extension is available in every pi session. Tools are split into tiers: always-active (`brain_status`, `brain_capture`), brain-home-active, and bootstrap-only.
3. **Ungated weave.** Every session with a brain home receives a small, stable tier-1 system-prompt injection that makes the agent brain-aware. `/brain:auto` escalates to the fuller autonomy prompt.
4. **Compaction harvest.** Before session compaction, extract decisions, constraints, and open questions from the messages about to be dropped and write them as one batched inbox item.
5. **Optional loop participation (Phase 5).** Constraint gating and relevant-record injection are prototyped only after Phases 1–4 are lived with.
6. **Consolidation (Phase 6).** Refactor the extension, rewrite docs for the install-once model, and extend tests.

### Release cadence

Each phase ships as a patch release:

| Phase | Release | Focus |
|-------|---------|-------|
| 0 | v0.2.1 | Baseline fixtures and token-cost metrics |
| 1 | v0.2.2 | Package-resolved resources, clone migration |
| 2 | v0.2.3 | Global install and tool tiers |
| 3 | v0.2.4 | Ungated weave |
| 4 | v0.2.5 | Compaction harvest |
| 5 | v0.2.6 (optional) | Loop participation prototypes |
| 6 | v0.3.0 | Consolidation, docs, tests |

Patch releases give us rollback granularity and avoid over-promising minor-version milestones per phase.

## No-gos

- **No fork of `earendil-works/pi`.** All behaviour is built through pi's documented extension API.
- **No changes to `misabegovic/pi`.** If a phase appears to need harness changes, the approach is wrong.
- **No commitment to Phase 5.** Constraint gate and relevant-record injection are explicitly optional and risky; they will be re-evaluated after Phases 1–4.
- **No pre-emptive Phase 6 refactor.** Splitting `extensions/pi-brain.ts` happens only after the behaviour phases settle.
- **No writing to commitment shelves without approval.** The confidence floor holds throughout.

## Rabbit holes

- **Package manifest coverage.** We must verify that `pi install` from a git ref picks up `skills`, `prompts`, and `themes` from the `pi` manifest, not just `extensions`.
- **Tool-count tax and prompt caching.** `pi.setActiveTools()` must be used additively, and no brain tool may carry `promptSnippet` or `promptGuidelines`.
- **Compaction extraction quality.** A harvest that floods the inbox trains users to ignore it. Start with heuristic extraction and measure noise.
- **Brain home discovery upward.** Walking up from nested directories is attractive but risks a brain claiming unrelated sibling repos. We will keep cwd-based discovery for now and revisit.
- **Existing clone breakage.** Phase 1 changes what a clone contains. The migration script must be tested against a copy of a real brain before any production brain is migrated.

## Related

- Source: [pi-brain embed plan](../../../sources/doc/2026-07-27--pi-brain-embed-plan-md.md)
- Constraint: [ADR before structural changes](../constraints/adr-before-structural-changes.md)
- Record: [pi-brain v0.2.0 release](../records/version-0-2-0.md)
- ADR: (to be drafted in Phase 2)
- Bet: (to be drafted in Phase 3)
