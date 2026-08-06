---
kind: decision
status: accepted
confidence: medium
enola_intent:
  page:
    type: decision
    status: accepted
---

# ADR — Plain-language shape requests default to forward mode

## Context

Users often ask for commitment-class artifacts in plain language: "write a PRD for X", "we need an ADR for Y", "shape this bet", or "turn this pitch into a PRD and ADR". The current `brain-shape` skill treats these as drafting requests and writes the output to `wiki/<scope>/ai-suggestions/`, requiring the user to explicitly ask for `/brain:shape` to get the real approved shelves.

This creates friction. The user expects their plain-language request to start the supervised shape workflow, not to produce a low-confidence suggestion.

## Decision

Plain-language requests for PRDs, ADRs, epics, or bets default to `/brain:shape` forward mode. The agent writes to the real shelves (`wiki/<scope>/{prds,adrs,epics,bets}/`) and pauses at phase-end approval gates, just as if the user had typed `/brain:shape <scope> <pitch>`.

AI-suggestions are reserved for cases where the agent initiates the draft on its own, or where the user explicitly calls it a draft, suggestion, or idea.

### Trigger phrases

The agent should treat these as shape requests:

- "write a PRD for X" / "PRD for X"
- "write an ADR for X" / "ADR for X" / "record a decision about X"
- "shape X" / "turn this into a PRD/ADR/bet"
- "create an epic for X"
- "make this a bet"
- "yes, do all" / "yes, shape it" after a pitch

### What still goes to `ai-suggestions/`

- Agent-initiated drafts in auto mode.
- User says "draft a PRD", "suggest an ADR", "what do you think about X?", or "sketch an idea".
- Cross-cutting or uncertain commitments where the agent explicitly recommends an RFC first.

### Safeguards remain

- Phase-end approval gates still apply.
- The agent must read constraints and flag `must` violations.
- `confidence:` starts at `low` and cannot self-promote.
- The user can still say "put this in ai-suggestions" to override.

## Alternatives considered

1. **Keep current behavior.** Plain-language requests produce `ai-suggestions/` unless `/brain:shape` is explicitly invoked.
   - *Rejected:* it contradicts user expectations and adds friction.

2. **Plain-language requests skip approval gates.** The agent writes directly to approved shelves without pausing.
   - *Rejected:* removes the human gate and violates the confidence/contract rules.

3. **Plain-language requests default to forward mode with approval gates.** (Chosen.)
   - *Pros:* matches user intent, preserves safeguards, reduces back-and-forth.
   - *Cons:* the agent must be good at recognizing shape intent; misclassification could put a draft in the wrong shelf.

## Consequences

- The `brain-shape` skill and `brain` skill need updated trigger language.
- The agent becomes more eager to use `/brain:shape`, but still stops for approval.
- Users get PRD/ADR/bet artifacts in the right shelves from plain-language requests.

## Related

- [wiki/brain/bets/plain-language-triggers-shape.md](../bets/plain-language-triggers-shape.md)
- `skills/brain-shape/SKILL.md`
- `skills/brain/SKILL.md`
- [wiki/brain/constraints/adr-before-structural-changes.md](../constraints/adr-before-structural-changes.md)
