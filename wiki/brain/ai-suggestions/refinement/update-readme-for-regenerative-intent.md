---
kind: ai-suggestion
status: draft
confidence: low
topic: documentation
created_at: 2026-07-29
---

# Update README.md for regenerative-intent features

## Observation

`README.md` is the human onboarding entry point. PR #12 delivered a major evolution (build, diff, sync-code, revise, collaborate, tasks, rfc-contribute), but the README likely still describes the older intent-store workflow.

## Why now

New users and contributors need to know that pi-brain can now generate code from intent, detect drift, and support multi-agent collaboration. Without README coverage, these features are discoverable only through skills or by reading the wiki.

## Suggested action

1. Read `README.md`.
2. Add a "Regenerative intent" section summarizing the build/diff/sync loop and the new commands.
3. Update command lists and quick-start examples if needed.
4. Link to the regenerative-intent epic for details.

## Sources

- `README.md`
- `wiki/brain/epics/regenerative-intent.md`
