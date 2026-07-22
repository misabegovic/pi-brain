---
name: brain-setup
description: Bootstrap or reconfigure a directory as a pi-brain home. Use when the user says "set up pi-brain", "initialize a brain", or "create a new project brain".
---

# brain-setup

Turn any directory into a pi-brain home.

## Command

```
/brain:setup
```

## What it does

1. Asks for the organisation or project name.
2. Asks for active repositories (comma-separated).
3. Writes `brain.config.yml`.
4. Asks whether to enable **auto-connect** (run configured connectors opportunistically when autonomy is on).
5. Creates the directory skeleton if missing:
   - `wiki/` and `wiki/_state/inbox.md`
   - `sources/README.md`
   - `log/log.md`
   - `wiki/index.md`
6. Creates the default `must` constraint:
   - `wiki/org/constraints/adr-before-structural-changes.md`
7. Regenerates `wiki/index.md` and validates frontmatter.

## When to use

- Setting up pi-brain in a fresh clone.
- Reconfiguring the org name or active repos later.
- Bootstrapping a project- or customer-specific brain.

## After setup

- Update `brain.config.yml` manually if you need connectors.
- Install the pi-brain package: `pi install ./` (from the brain directory).
- Review `wiki/org/constraints/adr-before-structural-changes.md`. Retire it only if the project explicitly agrees the rule no longer applies.
- Start capturing, ingesting, and shaping.
