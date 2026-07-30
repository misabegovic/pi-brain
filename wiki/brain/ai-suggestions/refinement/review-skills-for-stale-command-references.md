---
kind: ai-suggestion
status: draft
confidence: low
topic: docs
created_at: 2026-07-30
---

# Review skills for stale command references

## Observation

The pi-brain surface has grown with new commands (`/brain:build`, `/brain:diff`, `/brain:sync-code`, `/brain:revise`, `/brain:collaborate`, `/brain:rfc-contribute`, `/brain:enqueue`, `/brain:run-tasks`). Some skills under `skills/brain*/SKILL.md` may predate these commands or reference old workflows.

## Why now

Accurate skills reduce confusion for both humans and agents.

## Suggested action

1. Read each `skills/brain*/SKILL.md`.
2. Update command lists and examples to match the current extension surface.
3. Remove references to commands or workflows that no longer exist.
4. Run `npm run validate` after edits.

## Sources

- `skills/brain/SKILL.md`
- `extensions/pi-brain/commands.ts`
