---
name: brain-projects
description: List and manage onboarded projects in the pi-brain clone. Use when the user says "list projects", "what projects", or "brain projects".
---

# brain-projects

Every scope under `wiki/<scope>/` that is also listed in `brain.config.yml` `active_repos` is a project this brain is tracking.

## Command

```
/brain:projects
```

## Output

Lists each project with:

- Title (from `wiki/<scope>/index.md`)
- `status` and `confidence`
- Path to the project index

## When to use

- Orient yourself at the start of a session.
- Decide which scope to shape or investigate next.
- Check whether a repo has already been onboarded.
