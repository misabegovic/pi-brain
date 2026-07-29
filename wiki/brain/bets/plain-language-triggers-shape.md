---
kind: bet
status: accepted
confidence: medium
appetite: small
adr: wiki/brain/adrs/plain-language-triggers-shape.md
---

# Bet — Plain-language shape requests default to forward mode

## What we are betting on

That updating the `brain` and `brain-shape` skills to treat plain-language PRD/ADR/epic/bet requests as `/brain:shape` forward mode will reduce friction without weakening the approval gates.

## Why now

The user repeatedly expects plain-language requests like "write a PRD" or "shape this" to produce real commitment-class artifacts, not AI-suggested drafts. Fixing this makes the brain contract feel responsive rather than bureaucratic.

## Appetite

Small. Update skill instructions and verify the agent routes trigger phrases correctly.

## Success looks like

- Saying "write a PRD for X" starts `/brain:shape` forward mode and produces `wiki/<scope>/prds/X.md`.
- The agent still pauses at phase-end for approval.
- Phrases like "draft a PRD" or "suggest an ADR" still go to `ai-suggestions/`.
- Constraints are still read and `must` violations are still flagged.

### Signals to cut losses

- The agent misclassifies speculative ideas as shape requests.
- Users feel the agent is too eager to commit.

## Related

- [ADR — Plain-language shape requests default to forward mode](../adrs/plain-language-triggers-shape.md)
- `skills/brain-shape/SKILL.md`
- `skills/brain/SKILL.md`
