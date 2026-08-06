---
kind: decision
status: accepted
confidence: low
sources:
  - sources/doc/2026-07-27--pi-brain-embed-plan-md.md
enola_intent:
  page:
    type: decision
    status: accepted
    anchors:
    - repo: pi-brain
      path: sources/doc/2026-07-27--pi-brain-embed-plan-md.md
---

# ADR — Embed pi-brain as default pi behaviour

## Context

pi-brain is currently a repository template. A user clones or converts a repo, keeps content and code together, and must explicitly enable autonomy before the agent behaves brain-aware. This makes pi-brain an optional add-on rather than the default memory layer for pi.

The source plan (see (source: sources/doc/2026-07-27--pi-brain-embed-plan-md.md)) evaluated pi's documented extension API and concluded that every required capability — global availability, system-prompt weaving, agent-loop participation, centrally updated skills/templates — is reachable without forking the harness.

The active constraint [ADR before structural changes](../constraints/adr-before-structural-changes.md) requires an approved ADR before we change repository layout, the extension, or the distribution model. This ADR satisfies that gate.

## Decision

Adopt **Alternative A**: distribute pi-brain as a global pi package and resolve skills, templates, personas, prompts, themes, and the extension from the installed package. Brain clones contain only content (`wiki/`, `sources/`, `log/`, `brain.config.yml`) and optional local overrides in `.brain/overrides/`.

This means:

- The canonical distribution command becomes `pi install @misabegovic/pi-brain` (or from a git ref during pre-release testing).
- New clones are scaffolded with content directories only.
- Existing clones are migrated by `tools/migrate-clone.mjs`, which strips template-owned paths and writes genuine local divergence into `.brain/overrides/`.
- The current `/brain:update` GitHub-fetch mechanism is retained as a fallback, but the primary update path becomes package-manager updates. `/brain:update` will first attempt `pi install @misabegovic/pi-brain@latest` and fall back to the existing GitHub release diff/apply flow if the package update path is unavailable or fails. This preserves the existing behaviour for clones that still rely on it while nudging users toward the simpler package path.
- All changes stay in `misabegovic/pi-brain`; the diff against `earendil-works/pi` remains empty.

## Alternatives considered

### A — Global install + package-resolved resources *(chosen)*

Pros: one canonical copy of code/templates; clones become content-only; matches pi's extension manifest model; no fork.  
Cons: requires verifying `pi install` manifest coverage; existing clones need migration; `/brain:update` GitHub channel is retired.

### B — Keep clone-everything model

Pros: simple mental model; no package-manager risk; works today.  
Cons: hand-rolled distribution; heavier drift-prone clones; cannot become default behaviour.

### C — Embed pi-brain into `misabegovic/pi`

Pros: true default behaviour; tightest integration.  
Cons: violates the standing constraint of no harness changes; permanent rebase liability; slower release cadence. Rejected.

### D — Vendored per-project package

Pros: version pinning per project; uses extension API.  
Cons: requires every project to opt-in; does not solve capture-from-anywhere; more configuration.

### E — Do nothing

Pros: no architectural risk; stable.  
Cons: does not address the problem statement.

## Consequences

### What becomes easier

- Updating pi-brain becomes `pi update @misabegovic/pi-brain` instead of `/brain:update` fetching files into every clone.
- New brains are smaller and content-focused.
- The extension can be present in every pi session, enabling tiered brain awareness.

### What becomes harder

- We must verify that pi's package installer loads `skills`, `prompts`, and `themes` from a git ref, not only `extensions`.
- Existing clones need a one-time migration with a dry-run option.
- Local divergence detection in `tools/migrate-clone.mjs` must be careful not to discard user customizations.

### What becomes riskier

- A bug in resource resolution breaks all brains until the package is updated.
- Mitigation: `resolveResource` logs under `PI_BRAIN_DEBUG=1`, and Phase 1 ships behind a pre-release tag tested against a throwaway clone.

## Related

- PRD: [Embed pi-brain as default pi behaviour](../prds/embed-pi-brain-default-behaviour.md)
- Constraint: [ADR before structural changes](../constraints/adr-before-structural-changes.md)
- Source: (source: sources/doc/2026-07-27--pi-brain-embed-plan-md.md)
- Record: [pi-brain v0.2.0 release](../records/version-0-2-0.md)
- Bet: (to be drafted in Phase 3)
