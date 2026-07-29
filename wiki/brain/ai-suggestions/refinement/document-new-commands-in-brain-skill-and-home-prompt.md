---
kind: ai-suggestion
status: draft
confidence: low
topic: documentation
created_at: 2026-07-29
---

# Document the new commands in `skills/brain/SKILL.md` and `prompts/brain-home.md`

## Observation

PR #12 added nine new commands (`/brain:build`, `/brain:diff`, `/brain:sync-code`, `/brain:revise`, `/brain:collaborate`, `/brain:enqueue`, `/brain:run-tasks`, `/brain:tasks`, `/brain:rfc-contribute`). Dedicated skills exist for each, but the main `skills/brain/SKILL.md` and the `prompts/brain-home.md` front door do not mention them.

## Why now

Users discover commands through the brain-home prompt and the general brain skill. If those entry points only describe the old commands, the new regenerative-intent features will be underused.

## Suggested action

1. Update `skills/brain/SKILL.md` to list the new commands with short usage examples.
2. Update `prompts/brain-home.md` to mention the regenerative-intent loop (build → diff → sync-code) and collaboration/RFC commands.
3. Keep the dedicated skills as the deep-dive destination.

## Sources

- `skills/brain/SKILL.md`
- `prompts/brain-home.md`
- `skills/brain-build/SKILL.md`
- `skills/brain-diff/SKILL.md`
- `skills/brain-sync-code/SKILL.md`
