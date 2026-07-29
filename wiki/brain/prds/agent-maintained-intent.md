---
kind: initiative
status: living
confidence: low
appetite: medium
team: brain
repos: [brain]
---

# PRD — Agent-maintained intent

## Problem

pi-brain accumulates intent artifacts, but they go stale. New sources, code changes, user feedback, and subagent collaboration output often imply updates to existing PRDs, ADRs, bets, or records. Today the agent can only create new `ai-suggestions/` drafts or inbox items; it cannot propose a concrete revision to an existing approved artifact. This leads to artifact proliferation and drift between related intent documents.

Users want the agent to act like a colleague who says "this ADR is missing X" or "this PRD should be updated because Y" and produces a diff-style revision proposal.

## Appetite

Medium. One focused build phase: a revision proposal format, a command to generate proposals, and a safe workflow that keeps the approved artifact untouched until the human promotes it.

## Solution

Add an **agent-maintained intent** workflow where the agent can propose revisions to existing intent artifacts.

### Revision proposal format

A proposal is a markdown file in `wiki/<scope>/ai-suggestions/revisions/<slug>.md` with:

```yaml
---
kind: ai-suggestion
ai_suggestion: true
status: suggested
confidence: low
target: wiki/<scope>/prds/<slug>.md
---

# Suggested revision to PRD — <title>

## Target
[link to original artifact]

## Proposed changes

### Change 1
- **Location:** `## Solution`
- **Current text:** ...
- **Proposed text:** ...
- **Rationale:** ...

## Open questions
...

## Related
- Sources that motivated this revision
```

### Trigger

- `/brain:revise <scope> <target-slug>` — agent reviews the target artifact and proposes revisions based on current corpus state.
- Autonomous refinement protocol can also produce revision proposals when it finds strong evidence for an update.
- Multi-agent collaboration output can be turned into a revision proposal.

### What the agent may revise

- Add missing context or constraints.
- Update status (e.g., PRD from `living` to `superseded` if a newer record exists).
- Clarify scope or no-gos based on recent decisions.
- Link new sources.

### What the agent must NOT do

- Edit the approved artifact directly.
- Change the `kind` or `slug` of the artifact.
- Promote the proposal to the approved shelf.

### Promotion

- The human reviews the proposal.
- If accepted, the human runs `/brain:shape --record` or manually applies the changes and updates the artifact's `confidence`/`status`.
- The proposal is archived or deleted after promotion.

## No-gos

- No autonomous editing of approved shelves.
- No autonomous status changes to commitment-class artifacts.
- No proposals without cited sources.
- No merging of multiple unrelated changes into one proposal.

## Rabbit holes

- Trying to generate perfect diffs for every artifact type.
- Letting the agent revise constraints or ADRs without strong evidence.
- Storing proposals forever without cleanup.

## Related

- [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- [wiki/brain/bets/autonomous-refinement-protocol.md](../bets/autonomous-refinement-protocol.md)
- [wiki/brain/bets/multi-agent-intent-collaboration.md](../bets/multi-agent-intent-collaboration.md)
- [wiki/brain/constraints/adr-before-structural-changes.md](../constraints/adr-before-structural-changes.md)
