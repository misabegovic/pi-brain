---
kind: initiative
status: living
confidence: low
appetite: medium
team: pi-brain
repos: [pi-brain]
---

# PRD — Upstream template sync for pi-brain clones

## Problem

When someone clones pi-brain for a project, the product template keeps improving: new skills, new commands, guardrail changes, bug fixes. Today there is no defined, safe way for that clone to pull in those upstream changes. Users must manually compare files, which is tedious and risks overwriting their own `wiki/`, `sources/`, `log/`, or `_state/`.

The user asked: *"I think I need a nice way to pull pi-brain updates into clones."*

## Appetite

Medium. We are willing to spend a focused build phase on a git-based update command, but we will not build a package manager or a general-purpose sync framework.

## Solution

Add a `/brain:update` command (and matching extension tool) that treats the pi-brain template as an upstream reference.

1. **Template version tracking.** Each pi-brain release is tagged (e.g., `v0.2.0`). A clone records the version it was created from in `brain.config.yml` under `template_version`. The extension also knows the hard-coded list of template-owned paths.
2. **Fetch upstream reference.** `/brain:update` clones or worktrees the upstream pi-brain repo at the requested tag into a temporary directory (e.g., `.pi/upstream-ref`).
3. **Compute a safe diff.** The command diffs only template-owned paths between the recorded version and the target version. Clone-owned paths are ignored entirely.
   - Template-owned: `AGENTS.md`, `skills/`, `prompts/`, `extensions/`, `tools/templates/`, default constraints in `wiki/org/constraints/` (for new clones), `.github/`.
   - Clone-owned: `wiki/<scope>/` (except default constraints), `sources/`, `log/`, `brain.config.yml` (except `template_version`), `wiki/_state/`.
4. **Interactive review.** Present each changed template-owned file with options: `accept`, `skip`, or `view diff`. Never overwrite silently.
5. **Apply accepted changes.** Copy accepted files from the upstream reference into the clone and update `template_version`.
6. **Migration notes.** If a release has breaking changes or manual steps, `MIGRATION.md` in the upstream repo is surfaced before any file is applied.
7. **Manual fallback.** If the clone has heavily customized template-owned files (e.g., a rewritten `extensions/pi-brain.ts`), the command detects conflicts and aborts with instructions for a manual three-way merge.

## No-gos

- No package manager, registry, or dependency resolution.
- No automatic overwrite of clone-owned data.
- No support for downgrading template versions.
- No attempt to merge customized extension code automatically.

## Rabbit holes

- **Extension code drift.** If a clone edits `extensions/pi-brain.ts`, every update becomes a conflict. We will detect this and bail rather than try a smart merge.
- **Constraint conflicts.** New default constraints might clash with how a clone already works. Updates that touch constraints must be surfaced as high-signal decisions.
- **Template vs. converted repo.** For converted repos (where the project code lives inside the brain), the "template-owned" boundary is the same; project code is still clone-owned.

## Related

- [wiki/brain/pitches/upstream-template-sync.md](../pitches/upstream-template-sync.md)
- [wiki/brain/adrs/upstream-template-sync.md](../adrs/upstream-template-sync.md)
- [wiki/brain/bets/upstream-template-sync.md](../bets/upstream-template-sync.md)
- [wiki/brain/constraints/adr-before-structural-changes.md](../constraints/adr-before-structural-changes.md)
- [wiki/brain/adrs/stronger-default-implementation-guardrails.md](../adrs/stronger-default-implementation-guardrails.md)
