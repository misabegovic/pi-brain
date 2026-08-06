---
kind: bet
status: accepted
confidence: medium
appetite: medium
prd: wiki/brain/prds/structured-intent-and-build.md
adr: wiki/brain/adrs/structured-intent-and-build.md
enola_intent:
  page:
    type: bet
    status: accepted
---

# Bet — Structured intent and `/brain:build`

## What we are betting on

That adding YAML intent blocks to PRDs/ADRs and a `/brain:build` command makes intent the source of truth for code, starting with TypeScript data models.

## Why now

The autonomous refinement protocol and multi-agent collaboration make intent richer and more inspectable. The next step is to make intent executable: turn approved decisions into generated code.

## Appetite

Medium. One focused build phase: block extraction, one renderer (TypeScript types), and `/brain:build` command wiring.

## Success looks like

- PRD/ADR templates include intent block examples.
- `/brain:build brain types` reads approved PRDs/ADRs in scope and emits TypeScript interfaces.
- Generated files cite their source intent.
- Output lands in a draft location, not auto-committed.
- Users can review generated output and choose to apply it.

### Signals to cut losses

- The block format feels too verbose or too rigid.
- Generated TypeScript is frequently wrong or incomplete.
- Users prefer prose-only PRDs and ignore the blocks.
- Drift between blocks and prose becomes common.

## Related

- [PRD](../prds/structured-intent-and-build.md)
- [ADR](../adrs/structured-intent-and-build.md)
- Parent epic: [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- Prior bets:
  - [wiki/brain/bets/autonomous-refinement-protocol.md](../bets/autonomous-refinement-protocol.md)
  - [wiki/brain/bets/multi-agent-intent-collaboration.md](../bets/multi-agent-intent-collaboration.md)
