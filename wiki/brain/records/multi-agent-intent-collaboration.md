---
kind: record
status: delivered
scope: brain
sources:
  - wiki/brain/bets/multi-agent-intent-collaboration.md
  - wiki/brain/prds/multi-agent-intent-collaboration.md
  - wiki/brain/adrs/multi-agent-intent-collaboration.md
confidence: high
enola_intent:
  page:
    type: record
    status: delivered
    scope:
    - brain
    anchors:
    - repo: pi-brain
      path: wiki/brain/adrs/multi-agent-intent-collaboration.md
    - repo: pi-brain
      path: wiki/brain/bets/multi-agent-intent-collaboration.md
    - repo: pi-brain
      path: wiki/brain/prds/multi-agent-intent-collaboration.md
---

# Record — Multi-agent intent collaboration

## What was delivered

A `/brain:collaborate` command that delegates intent work to specialized subagents: PM, Tech Lead, Developer, and Security Reviewer. Subagents run as isolated `pi` subprocesses and return structured findings that are merged into a single collaboration report.

## Implementation

- `extensions/pi-brain/collaboration.ts` — parallel/chain subagent runner.
- `personas/agents/brain-*.md` — four project-local subagent personas.
- `extensions/pi-brain/commands.ts` — registered `/brain:collaborate`.
- Added `skills/brain-collaborate/SKILL.md`.

## Verification

- All four subagents load correctly.
- Command registered in the extension factory.

## Pull request

- PR #12: https://github.com/misabegovic/pi-brain/pull/12

## Related

- [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- [wiki/brain/adrs/multi-agent-intent-collaboration.md](../adrs/multi-agent-intent-collaboration.md)
- [wiki/brain/prds/multi-agent-intent-collaboration.md](../prds/multi-agent-intent-collaboration.md)
- [wiki/brain/bets/multi-agent-intent-collaboration.md](../bets/multi-agent-intent-collaboration.md)
