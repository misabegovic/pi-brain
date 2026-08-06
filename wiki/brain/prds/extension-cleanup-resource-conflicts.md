---
kind: initiative
status: living
confidence: medium
appetite: small
team: pi-brain
repos: [pi-brain]
enola_intent:
  page:
    type: initiative
    status: living
---

# PRD — Extension cleanup: remove duplicate resource registration and dead code

## Problem

The pi-brain extension currently produces noisy prompt/theme registration collisions on startup:

```
[Prompt conflicts]
  "brain-autonomy" collision:
    ✓ extension:index (temp) ~/projects/pi-brain/prompts/brain-autonomy.md
    ✗ extension:index (temp) ~/projects/pi-brain/prompts/brain-autonomy.md (skipped)
```

The same file is registered twice because `package.json` already declares `pi.prompts` and `pi.themes`, and the extension's `resources_discover` hook adds the same directories again (source: `package.json`; source: `extensions/pi-brain/hooks.ts`).

While investigating that, a pass with `tsc --noUnusedLocals` surfaced a wider layer of dead code in `extensions/pi-brain/`: unused imports, unused parameters, and — more seriously — helper functions in `extensions/pi-brain/index.ts` that are referenced from `extensions/pi-brain/tools.ts` but never imported, which means the `brain_update` tool path is currently broken at runtime (source: `extensions/pi-brain/tools.ts`; source: `extensions/pi-brain/index.ts`).

## Appetite

Small. This is a tidy-up and bug-fix pass, not a rewrite.

## Solution

1. **Stop double-registering resources.** Remove the base package-root `prompts/` and `themes/` paths from the `resources_discover` hook in `extensions/pi-brain/hooks.ts`. Keep the `.brain/overrides/...` paths so per-clone overrides still work.
2. **Remove dead imports and variables.** Delete unused imports/parameters reported by the compiler (e.g. unused `node:fs/promises` imports, unused `Type`/`ExtensionContext` type imports, unused helper imports).
3. **Fix the broken `brain_update` references.** Move the template-update helpers (`getLatestTemplateVersion`, `cloneUpstreamTemplate`, `readTemplateVersion`, `updateTemplateVersion`, `diffTemplatePaths`, `applyTemplateChange`) from `extensions/pi-brain/index.ts` into a dedicated module and import them from the tool that uses them.
4. **Verify.** Run the extension load path and confirm the prompt/theme collisions disappear, and that `brain_update` can resolve its dependencies.

## No-gos

- No change to the package manifest in `package.json`.
- No change to the set of registered tools, commands, or hooks.
- No new build tooling or dev dependencies.
- No functional change to how prompts/themes are loaded — only the redundant second path is removed.

## Rabbit holes

- Turning this into a full TypeScript strict-mode pass or adding `tsconfig.json`.
- Refactoring the tool/command registration patterns beyond what is needed to fix the dead code.
- Trying to deduplicate via the extension API rather than simply not registering the same path twice.

## Related

- [wiki/brain/adrs/extension-cleanup-resource-conflicts.md](../adrs/extension-cleanup-resource-conflicts.md)
- [wiki/brain/bets/extension-cleanup-resource-conflicts.md](../bets/extension-cleanup-resource-conflicts.md)
- [wiki/brain/records/extension-cleanup-resource-conflicts.md](../records/extension-cleanup-resource-conflicts.md)
- [wiki/brain/constraints/adr-before-structural-changes.md](../constraints/adr-before-structural-changes.md)
- `package.json`
- `extensions/pi-brain/hooks.ts`
- `extensions/pi-brain/tools.ts`
- `extensions/pi-brain/commands.ts`
- `extensions/pi-brain/index.ts`
