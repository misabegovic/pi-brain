---
name: brain-update
description: Pull upstream pi-brain template updates into the current clone.
---

# brain-update

Use `/brain:update` to keep a pi-brain clone current with the upstream template.

## Command

```
/brain:update [--version=<tag>] [--apply]
```

- Without `--apply`: shows the template-owned files that differ between the clone's `template_version` and the target version.
- With `--apply`: copies the upstream template-owned files into the clone and updates `template_version`.
- If `--version` is omitted, the latest upstream release is used.

## What it updates

Template-owned paths only:

- `AGENTS.md`, `GETTING_STARTED.md`, `README.md`
- `extensions/`, `skills/`, `prompts/`, `themes/`
- `tools/templates/`, `tools/connectors/`, `tools/brain-*.mjs`, `tools/clone-pi-brain.sh`, `tools/setup-local.sh`, `tools/git-hooks/`
- `.github/`

Clone-owned paths are never touched:

- `wiki/<scope>/` (except default constraints created by setup)
- `sources/`
- `log/`
- `brain.config.yml` (except `template_version`)
- `wiki/_state/`

## When to use

- After a new pi-brain release to pick up guardrails, skills, commands, or bug fixes.
- When you want to see what has changed in the template since you created the clone.

## Workflow

1. Run `/brain:update` to see the diff summary.
2. Review the listed files.
3. Run `/brain:update --apply` to apply the changes.
4. Run `/brain:sync` to validate and refresh `wiki/index.md`.

## Safety

- If the clone has customized template-owned files, the update overwrites them. Review before applying.
- The command clones the upstream repo into `.pi/upstream-ref/` and deletes it afterward.
