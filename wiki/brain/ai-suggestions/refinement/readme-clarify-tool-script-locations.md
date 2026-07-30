---
kind: ai-suggestion
status: draft
confidence: high
topic: documentation
created_at: 2026-07-30
---

# Clarify README instructions for locating `tools/` scripts

## Observation

The README tells users to run:

```bash
bash tools/clone-pi-brain.sh ~/projects/my-project-brain "My Org"
```

and

```bash
bash tools/setup-local.sh
```

immediately after `pi install @misabegovic/pi-brain`. Because the package is installed globally, those scripts live inside the global package directory (e.g., the pi package path), not in the user's current working directory. A user following the README literally will get `No such file or directory`.

## Suggested action

Add a short note in the **Quick start** and/or **Using pi-brain for your own project** sections that explains how to locate the `tools/` directory after global installation. For example:

> The helper scripts are bundled with the globally installed package. Find them with:
> ```bash
> pi where @misabegovic/pi-brain
> # or inspect the package install location, then run:
> bash <package-path>/tools/clone-pi-brain.sh ~/projects/my-project-brain "My Org"
> ```

If there is a simpler canonical way to expose these scripts (e.g., a `/brain:clone` command or a documented `npm`/`pi` path), prefer that and update the example commands.

## Sources

- `README.md` (source: README.md)
