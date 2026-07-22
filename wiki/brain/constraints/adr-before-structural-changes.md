---
kind: constraint
status: active
confidence: medium
severity: must
category: workflow
scope: global
---

# Constraint — ADR before structural changes

## Statement

Any structural change to the pi-brain home, the maintained project repositories, or the product template itself MUST have an approved ADR before implementation begins.

"Structural change" includes, but is not limited to:
- Changes to repository layout or top-level directories.
- Changes to `brain.config.yml`, `.github/workflows/`, or CI configuration.
- Changes to `AGENTS.md`, skills, prompts, or extension code that alter the agent's contract.
- Onboarding or removing a maintained repository.
- Converting a repository into a pi-brain clone.

## Rationale

pi-brain is a contract-first knowledge base. If the agent implements structural decisions before they are recorded and approved, the corpus drifts from reality and the user loses trust. This constraint makes the contract enforceable during `/brain:shape` and gives both the user and the agent a clear place to point when something is being decided too quickly.

## Applies to

- ADRs, PRDs, epics, and bets in scope: `global`
- Categories: workflow, architecture

## Examples

- **Compliant:** A user asks to convert a repo to a pi-brain clone. The agent drafts an ADR in `ai-suggestions/`, the user approves it, and only then files are moved.
- **Violation:** A user asks to restructure `wiki/` and the agent moves directories before an ADR is accepted.

## Related

- [wiki/brain/adrs/stronger-default-implementation-guardrails.md](../adrs/stronger-default-implementation-guardrails.md)
- [AGENTS.md](../../../../AGENTS.md)
