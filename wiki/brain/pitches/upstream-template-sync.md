---
kind: pitch
status: draft
confidence: low
appetite: medium
---

# Upstream template sync for pi-brain clones

## Problem

When a user clones pi-brain and starts maintaining their own project brain, the product template continues to evolve: new guardrails, new commands, bug fixes, better skills. Today there is no defined way to pull those upstream improvements into an existing clone without manually diffing files and risking overwrite of project-specific `wiki/`, `sources/`, and state.

The user said: *"I think I need a nice way to pull pi-brain updates into clones."*

## Appetite

Medium. The solution should not reimplement a package manager, but it should make routine template updates low-friction and safe enough that users actually do them.

## Solution sketch

A `/brain:update` command and a documented workflow that treat the pi-brain template as an upstream reference:

1. **Version the template.** pi-brain releases are tagged. A clone records its current template version in `brain.config.yml` or `.pi/template-version`.
2. **Compute a safe diff.** `/brain:update` fetches the latest template and shows only files that are "template-owned" (e.g., `AGENTS.md`, `skills/`, `prompts/`, `extensions/`, default constraints) while ignoring clone-owned data (`wiki/<scope>/`, `sources/<scope>/`, `log/`, `wiki/_state/`).
3. **Interactive apply.** The user reviews each template-owned change and accepts or skips it. Clone-owned files are never overwritten silently.
4. **Migration notes.** Each release includes a short `MIGRATION.md` for breaking changes or manual steps.
5. **Fallback to manual.** If the clone has diverged heavily, the command surfaces the conflict and points to a manual three-way merge.

## Risks and rabbit holes

- **Rebuilding npm/pip.** We should not turn pi-brain into a package manager. Keep it git-based.
- **Overwriting user data.** The biggest trust risk. The boundary between template-owned and clone-owned files must be explicit and tested.
- **Extension code drift.** If the user has customized `extensions/pi-brain.ts`, updates become merge conflicts.
- **Constraint/rule changes.** New default constraints could conflict with existing clone conventions; updates must surface these and require explicit approval.

## Next step

Turn this pitch into a shaped PRD + ADR by selecting a concrete mechanism (git subtree, reference-repo diff, GitHub template sync script, or extension-managed diff) and defining the template/clone file boundary.

## Related

- [wiki/brain/constraints/adr-before-structural-changes.md](../constraints/adr-before-structural-changes.md)
- [AGENTS.md](../../../../AGENTS.md)
