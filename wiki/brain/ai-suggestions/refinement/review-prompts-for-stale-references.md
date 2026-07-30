---
kind: ai-suggestion
status: draft
confidence: low
topic: docs
created_at: 2026-07-30
---

# Review prompts for stale references

## Observation

Prompts under `prompts/` guide the agent at session start and in specific modes. Some prompts may reference commands or workflows that have changed.

## Why now

Accurate prompts improve the agent's behavior and reduce hallucinated commands.

## Suggested action

1. Read each file in `prompts/`.
2. Update command lists and workflow descriptions to match the current extension surface.
3. Remove references to deprecated commands.
4. Run `npm run validate` after edits.

## Sources

- `prompts/brain-home.md`
- `prompts/brain-autonomy.md`
- `prompts/brain-base.md`
