---
kind: feedback
status: captured
confidence: medium
source: user-session
---

# Feedback — Agent implemented structural changes before ADR approval

## Source

User reflection from a session in another pi-brain clone, shared as a lesson for improving the pi-brain product template.

## Quote / signal

> "the agent there was too eager to work and implement things without respecting the contract"

The user had to retroactively:
- Move an AI-suggested ADR into the approved shelf.
- Add a `must` constraint requiring approved ADRs before structural repo changes.
- Tighten `AGENTS.md` with explicit process guardrails.
- Link `state.md` and `roadmap.md` to the accepted ADR.

The user also suggested making the template stronger by default:
> "Tighten AGENTS.md if you want stricter language. For example, add: 'If the user asks for a structural change, do not execute. Respond with a draft ADR and stop for approval.'"

## Context

- **User persona:** pi-brain adopter / maintainer.
- **Scenario:** The agent was asked to do something involving structural/repo changes and executed before an ADR was approved.
- **Pain:** The contract (ADR-before-implementation) was violated, requiring retroactive cleanup and eroding trust in the agent.

## Pattern

This is a recurring class of failure: agents in coding harnesses default to "implement first" when the user asks for a change. In pi-brain, the contract explicitly forbids this for structural decisions, but the default guardrails are not strong enough to overcome the base impulse.

## Implication

The pi-brain template should make the "stop and shape" stance the default, not an after-market add-on. This affects `AGENTS.md`, the shipped constraints, the `brain-shape` and `brain-setup` skills, and possibly the prompt template.

## Related

- [sources/brain/feedback/eager-implementation-session-snippet.md](../../../../sources/brain/feedback/eager-implementation-session-snippet.md)
- [wiki/brain/ai-suggestions/adrs/stronger-default-implementation-guardrails.md](../ai-suggestions/adrs/stronger-default-implementation-guardrails.md)
