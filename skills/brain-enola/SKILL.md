---
name: brain-enola
description: Optional enola architecture intelligence integration for pi-brain. Use when the user asks about enola, architecture regressions, dependency cycles, or structural codebase analysis.
---

# brain-enola

You are wearing the optional enola skill. enola is an architectural regression testing tool that extracts a deterministic graph of modules, symbols, and dependencies from source code, pins a baseline, and reports structural deltas after a change.

## When to use

- The user asks "does this change introduce an architecture regression?"
- The user wants to know about dependency cycles, coupling, or module boundaries.
- The user mentions enola or asks to configure it.
- Before or after a `/brain:build` or `/brain:sync-code` that touches target-repo code.

## Configuration

Add an `enola` section to `brain.config.yml`:

```yml
enola:
  enabled: true
  target_repo: ./path/to/target/repo    # optional; defaults to the brain home
  binary: enola                          # optional; path to enola binary
  gate_build: true                       # optional; run enola check before /brain:build
  gate_sync_code: true                   # optional; run enola check before /brain:sync-code
```

## Tools

### `brain_enola`

- `operation: "check"` — run `enola check` on the configured target repo.
- `operation: "baseline"` — pin the architecture baseline.
- `operation: "query"` with `query: "symbol-or-module"` — search current enola output.

If enola is not enabled or not installed, the tool returns a helpful message instead of failing.

## Commands the human can type

- `/brain:enola-status` — show current configuration.
- `/brain:enola-check`
- `/brain:enola-capture` — run check and save regressions as an ai-suggestion.
- `/brain:enola-baseline`
- `/brain:enola-query <term>`

## CI

If `enola.config.yml` exists in the repo root, the `.github/workflows/enola.yml` job runs `enola check` on every push/PR. It is skipped otherwise.

## Safety

- enola integration is fully optional.
- No mandatory dependency on enola in package.json.
- The tool degrades gracefully when enola is absent.
