---
title: Split high-complexity registration functions in extensions/pi-brain
description: Enola analysis flagged registerTools (complexity 116), registerCommands (92), and registerHooks (57) as complexity outliers. Refactor each into per-domain registrar helpers to improve testability and reduce the blast radius of future changes.
kind: refinement
status: open
confidence: medium
source: enola analysis of extensions/pi-brain
---

# Split high-complexity registration functions in extensions/pi-brain

## Observation

Latest enola analysis of pi-brain (source: `enola --generate --explain --no-dashboard`) reports four complexity outliers in `extensions/pi-brain`:

- `registerTools` — cyclomatic complexity 116
- `registerCommands` — cyclomatic complexity 92
- `registerHooks` — cyclomatic complexity 57
- `parseYamlLike` — cyclomatic complexity 39

`extensions/pi-brain` also has the highest coupling in the codebase (114 fan-in / 113 fan-out, high criticality).

## Why it matters

Large registration functions are brittle:
- A change to one tool often requires re-reading the entire function.
- Tests are hard to write because setup and assertions are entangled with unrelated registrations.
- The single module becomes a coordination bottleneck.

## Suggested approach

1. **Split `registerTools` in `extensions/pi-brain/tools.ts`**
   - Group tools by domain: `registerIngestTools`, `registerBuildTools`, `registerDiffTools`, `registerStateTools`, `registerEnolaTools`, `registerSearchTools`, etc.
   - Keep `registerTools` as a thin dispatcher that calls each group registrar.

2. **Split `registerCommands` in `extensions/pi-brain/commands.ts`**
   - Group commands by domain similarly: `registerBuildCommands`, `registerEnolaCommands`, `registerTaskCommands`, etc.
   - Keep `registerCommands` as a dispatcher.

3. **Split `registerHooks` in `extensions/pi-brain/hooks.ts`**
   - Separate lifecycle hooks (pre-exit, shutdown) from command/response hooks.

4. **Consider extracting `parseYamlLike` to its own module** if it continues to grow, or simplifying the parser grammar.

## Acceptance

- Each domain registrar is independently unit-testable.
- `npm run validate` passes.
- Enola re-run shows lower complexity for the three registration functions.
- No change to external tool/command/hook behavior.
