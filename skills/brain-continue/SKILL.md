---
name: brain-continue
description: Continue in-flight pi-brain work — PRDs, ADRs, build tasks, or inbox items. Use when the user says "continue", "keep going", "resume", or references a slug/PR#.
---

# brain-continue

Resume work that was started but not finished. This skill detects the phase from the existing artifacts and picks up where things left off.

## Command

```
/brain:continue [slug-or-description]
```

## When to use

- The user says "continue", "resume", "keep going", or "where were we?".
- A `/brain:shape` phase was approved and the next phase needs to start.
- An inbox item was partially digested and needs follow-up.
- A PRD exists but its ADR pair was never written.

## Detection

1. Search the wiki for in-flight artifacts:
   - `status: draft` PRDs
   - `status: draft` or `status: suggested` ADRs
   - `ai_suggestion: true` pages awaiting graduation
   - Recent inbox items
2. If the user gives a slug or description, prefer matching that.
3. If multiple candidates exist, list them and ask which to continue.

## Continue paths

### PRD → ADR

If a PRD exists at `wiki/<scope>/prds/<slug>.md` and no matching ADR exists:

1. Load `personas/agents/tech-lead.md`.
2. Re-read the PRD and the relevant sources/sibling-repo code.
3. Run Phase 2 of `/brain:shape`: generate alternatives, ask the user to pick the bet, write `wiki/<scope>/adrs/<slug>.md`.
3. Run `brain_sync` and log.

### ADR → build

If the ADR is approved and the user wants to build:

1. Read the ADR/PRD pair.
2. Work in the sibling repo under `$BRAIN_PROJECTS_ROOT/<scope>`.
3. Capture progress in the brain inbox or wiki as you go.

### AI-suggestion → graduation

If the user wants to graduate an AI-suggested ADR/PRD:

1. Read the suggestion.
2. Iterate with the human on open questions.
3. Apply the graduation steps from `/skill:brain-shape` § AI-suggested drafts.
4. Run `brain_sync` and log.

### Inbox item

If continuing an inbox item:

1. Read `wiki/_state/inbox.md`.
2. Ask the user which item to continue.
3. Digest it (capture, shape, ingest, or write wiki pages).
4. Mark the item done by removing or updating it.

## Rules

- Never assume approval. Phase-end human gates still apply.
- Always run `brain_sync` before declaring continued work done.
- Prefer `brain_ask` over memory when refreshing context.
