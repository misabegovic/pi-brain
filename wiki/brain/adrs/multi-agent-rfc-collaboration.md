---
kind: decision
status: accepted
confidence: low
---

# ADR — Multi-agent RFC collaboration

## Context

We already have multi-agent intent collaboration via `/brain:collaborate`, which runs agents in parallel or chains on an intent artifact. RFCs are a natural next step: they are explicitly multi-perspective documents, and they benefit from asynchronous contributions over time.

## Decision

pi-brain will extend RFCs to support asynchronous contributions from subagents and humans.

### Changes to RFCs

- RFCs include a `## Contributions` section.
- Each contribution is an appended entry with timestamp, author, and text.
- Contributions are never deleted or rewritten silently.

### Contribution command

`/brain:rfc-contribute <scope> <slug> <agent> <prompt>` runs the named subagent on the RFC and appends the result as a contribution.

### Agent selection

- Any user-level subagent in `personas/agents/` can contribute.
- Project-local agents require trust confirmation.

### Human contributions

Humans can contribute by editing the RFC directly or via `/brain:rfc-contribute <scope> <slug> human <note>`.

### Attribution

Every contribution records:
- `author` — agent name or `human`
- `date` — ISO timestamp
- `task` — the prompt or task that generated the contribution
- `text` — the contribution content

### Promotion

RFCs are still pre-bet/pre-decision artifacts. When ready, they are promoted to ADRs/PRDs through `/brain:shape`, not autonomously.

## Alternatives considered

1. **Create a separate comment thread format outside RFCs.**
   - *Rejected:* fragments the conversation; contributions should live with the RFC.

2. **Auto-generate RFC contributions whenever an agent has an opinion.**
   - *Rejected:* would flood RFCs with noise; contributions should be intentional.

3. **Use the existing `/brain:collaborate` command and paste output into RFCs manually.**
   - *Rejected:* too manual; a dedicated command makes the workflow smoother.

4. **Append-only contribution section with dedicated command.** (Chosen.)
   - *Pros:* simple, traceable, preserves history, integrates with existing subagent pattern.
   - *Cons:* RFCs can grow long; may need compaction later.

## Consequences

- RFCs become living conversation artifacts.
- Agents can asynchronously contribute expertise as a decision evolves.
- Humans retain control over promotion to commitment-class artifacts.
- Future work may add contribution summarization or compaction.

## Related

- [wiki/brain/prds/multi-agent-rfc-collaboration.md](../prds/multi-agent-rfc-collaboration.md)
- [wiki/brain/bets/multi-agent-rfc-collaboration.md](../bets/multi-agent-rfc-collaboration.md)
- [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- [wiki/brain/adrs/multi-agent-intent-collaboration.md](../adrs/multi-agent-intent-collaboration.md)
- [wiki/brain/constraints/adr-before-structural-changes.md](../constraints/adr-before-structural-changes.md)
