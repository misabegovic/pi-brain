---
kind: decision
status: accepted
confidence: low
---

# ADR — Upstream template sync mechanism

## Context

pi-brain is both a product template and a set of cloned instances. Each clone starts from the template but accumulates project-specific knowledge in `wiki/`, `sources/`, `log/`, and `_state/`. The template itself will keep changing (new commands, guardrails, skills). We need a mechanism for clones to adopt template improvements without losing their own data or forcing a manual file-by-file diff.

The default `adr-before-structural-changes` constraint also means template updates that introduce new constraints or contract changes must not be applied silently; they need human approval.

## Decision

Use a **reference-repo diff with interactive apply** for template updates.

- The upstream pi-brain repo is fetched into a temporary worktree/cache at a specific tag.
- The extension compares only the template-owned paths between the clone's recorded `template_version` and the target version.
- The user reviews each change interactively (`accept` / `skip` / `view diff`).
- Accepted changes are copied in; rejected changes are left out; `template_version` is updated only if at least one change is accepted.
- Conflicts caused by clone-side edits to template-owned files abort the update and point to manual merge instructions.

This mechanism is exposed as a `/brain:update` command and a matching extension tool.

## Alternatives considered

1. **Do nothing.** Users manually diff and copy files.
   - *Rejected:* error-prone, discourages updates, does not scale.

2. **Git subtree / subrepo.** Embed the upstream repo as a subtree and pull updates via git subtree merge.
   - *Rejected:* requires git expertise from users; merge conflicts in template-owned files are hard to reason about; pollutes clone history with upstream commits.

3. **GitHub "Use this template" only.** Treat template cloning as a one-time event with no update path.
   - *Rejected:* explicitly conflicts with the user need.

4. **npm / package distribution.** Ship pi-brain as an npm package and let `pi install` update it.
   - *Rejected:* pi-brain is a repo template with user-editable files, not a library; a package manager model does not fit template-owned vs. clone-owned boundaries.

5. **Reference-repo diff with interactive apply.** (Chosen.)
   - *Pros:* keeps upstream history out of the clone; respects the template/clone boundary; gives the user final say on every change; simple to explain.
   - *Cons:* requires network access to fetch upstream; does not auto-merge clone-side customizations; needs clear file boundary documentation.

## Consequences

- Clones can stay current with template improvements without manual diffing.
- The extension gains responsibility for knowing the template-owned file list and running the diff.
- Template releases must be tagged and include a `MIGRATION.md` for breaking changes.
- Updates that touch `AGENTS.md`, constraints, or skills are surfaced as high-signal decisions.
- Heavy customization of template-owned files pushes the user to a manual workflow, which is the right trade-off for safety.

## Related

- [wiki/brain/prds/upstream-template-sync.md](../prds/upstream-template-sync.md)
- [wiki/brain/bets/upstream-template-sync.md](../bets/upstream-template-sync.md)
- [wiki/brain/pitches/upstream-template-sync.md](../pitches/upstream-template-sync.md)
- [wiki/brain/constraints/adr-before-structural-changes.md](../constraints/adr-before-structural-changes.md)
