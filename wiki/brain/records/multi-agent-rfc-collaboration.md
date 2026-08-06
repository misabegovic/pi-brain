---
kind: record
status: delivered
scope: brain
sources:
  - wiki/brain/bets/multi-agent-rfc-collaboration.md
  - wiki/brain/prds/multi-agent-rfc-collaboration.md
  - wiki/brain/adrs/multi-agent-rfc-collaboration.md
confidence: high
enola_intent:
  page:
    type: record
    status: delivered
    scope:
    - brain
    anchors:
    - repo: pi-brain
      path: wiki/brain/adrs/multi-agent-rfc-collaboration.md
    - repo: pi-brain
      path: wiki/brain/bets/multi-agent-rfc-collaboration.md
    - repo: pi-brain
      path: wiki/brain/prds/multi-agent-rfc-collaboration.md
---

# Record — Multi-agent RFC collaboration

## What was delivered

An append-only RFC contribution system via `/brain:rfc-contribute`. Humans and agents can add attributed contributions to an RFC without rewriting existing content.

## Implementation

- `extensions/pi-brain/rfc-contribute.ts` — append-only contribution handler.
- `extensions/pi-brain/commands.ts` — registered `/brain:rfc-contribute`.
- Added `skills/brain-rfc-contribute/SKILL.md`.

## Verification

- Command registered and input validation in place.
- No RFCs currently exist to exercise it end-to-end.

## Known limitations

- The feature has not been exercised against a real RFC yet.

## Pull request

- PR #12: https://github.com/misabegovic/pi-brain/pull/12

## Related

- [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- [wiki/brain/adrs/multi-agent-rfc-collaboration.md](../adrs/multi-agent-rfc-collaboration.md)
- [wiki/brain/prds/multi-agent-rfc-collaboration.md](../prds/multi-agent-rfc-collaboration.md)
- [wiki/brain/bets/multi-agent-rfc-collaboration.md](../bets/multi-agent-rfc-collaboration.md)
