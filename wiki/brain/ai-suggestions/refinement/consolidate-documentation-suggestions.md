---
kind: ai-suggestion
status: draft
confidence: medium
topic: documentation
created_at: 2026-07-29
---

# Consolidate the documentation suggestions into one PR

## Observation

The queue contains multiple overlapping documentation suggestions:

- `document-new-commands-in-brain-skill-and-home-prompt.md`
- `update-readme-for-regenerative-intent.md`
- `update-brain-setup-skill-for-new-workflow.md`
- `add-env-example-for-product-repo.md`

These are all about surfacing the PR #12/PR #13 changes to users.

## Why now

Handling them as one focused docs PR is more efficient than four separate PRs and reduces suggestion-queue clutter.

## Suggested action

1. Create a single PR titled `brain: document regenerative-intent workflow and PR-first setup`.
2. In that PR:
   - Update `skills/brain/SKILL.md` and `prompts/brain-home.md` with new commands.
   - Update `README.md` with the regenerative-intent overview.
   - Update `skills/brain-setup/SKILL.md` with PR-first and `npm run check` guidance.
   - Add `.env.example`.
3. Delete the four acted-on suggestions.
4. Run `brain_sync`.

## Sources

- `wiki/brain/ai-suggestions/refinement/document-new-commands-in-brain-skill-and-home-prompt.md`
- `wiki/brain/ai-suggestions/refinement/update-readme-for-regenerative-intent.md`
- `wiki/brain/ai-suggestions/refinement/update-brain-setup-skill-for-new-workflow.md`
- `wiki/brain/ai-suggestions/refinement/add-env-example-for-product-repo.md`
