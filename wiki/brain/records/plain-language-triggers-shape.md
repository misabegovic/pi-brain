---
kind: record
status: current
confidence: high
decided_by: wiki/brain/adrs/plain-language-triggers-shape.md
implemented_in:
  - skills/brain/SKILL.md
  - skills/brain-shape/SKILL.md
---

# Record — Plain-language shape requests default to forward mode

## What this is

The current, approved behavior for how the agent handles plain-language requests for PRDs, ADRs, epics, and bets.

## Current truth

- Plain-language requests such as "write a PRD for X", "ADR for Y", "shape this", or "make this a bet" trigger `/brain:shape` forward mode.
- The agent writes to the real shelves (`wiki/<scope>/{prds,adrs,epics,bets}/`), not `ai-suggestions/`.
- Phase-end approval gates still apply.
- Constraints are still read and `must` violations still block acceptance.
- `ai-suggestions/` is reserved for agent-initiated drafts, auto-mode output, or explicit user requests for a draft/suggestion.

## Origin

- Decision: [ADR — Plain-language shape requests default to forward mode](../adrs/plain-language-triggers-shape.md)
- Commitment: [Bet — Plain-language shape requests default to forward mode](../bets/plain-language-triggers-shape.md)

## Implementation

- `skills/brain/SKILL.md` — added the plain-language shape rule.
- `skills/brain-shape/SKILL.md` — clarified that plain-language requests are supervised forward-mode requests, not ai-suggestions.

## Related

- [skills/brain/SKILL.md](../../../../skills/brain/SKILL.md)
- [skills/brain-shape/SKILL.md](../../../../skills/brain-shape/SKILL.md)
