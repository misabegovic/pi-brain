---
name: brain-collaborate
description: Delegate intent work to specialized pi-brain subagents. Use when the user says "collaborate", "get another perspective", "review from all angles", or when an intent artifact needs multi-perspective input.
---

# brain-collaborate

Use this skill when an intent artifact (PRD, ADR, bet, record, constraint) would benefit from multiple expert perspectives.

## Command

```
/brain:collaborate <scope> <task>
```

Example:

```
/brain:collaborate brain "review the autonomous-refinement-protocol PRD from all angles"
```

## Agents

pi-brain ships four user-level subagents:

- `brain-pm` — framing, appetite, user personas, no-gos, rabbit holes.
- `brain-tech-lead` — alternatives, consequences, constraint checks, ADR structure.
- `brain-developer` — implementation fit, pattern fit, build-phase risks.
- `brain-security-reviewer` — trust boundaries, autonomy risks, abuse scenarios.

Each agent runs in an isolated `pi` subprocess with its own system prompt and tool set.

## When to use

- Before finalizing a PRD or ADR.
- When you suspect an intent artifact has unseen gaps or risks.
- During autonomous refinement when a finding looks cross-cutting.

## Output

The command returns structured feedback from each agent. Consolidate the findings and either:
- Capture low-risk observations in `ai-suggestions/`.
- Capture high-risk or ambiguous items in the inbox.
- Promote the artifact through `/brain:shape` if the collaboration reveals a need for commitment-class changes.

## Guardrails

- Subagents never edit approved shelves directly.
- Project-local agents (`.pi/agents/`) require trust confirmation.
- The parent agent (you) decides what to do with the feedback.
