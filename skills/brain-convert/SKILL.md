---
name: brain-convert
description: Convert the current repository into a pi-brain clone where the codebase lives inside the brain. Use when the user says "convert this repo", "make this a brain", or "pi-brain inside the project repo".
---

# brain-convert

Turn the current repository into a pi-brain clone. The project code moves into a subdirectory (default: `files/`) so the repo holds both the knowledge base and the codebase.

## Command

```
/brain:convert [subdir] [--dry-run]
```

- `[subdir]` — where existing project files go (default: `files`).
- `--dry-run` — preview what would move/create without changing anything.

## What it does

1. Checks that the directory is not already a pi-brain home.
2. Creates `wiki/`, `sources/`, `log/`, `brain.config.yml`.
3. Moves all existing files/dirs (except `.git`, `node_modules`, `dist`, `build`, `.github`, etc.) into `subdir/`.
4. Creates `wiki/index.md`, `wiki/org/state.md`, `roadmap.md`, `options.md`.
5. Adds the current directory name as an active repo scope.
6. Writes an initial `AGENTS.md` if none exists.
7. Logs the conversion.

## Warnings

- This restructures the repository. Back up or commit first.
- It does not auto-commit the restructure.
- After conversion, update build tools and CI paths to account for the new `subdir/` layout.

## When to use

- You want a single repo that is both the project codebase and the pi-brain knowledge base.
- You prefer not to maintain a separate brain clone.

## When NOT to use

- You want the brain to stay repo-agnostic and track multiple external projects — use `/brain:ingest-repo` instead.
