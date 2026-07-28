---
kind: initiative
status: living
confidence: low
appetite: medium
team: brain
repos: [brain]
---

# PRD — Multi-agent intent collaboration for pi-brain

## Problem

pi-brain stores intent in PRDs, ADRs, bets, records, and constraints, but a single agent turn must context-switch between PM, Tech Lead, Developer, and Security Reviewer perspectives. This produces shallow reasoning and makes it easy to miss conflicts between product appetite, technical consequences, implementation fit, and risk.

Users want autonomous mode to feel like a team of colleagues who can each look at the same intent artifact from their own angle and produce a consolidated perspective.

## Appetite

Medium. One focused build phase: define the agents, add a delegation command/tool, and prove collaboration on a single intent artifact type (PRDs or ADRs).

## Solution

Add a **multi-agent intent collaboration** capability built on pi's `subagent` pattern.

### Agents

Define pi-brain-specific subagents under `personas/agents/` as markdown files with YAML frontmatter:

- `brain-pm.md` — framing, appetite, user personas, no-gos, rabbit holes.
- `brain-tech-lead.md` — alternatives, consequences, ADR structure, constraint conflicts.
- `brain-developer.md` — implementation fit, pattern fit, build-phase concerns.
- `brain-security-reviewer.md` — trust boundaries, risk, attack surface.

Each agent gets a scoped system prompt and a restricted tool set (read, grep, find, ls, bash for shallow exploration).

### Trigger

- `/brain:collaborate <scope> <task>` command, e.g. `/brain:collaborate brain "review the autonomous-refinement-protocol PRD from all angles"`.
- Alternatively, a `brain_collaborate` tool callable by the LLM.

### Modes

- **Single:** one agent, one task.
- **Parallel:** multiple agents review the same artifact simultaneously and produce independent feedback.
- **Chain:** sequential workflow, e.g., PM frames → Tech Lead evaluates alternatives → Developer checks fit → Security Reviewer flags risks.

### Output

- Each agent returns structured feedback:
  - Perspective (PM/Tech Lead/Developer/Security)
  - Findings (gaps, risks, suggestions)
  - Recommended next action
- Consolidated output is written to:
  - `wiki/<scope>/ai-suggestions/adrs/<slug>.md` or `prds/<slug>.md` for revision proposals.
  - `wiki/_state/inbox.md` for high-risk or ambiguous items.
- The parent agent (the one running the session) decides whether to promote, ignore, or shape the suggestions.

### Safety

- Project-local agents (`.pi/agents/`) require trust confirmation, mirroring the `subagent/` security model.
- User-level agents (`personas/agents/` or `~/.pi/agent/agents/`) are always loaded.
- Agents never edit approved shelves directly.
- Chain/parallel runs are capped (e.g., max 4 agents, max 4 concurrent).

## No-gos

- No autonomous approval or graduation of suggestions.
- No direct code generation in this bet (that is `/brain:build`).
- No background scheduling (that is the background-task-runner bet).
- No replacement of the human `/brain:shape` workflow — collaboration produces input for it.

## Rabbit holes

- Building a custom agent orchestration framework instead of reusing pi's `subagent` pattern.
- Letting agents recursively spawn each other.
- Trying to make every agent use the strongest model; start with a single default model.

## Related

- [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- [wiki/brain/adrs/autonomous-refinement-protocol.md](../adrs/autonomous-refinement-protocol.md)
- [wiki/brain/bets/autonomous-refinement-protocol.md](../bets/autonomous-refinement-protocol.md)
- [wiki/brain/constraints/adr-before-structural-changes.md](../constraints/adr-before-structural-changes.md)
