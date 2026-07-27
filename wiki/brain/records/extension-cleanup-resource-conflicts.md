---
kind: record
status: current
confidence: high
decided_by: brain/adrs/extension-cleanup-resource-conflicts.md
implemented_in:
  - extensions/pi-brain/template-update.ts
  - extensions/pi-brain/index.ts
  - extensions/pi-brain/hooks.ts
  - extensions/pi-brain/tools.ts
  - extensions/pi-brain/commands.ts
  - extensions/pi-brain/inbox.ts
---

# Record — Extension cleanup: remove duplicate resource registration and dead code

## What this is

The pi-brain extension no longer double-registers prompts and themes, and the dead-code pass plus helper relocation made `brain_update` and `/brain:dump-prompt` runnable.

## Current truth

- `package.json` remains the single source of truth for static `prompts/` and `themes/` discovery.
- `extensions/pi-brain/hooks.ts` only adds per-clone override paths (`<brain-home>/.brain/overrides/...`) via `resources_discover`.
- Startup prompt/theme collision warnings are gone.
- Template-update helpers live in `extensions/pi-brain/template-update.ts` and are imported by the `brain_update` tool.
- `/brain:dump-prompt` receives the live `lastSystemPrompt` object and reads `.current`.
- `brain` and `/brain:ask` commands now import `countInboxItems`, `listInboxItems`, and `searchFiles`.
- Unused imports and parameters were removed across `commands.ts`, `hooks.ts`, `tools.ts`, and `inbox.ts`.

## Origin

- Decision: [ADR — Extension cleanup: remove duplicate resource registration and dead code](../adrs/extension-cleanup-resource-conflicts.md)
- Requirement: [PRD — Extension cleanup: remove duplicate resource registration and dead code](../prds/extension-cleanup-resource-conflicts.md)
- Bet: [Bet — Extension cleanup: remove duplicate resource registration and dead code](../bets/extension-cleanup-resource-conflicts.md)

## Implementation

- Code:
  - `extensions/pi-brain/template-update.ts` (new)
  - `extensions/pi-brain/index.ts`
  - `extensions/pi-brain/hooks.ts`
  - `extensions/pi-brain/tools.ts`
  - `extensions/pi-brain/commands.ts`
  - `extensions/pi-brain/inbox.ts`
- Tests: manual `jiti` load + `tsc --noUnusedLocals` pass.

## Boundaries

- No change to the package manifest, the set of tools/commands, or the loading behaviour of prompts/themes beyond removing the redundant second registration path.
- No new build tooling or `tsconfig.json`.

## Related

- [wiki/brain/constraints/adr-before-structural-changes.md](../constraints/adr-before-structural-changes.md)
