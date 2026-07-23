---
kind: record
status: current
confidence: high
decided_by: wiki/brain/adrs/upstream-template-sync.md
implemented_in:
  - extensions/pi-brain.ts
  - skills/brain-update/SKILL.md
  - brain.config.yml
---

# Record — Upstream template sync

## What this is

The current, delivered state of the `/brain:update` command for pulling pi-brain template updates into existing clones.

## Current truth

- `/brain:update` is registered as both a tool (`brain_update`) and a command (`/brain:update`).
- Without `--apply`, it shows a summary of template-owned changes between the clone's `template_version` and the target version.
- With `--apply`, it copies accepted upstream template-owned files and updates `template_version` in `brain.config.yml`.
- If no `--version` is specified, it uses the latest GitHub release.
- Template-owned paths include `AGENTS.md`, `GETTING_STARTED.md`, `README.md`, `extensions/`, `skills/`, `prompts/`, `themes/`, `tools/` subsets, and `.github/`.
- Clone-owned paths (`wiki/<scope>/`, `sources/`, `log/`, `wiki/_state/`, `brain.config.yml` except `template_version`) are never touched.
- `brain.config.yml` includes a `template_version` field.
- `/brain:setup` sets `template_version` for new clones.

## Origin

- Decision: [ADR — Upstream template sync mechanism](../adrs/upstream-template-sync.md)
- Requirement: [PRD — Upstream template sync for pi-brain clones](../prds/upstream-template-sync.md)
- Commitment: [Bet — Build `/brain:update` for safe upstream template sync](../bets/upstream-template-sync.md)

## Implementation

- `extensions/pi-brain.ts` — added `brain_update` tool and `/brain:update` command, plus helper functions for release fetching, cloning, diffing, and applying.
- `skills/brain-update/SKILL.md` — new skill documenting the command.
- `skills/brain/SKILL.md` — added `/brain:update` to the commands list.
- `brain.config.yml` — added `template_version`.
- `extensions/pi-brain.ts` setup command — sets `template_version` for new clones.

## Boundaries

- The first version is all-or-nothing per apply run; per-file accept/skip is deferred to a future improvement.
- Heavy customization of template-owned files will be overwritten on apply; the user must review the diff first.

## Related

- [ADR — Upstream template sync mechanism](../adrs/upstream-template-sync.md)
- [PRD — Upstream template sync for pi-brain clones](../prds/upstream-template-sync.md)
- [Bet — Build `/brain:update` for safe upstream template sync](../bets/upstream-template-sync.md)
