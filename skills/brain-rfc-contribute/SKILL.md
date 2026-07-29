---
name: brain-rfc-contribute
description: Add asynchronous agent or human contributions to RFCs. Use when the user says "contribute to RFC", "agent review this RFC", "/brain:rfc-contribute", or when an RFC needs another perspective.
---

# brain-rfc-contribute

Add attributed contributions to RFCs from subagents or humans.

## Command

```
/brain:rfc-contribute <scope> <slug> <agent|human> <prompt>
```

Examples:

```
/brain:rfc-contribute brain background-task-runner brain-security-reviewer "review the trust section"
/brain:rfc-contribute brain background-task-runner human "I think we should also consider failure isolation"
```

## How it works

1. Loads the RFC from `wiki/<scope>/rfcs/<slug>.md`.
2. If author is an agent, runs the agent in a subprocess with the RFC content and task.
3. Appends the contribution to the `## Contributions` section with attribution and timestamp.
4. If no `## Contributions` section exists, it is created.

## Contribution format

```markdown
### 2026-07-28 — brain-security-reviewer

**Task:** review the trust section

Contribution text here...
```

## Guardrails

- Contributions are append-only; existing contributions are never rewritten.
- Project-local agents require trust confirmation.
- RFC promotion to ADR/PRD still goes through `/brain:shape`.

## Related

- [wiki/brain/bets/multi-agent-rfc-collaboration.md](../../../wiki/brain/bets/multi-agent-rfc-collaboration.md)
