---
name: brain-deepdive
description: Transiently inspect a target repository file or directory during shaping or investigation. Use when the user says "deepdive", "look at the code", "inspect repo", or when shaping needs repo-level evidence.
---

# brain-deepdive

pi-brain stays repo-agnostic by default. The brain is an intent store, not a code mirror. When you need repo-level evidence to shape or investigate, use a **transient deepdive** instead of ingesting the whole repo into `sources/`.

## Command

```
/brain:deepdive <path> [question]
```

- `<path>` — absolute path or path relative to `ctx.cwd`.
- `[question]` — what you are looking for (stored in the dive record).

## What it does

1. Reads the file or directory without copying it into `sources/`.
2. Returns snippets with original file paths.
3. Stores a lightweight record in `wiki/_state/deepdives.json`:
   - timestamp
   - target path
   - question
   - list of files inspected
4. Lets you cite the repo path directly in the wiki (e.g., `sources are not needed; cite the repo path`).

## When to use

- Investigating a bug in the target repo.
- Shaping a feature and needing current code constraints.
- Checking whether an existing decision is still valid.

## When NOT to use

- To snapshot an external document or webpage — use `brain_ingest` instead.
- To permanently archive repo state — use a connector or `brain_ingest`.

## Rules

- Do not write repo content into `sources/` unless the user explicitly asks.
- Keep citations as repo paths, not source file paths.
- If the repo is outside the brain clone, use an absolute path or `$BRAIN_PROJECTS_ROOT/<scope>`.
