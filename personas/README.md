# Personas

This directory holds the hats the agent wears when doing pi-brain work.

## Agent personas (`agents/`)

Internal archetypes the agent can adopt:

- `pm.md` — frames problems in user outcomes, appetite, and scope.
- `tech-lead.md` — turns shaped problems into technical decisions and alternatives.
- `developer.md` — implements approved decisions and surfaces implementation risks.
- `security-reviewer.md` — asks adversarial questions about trust boundaries and blast radius.

## User personas (`users/`)

Customer or user archetypes for the project this brain tracks.

## How personas are used

### Role-specific authoring

When a skill asks the agent to wear a persona, it `read`s the file and follows its framing. Examples:

- PM persona writes the PRD.
- Tech Lead persona writes the ADR.
- Developer persona implements the approved bet.

### Multi-perspective conversation

For cross-cutting or uncertain decisions, do not switch personas in sequence. Instead, write an **RFC** and let each persona contribute a section:

```
wiki/<scope>/rfcs/<slug>.md
  ├── PM perspective
  ├── Tech Lead perspective
  ├── Developer perspective
  └── Security Reviewer perspective
```

This keeps the conversation explicit, reviewable, and citable. The RFC becomes input to the PRD/ADR/bet.

## Evidence about users

User feedback and experiments live in their own shelves, not in personas:

- `wiki/<scope>/feedback/` — user feedback, interviews, support signals.
- `wiki/<scope>/experiments/` — A/B tests and other experiments.

These inform personas and decisions but are not personas themselves.
