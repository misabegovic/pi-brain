---
kind: decision
status: accepted
confidence: medium
---

# ADR — Extension cleanup: remove duplicate resource registration and dead code

## Context

`package.json` declares the pi-brain package resources explicitly:

```json
"pi": {
  "extensions": ["./extensions/pi-brain/index.ts"],
  "skills": ["./skills"],
  "prompts": ["./prompts"],
  "themes": ["./themes"]
}
```

Pi's package loader therefore already indexes `prompts/*.md` and `themes/*.json` as package resources. The extension's `resources_discover` hook then returns the same directories, causing the startup collisions we see (source: `package.json`; source: `extensions/pi-brain/hooks.ts`).

A separate hygiene issue surfaced while preparing this fix: `extensions/pi-brain/tools.ts` calls `updateTemplateVersion`, `readTemplateVersion`, `getLatestTemplateVersion`, `cloneUpstreamTemplate`, `diffTemplatePaths`, and `applyTemplateChange`, but those functions are defined in `extensions/pi-brain/index.ts` and are not exported or imported. At runtime the `brain_update` tool path would throw `ReferenceError` if the GitHub fallback is exercised (source: `extensions/pi-brain/tools.ts`; source: `extensions/pi-brain/index.ts`).

This work is a structural change to extension code, so it must go through the ADR gate per `wiki/brain/constraints/adr-before-structural-changes.md`.

## Decision

1. Rely on `package.json` for static prompt/theme discovery and stop returning the base `prompts/` and `themes/` directories from the `resources_discover` hook. Keep only the `.brain/overrides/...` dynamic paths.
2. Remove the dead imports and unused parameters surfaced by `tsc --noUnusedLocals`.
3. Move the template-update helper functions into a new module `extensions/pi-brain/template-update.ts` and import them from `extensions/pi-brain/tools.ts`.

## Alternatives considered

1. **Keep both registration paths and add deduplication logic in the hook.**
   - Rejected: it hides the real problem and adds unnecessary runtime path bookkeeping. The package manifest is the correct source of truth for static resources.

2. **Remove the `pi.prompts`/`pi.themes` entries from `package.json` and keep only the hook.**
   - Rejected: the manifest is the standard pi package mechanism. Removing it would break discovery when the package is installed globally and would make the extension behave differently when loaded via `-e` versus as a package.

3. **Inline the update helpers into `tools.ts`.**
   - Rejected: `index.ts` still needs some of the same data for `TEMPLATE_OWNED_PATHS`. Keeping them in a shared module avoids duplication and keeps the tool file focused.

4. **Do nothing.**
   - Rejected: the collisions are noisy, and the `brain_update` fallback is broken. Both degrade trust in the extension.

## Consequences

- Startup prompt/theme collision warnings disappear.
- The extension source is smaller and easier to read.
- The GitHub-fallback path of `brain_update` becomes runnable.
- Any future per-clone prompt/theme overrides continue to work via `.brain/overrides/...`.

## Related

- [wiki/brain/prds/extension-cleanup-resource-conflicts.md](../prds/extension-cleanup-resource-conflicts.md)
- [wiki/brain/bets/extension-cleanup-resource-conflicts.md](../bets/extension-cleanup-resource-conflicts.md)
- [wiki/brain/records/extension-cleanup-resource-conflicts.md](../records/extension-cleanup-resource-conflicts.md)
- [wiki/brain/constraints/adr-before-structural-changes.md](../constraints/adr-before-structural-changes.md)
- `package.json`
- `extensions/pi-brain/hooks.ts`
- `extensions/pi-brain/tools.ts`
- `extensions/pi-brain/index.ts`
