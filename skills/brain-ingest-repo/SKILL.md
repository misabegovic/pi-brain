---
name: brain-ingest-repo
description: Onboard a repository as a maintained project in pi-brain without copying code into the brain.
---

# brain-ingest-repo

pi-brain is an intent store, not a code store. When you onboard a repository you want to track and maintain, the code stays outside the brain.

## Command

```
/brain:ingest-repo <path-or-url> [scope]
```

- `<path-or-url>` — local path or Git URL to the repository.
- `[scope]` — project scope name (default: repo basename).

## What it does

1. Inspects the repository (clones URLs to a temp dir if needed).
2. Writes a lightweight metadata snapshot to `sources/repos/<scope>.md`:
   - local path / URL / branch
   - file tree
   - README excerpt
3. Creates `wiki/<scope>/` with:
   - `index.md` — project overview and repo metadata
   - `state.md` — current state
   - `roadmap.md` — committed/shaping/candidate/parked work
   - `options.md` — options and anti-options
   - `constraints/` — empty shelf for project rules
   - `records/` — empty shelf for permanent current-truth records
4. Adds `<scope>` to `brain.config.yml` `active_repos`.
5. Logs the onboarding.

## What it does NOT do

- It does NOT copy the repository code into `sources/`.
- It does NOT create records. Records are written later, after deepdives and delivery, via `/brain:shape --record` or the Phase 5 record keeper.

## When to use

- You want pi-brain to track an external project.
- You want to shape work for a repo without making the brain a code mirror.

## When NOT to use

- To snapshot a one-time source for synthesis — use `/brain:in` or `brain_ingest`.
- To convert the current repo into a pi-brain clone where code lives inside the brain — use `/brain:convert`.
