---
kind: decision
status: accepted
confidence: low
---

# ADR — Agent-maintained intent

## Context

The `regenerative-intent` epic requires agents to maintain and update intent in collaboration with humans. We already have:
- Autonomous refinement protocol (read-only suggestions).
- Multi-agent collaboration (perspectives on intent).
- `/brain:build` and `/brain:diff` (code from intent, drift detection).

The missing piece is a safe way for agents to propose concrete revisions to existing intent artifacts.

## Decision

pi-brain will support **revision proposals** as AI-suggested drafts that target a specific approved artifact. Proposals live in `wiki/<scope>/ai-suggestions/revisions/` and are never promoted without human approval.

### Proposal lifecycle

1. **Create:** Agent drafts a revision proposal with cited sources.
2. **Review:** Human inspects the proposal.
3. **Apply:** Human either applies the changes manually or through `/brain:shape`.
4. **Archive:** Proposal is removed or marked `applied` after promotion.

### Format

Proposals use the existing `ai-suggestion: true` convention with a `target:` frontmatter field pointing to the artifact being revised.

### Creation triggers

- `/brain:revise <scope> <slug>` command.
- Autonomous refinement protocol when it finds strong evidence.
- Multi-agent collaboration when consensus suggests a change.

### Safety

- Proposals are always drafts in `ai-suggestions/`.
- Approved shelves are never edited by the agent.
- Every change in a proposal must cite a source.
- High-risk or structural revisions become inbox tasks instead.

## Alternatives considered

1. **Allow agents to edit approved artifacts directly.**
   - *Rejected:* violates the `adr-before-structural-changes` constraint and erodes trust.

2. **Use inline comments/annotations in the original artifact.**
   - *Rejected:* pollutes approved shelves and complicates parsing.

3. **Create a new version of the artifact each time.**
   - *Rejected:* duplicates files and loses the relationship to the original.

4. **AI-suggested revision proposals in a separate directory.** (Chosen.)
   - *Pros:* clear separation from approved shelves, easy to review, fits existing `ai-suggestions/` pattern.
   - *Cons:* requires cleanup discipline; proposals can accumulate.

## Consequences

- Agents can maintain intent iteratively instead of only adding new artifacts.
- Humans retain final approval over all intent changes.
- The autonomous refinement protocol and collaboration tools become more actionable.
- Future work may add `/brain:sync-intent` to apply low-risk proposals automatically under explicit trust.

## Related

- [wiki/brain/prds/agent-maintained-intent.md](../prds/agent-maintained-intent.md)
- [wiki/brain/bets/agent-maintained-intent.md](../bets/agent-maintained-intent.md)
- [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- [wiki/brain/adrs/autonomous-refinement-protocol.md](../adrs/autonomous-refinement-protocol.md)
- [wiki/brain/adrs/multi-agent-intent-collaboration.md](../adrs/multi-agent-intent-collaboration.md)
- [wiki/brain/constraints/adr-before-structural-changes.md](../constraints/adr-before-structural-changes.md)
