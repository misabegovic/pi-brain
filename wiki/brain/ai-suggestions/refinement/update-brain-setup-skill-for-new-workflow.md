---
kind: ai-suggestion
status: draft
confidence: low
topic: skills
created_at: 2026-07-29
---

# Update `skills/brain-setup/SKILL.md` for the new workflow

## Observation

`skills/brain-setup/SKILL.md` instructs agents how to bootstrap a pi-brain clone. The recent changes (TypeScript `check` script, PR-first workflow, new commands) may not be reflected in the setup skill.

## Why now

New clones set up after PR #13 should be aware of the `check` script and the PR-first delivery model from the start. An outdated setup skill may lead agents to push directly to `main` in new clones.

## Suggested action

1. Read `skills/brain-setup/SKILL.md`.
2. Add steps to:
   - Run `npm install` and `npm run check` after cloning.
   - Create a `.env` from `.env.example` (once `.env.example` exists).
   - Use feature branches and PRs for changes, even if `LOCAL_FIRST=true` is set.
3. Link to the PR-first constraint.

## Sources

- `skills/brain-setup/SKILL.md`
- `wiki/brain/constraints/remote-promotion-requires-pr.md`
