---
name: brain-revise
description: Propose revisions to existing intent artifacts. Use when the user says "revise", "update this PRD", "this ADR is stale", "/brain:revise", or when current evidence suggests an approved artifact needs updating.
---

# brain-revise

Propose concrete revisions to existing approved intent artifacts without editing them directly.

## Command

```
/brain:revise <scope> <kind>/<slug>
```

Example:

```
/brain:revise brain prds/structured-intent-and-build
```

## How it works

1. Loads the target artifact from `wiki/<scope>/<kind>/<slug>.md`.
2. Prompts the agent to review it against the current corpus.
3. The agent drafts a revision proposal in `wiki/<scope>/ai-suggestions/revisions/<slug>.md`.
4. The proposal includes targeted changes, rationale, and source citations.

## Allowed targets

- `prds/`
- `adrs/`
- `bets/`
- `records/`

## Output rules

- Proposals are AI suggestions; they live in `ai-suggestions/revisions/`.
- Approved shelves are never edited by the agent.
- Every proposed change must cite a source.

## Enola guidance (optional)

If enola is enabled and the artifact concerns code structure, run `brain_enola` with `operation: "diff"` to see if the codebase has drifted from the decision's architecture assumptions. Include drift findings in the revision rationale. Skip silently if enola is unavailable.
- High-risk or uncertain revisions become inbox tasks instead.

## Promotion

After review, the human can:
- Apply the changes manually and update the artifact.
- Use `/brain:shape` to graduate the proposal.
- Discard the proposal and delete the file.

## Related

- [wiki/brain/bets/agent-maintained-intent.md](../../../wiki/brain/bets/agent-maintained-intent.md)
