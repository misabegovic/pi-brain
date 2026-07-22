---
kind: record
status: current
confidence: high
decided_by: wiki/brain/adrs/stronger-default-implementation-guardrails.md
implemented_in:
  - AGENTS.md
  - wiki/brain/constraints/adr-before-structural-changes.md
  - skills/brain/SKILL.md
  - skills/brain-shape/SKILL.md
  - skills/brain-setup/SKILL.md
  - prompts/brain-home.md
---

# Record — Stronger default guardrails against eager implementation

## What this is

The current, approved state of the guardrails that prevent agents from implementing structural changes before an ADR is approved.

## Current truth

- `AGENTS.md` contains an explicit "Stop and shape" governance rule and an agent checklist to run before mutating files.
- A default `must` constraint, `adr-before-structural-changes`, ships in `wiki/brain/constraints/adr-before-structural-changes.md` and is created by `/brain:setup` in new clones.
- The `brain`, `brain-shape`, and `brain-setup` skills reinforce the rule.
- The `/brain-home` prompt reminds the agent of the contract at session start.
- Structural/repo changes must be routed through `/brain:shape` and have an accepted ADR before implementation.

## Origin

- Decision: [ADR — Stronger default guardrails against eager implementation](../adrs/stronger-default-implementation-guardrails.md)
- Feedback: [Feedback — Agent implemented structural changes before ADR approval](../feedback/eager-implementation-contract-breach.md)

## Implementation

- `AGENTS.md` — added governance rule and "Stop and shape" section.
- `wiki/brain/constraints/adr-before-structural-changes.md` — default `must` constraint.
- `skills/brain/SKILL.md` — added "Stop and shape structural changes" rule.
- `skills/brain-shape/SKILL.md` — added structural-first language, constraint gate, and implementation gate.
- `skills/brain-setup/SKILL.md` — setup now creates the default constraint.
- `prompts/brain-home.md` — session-start reminder of the contract.

## Boundaries

- Extension-level automated blocking is explicitly out of scope; the guardrails are cultural and procedural.
- The constraint can be retired if a project explicitly agrees it no longer applies.

## Related

- [sources/brain/feedback/eager-implementation-session-snippet.md](../../../../sources/brain/feedback/eager-implementation-session-snippet.md)
