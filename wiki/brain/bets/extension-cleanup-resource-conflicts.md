---
kind: bet
status: accepted
confidence: medium
appetite: small
prd: brain/prds/extension-cleanup-resource-conflicts.md
adr: brain/adrs/extension-cleanup-resource-conflicts.md
enola_intent:
  page:
    type: bet
    status: accepted
---

# Bet — Extension cleanup: remove duplicate resource registration and dead code

## What we are betting on

We can clean up the extension's dead code and fix the double prompt/theme registration in a single small PR without changing behaviour or adding build tooling.

## Why now

The startup collisions are visible every session and make the extension look broken. The `brain_update` fallback bug is latent but real; fixing it while we already have the files open is cheap.

## Appetite

Small — one focused build session.

## Success looks like

- The prompt/theme collision warnings no longer appear on startup.
- `tsc --noUnusedLocals` reports no unused imports or variables in the touched files.
- `brain_update` can resolve all of its helper functions without runtime errors.
- All existing `/brain:*` commands and tools still behave the same.

## Signals to cut losses

- If removing the base paths from `resources_discover` causes prompts or themes to stop loading in any supported install path, we revert and revisit.
- If the cleanup starts pulling in wider refactors (e.g. `tsconfig.json`, tool registration patterns), we park those for a separate bet.

## Related

- [PRD](../prds/extension-cleanup-resource-conflicts.md)
- [ADR](../adrs/extension-cleanup-resource-conflicts.md)
- [Record](../records/extension-cleanup-resource-conflicts.md)
- [wiki/brain/constraints/adr-before-structural-changes.md](../constraints/adr-before-structural-changes.md)
