---
kind: bet
status: accepted
confidence: medium
appetite: medium
prd: wiki/brain/prds/upstream-template-sync.md
adr: wiki/brain/adrs/upstream-template-sync.md
---

# Bet — Build `/brain:update` for safe upstream template sync

## What we are betting on

That a git-based, interactive `/brain:update` command — with a clear template-owned / clone-owned boundary — makes it practical for pi-brain clones to adopt template improvements without losing their own data.

## Why now

The template just gained significant new guardrails (default constraint, AGENTS.md stop-and-shape rule, skill changes). Without an update path, existing clones will drift from the product quickly and the value of those improvements will be lost.

## Appetite

Medium. One focused build phase: version tracking, reference diff, interactive apply, and a manual fallback. We will not build a package manager or auto-merge for customized extension code.

## Success looks like

- A user can run `/brain:update` in a clone and see only template-owned changes.
- The user can accept or skip each change; clone-owned `wiki/`, `sources/`, `log/`, and `_state/` are never modified.
- After accepting changes, `template_version` in `brain.config.yml` reflects the new version.
- If the clone has edited template-owned files, the command aborts with clear manual-merge instructions.
- A `MIGRATION.md` exists in the pi-brain repo for any release with breaking changes.

### Signals to cut losses

- The diff logic becomes complicated enough that it needs its own test framework.
- Users report that the interactive step is too noisy for routine updates.
- We find ourselves wanting to auto-merge extension code.

## Related

- [PRD](../prds/upstream-template-sync.md)
- [ADR](../adrs/upstream-template-sync.md)
- [Pitch](../pitches/upstream-template-sync.md)
