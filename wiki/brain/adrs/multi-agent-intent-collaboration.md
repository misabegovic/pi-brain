---
kind: decision
status: accepted
confidence: low
---

# ADR — Multi-agent intent collaboration for pi-brain

## Context

The `regenerative-intent` epic envisions agents maintaining and updating intent in collaboration with humans and other agents. pi already ships a `subagent/` example that spawns separate `pi` subprocesses with isolated context windows, supporting single, parallel, and chain modes.

We need a decision on:
- How to represent pi-brain-specific agents.
- How to invoke them safely.
- Where their output goes.
- What guardrails prevent autonomous commitment.

## Decision

pi-brain will adopt the pi `subagent` pattern for multi-agent intent collaboration.

### Agent definitions

- pi-brain ships user-level agents under `personas/agents/`:
  - `brain-pm.md`
  - `brain-tech-lead.md`
  - `brain-developer.md`
  - `brain-security-reviewer.md`
- At install/package time, these are discoverable as user-level agents.
- Users can override or add project-local agents in `.pi/agents/`; project-local agents require trust confirmation before running.

### Invocation

- Add a `/brain:collaborate <scope> <task>` command.
- The command delegates to the `subagent` tool pattern: spawn `pi --mode json -p` subprocesses with the selected agent's system prompt and tool set.
- Support single, parallel, and chain modes.

### Output handling

- Agent feedback is consolidated by the parent session agent.
- Consolidated output is written to `ai-suggestions/` or inbox.
- Approved shelves are never edited by subagents.

### Limits

- Max 4 agents per parallel run.
- Max 4 concurrent agents.
- No recursive subagent spawning.
- No autonomous promotion of suggestions.

## Alternatives considered

1. **Single agent with persona-switching prompts.** Put all personas in one system prompt and ask the agent to switch hats.
   - *Rejected:* pollutes context, produces weaker reasoning, and makes it hard to compare independent perspectives.

2. **Custom agent runtime inside pi-brain.** Build a new orchestration layer instead of using `subagent`.
   - *Rejected:* reinvents a pattern pi already provides and maintains. The `subagent/` example is well-tested.

3. **RFC-only collaboration.** Keep collaboration inside RFC documents with sections per persona.
   - *Rejected:* RFCs are valuable but synchronous and single-agent. Subagents enable parallel, isolated reasoning.

4. **Adopt pi's `subagent` pattern with pi-brain-specific agents.** (Chosen.)
   - *Pros:* isolated contexts, proven pattern, easy to inspect, secure by default (project-local agents require trust).
   - *Cons:* spawns separate processes, so token usage and latency are higher; worth it for the quality of reasoning.

## Consequences

- pi-brain can produce richer intent artifacts by combining multiple perspectives.
- Autonomous refinement protocol can later invoke `brain:collaborate` to deepen its findings.
- The package must include agent markdown files and make them discoverable.
- Future bets (`/brain:build`, drift detection) can leverage the same agents.

## Related

- [wiki/brain/prds/multi-agent-intent-collaboration.md](../prds/multi-agent-intent-collaboration.md)
- [wiki/brain/bets/multi-agent-intent-collaboration.md](../bets/multi-agent-intent-collaboration.md)
- [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- [wiki/brain/adrs/autonomous-refinement-protocol.md](../adrs/autonomous-refinement-protocol.md)
- [wiki/brain/constraints/adr-before-structural-changes.md](../constraints/adr-before-structural-changes.md)
